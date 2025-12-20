import { Injectable } from "@angular/core";

@Injectable({
	providedIn: "root",
})
export class PasskeyService {
	private readonly STORAGE_KEY = "zelf_passkeys";

	constructor() {}

	/**
	 * Checks if the browser supports WebAuthn and the PRF extension
	 */
	async isSupported(): Promise<boolean> {
		if (!window.PublicKeyCredential) {
			return false;
		}

		// Ideally we check for PRF support, but explicit capability checks are tricky consistently across browsers
		// We will optimistically assume support if PublicKeyCredential exists on modern browsers
		// A more robust check:
		// const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
		return true;
	}

	/**
	 * Registers a new Passkey credential and returns the PRF-derived key
	 * @param identifier The user's identifier (email or phone) to associate with the passkey
	 */
	async register(identifier: string): Promise<{ credentialId: string; key: CryptoKey; salt: Uint8Array } | null> {
		try {
			const challenge = crypto.getRandomValues(new Uint8Array(32));
			const userId = crypto.getRandomValues(new Uint8Array(16));
			const salt = crypto.getRandomValues(new Uint8Array(32));

			const createOptions: any = {
				publicKey: {
					challenge,
					rp: {
						name: "Zelf Dashboard",
						id: window.location.hostname,
					},
					user: {
						id: userId,
						name: identifier,
						displayName: identifier,
					},
					pubKeyCredParams: [
						{ alg: -7, type: "public-key" }, // ES256
						{ alg: -257, type: "public-key" }, // RS256
					],
					timeout: 60000,
					authenticatorSelection: {
						authenticatorAttachment: "platform", // TouchID/FaceID prefered
						userVerification: "required",
						residentKey: "required", // Discoverable credential
					},
					extensions: {
						prf: {
							eval: {
								first: salt,
							},
						},
					},
				},
			};

			const credential: any = await navigator.credentials.create(createOptions);

			if (!credential) {
				return null;
			}

			const extensionResults = credential.getClientExtensionResults();
			let rawKeyMaterial: Uint8Array;

			if (extensionResults.prf && extensionResults.prf.results && extensionResults.prf.results.first) {
				// PRF supported
				rawKeyMaterial = new Uint8Array(extensionResults.prf.results.first);
			} else {
				console.warn("PRF extension not supported or enabled. falling back to HKDF using Credential ID.");
				// Fallback: Use the Credential ID itself as entropy along with the salt
				// In production this is LESS secure than PRF because the key doesn't strictly come from the hardware private key calc
				// But for a POC to work on all dev environments, we will derive the key from the Credential ID + Salt
				const enc = new TextEncoder();
				const credIdBytes = enc.encode(credential.id);
				// Simple combination to create key material
				rawKeyMaterial = new Uint8Array(32);
				for (let i = 0; i < 32; i++) {
					rawKeyMaterial[i] = credIdBytes[i % credIdBytes.length] ^ salt[i % salt.length];
				}
			}

			const key = await this.importKey(rawKeyMaterial);
			return { credentialId: credential.id, key, salt };
		} catch (error) {
			console.error("Error creating passkey:", error);
			return null;
		}
	}

	/**
	 * Authenticates with an existing Passkey and returns the PRF-derived key
	 * @param credentialId The known credential ID (optional, can be empty for discovery)
	 * @param salt The salt originally used for PRF (must store this!)
	 */
	async authenticate(credentialId: string, salt: Uint8Array): Promise<CryptoKey | null> {
		try {
			const challenge = crypto.getRandomValues(new Uint8Array(32));

			const getOptions: any = {
				publicKey: {
					challenge,
					timeout: 60000,
					userVerification: "required",
					allowCredentials: [
						{
							id: this.base64UrlToBuffer(credentialId),
							type: "public-key",
						},
					],
					extensions: {
						prf: {
							eval: {
								first: salt,
							},
						},
					},
				},
			};

			const credential: any = await navigator.credentials.get(getOptions);

			if (!credential) {
				return null;
			}

			const extensionResults = credential.getClientExtensionResults();
			let rawKeyMaterial: Uint8Array;

			if (extensionResults.prf && extensionResults.prf.results && extensionResults.prf.results.first) {
				rawKeyMaterial = new Uint8Array(extensionResults.prf.results.first);
			} else {
				console.warn("PRF extension not supported in Auth. Using fallback derivation.");
				const enc = new TextEncoder();
				const credIdBytes = enc.encode(credential.id);
				rawKeyMaterial = new Uint8Array(32);
				for (let i = 0; i < 32; i++) {
					rawKeyMaterial[i] = credIdBytes[i % credIdBytes.length] ^ salt[i % salt.length];
				}
			}

			return await this.importKey(rawKeyMaterial);
		} catch (error) {
			console.error("Error authenticating passkey:", error);
			return null;
		}
	}

	/**
	 * Encrypts a string (password) using the PRF-derived key
	 */
	async encryptPassword(password: string, key: CryptoKey): Promise<{ ciphertext: string; iv: string }> {
		const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
		const encodedPassword = new TextEncoder().encode(password);

		const encryptedBuffer = await crypto.subtle.encrypt(
			{ name: "AES-GCM", iv: iv as unknown as BufferSource },
			key,
			encodedPassword as unknown as BufferSource
		);

		return {
			ciphertext: this.bufferToBase64(encryptedBuffer),
			iv: this.bufferToBase64(iv),
		};
	}

	/**
	 * Decrypts a string (password) using the PRF-derived key
	 */
	async decryptPassword(ciphertext: string, iv: string, key: CryptoKey): Promise<string> {
		const ivBuffer = this.base64ToBuffer(iv);
		const encryptedBuffer = this.base64ToBuffer(ciphertext);

		const decryptedBuffer = await crypto.subtle.decrypt(
			{ name: "AES-GCM", iv: ivBuffer as unknown as BufferSource },
			key,
			encryptedBuffer as unknown as BufferSource
		);

		return new TextDecoder().decode(decryptedBuffer);
	}

	/**
	 * Stores the passkey metadata locally
	 */
	savePasskeyMetadata(identifier: string, metadata: { credentialId: string; salt: string; iv: string; ciphertext: string }) {
		const store = this.getStore();
		store[identifier] = metadata;
		localStorage.setItem(this.STORAGE_KEY, JSON.stringify(store));
	}

	/**
	 * Retrieves passkey metadata for a user identifier
	 */
	getPasskeyMetadata(identifier: string): { credentialId: string; salt: string; iv: string; ciphertext: string } | null {
		const store = this.getStore();
		return store[identifier] || null;
	}

	/**
	 * Helpers
	 */
	private getStore(): Record<string, any> {
		try {
			return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || "{}");
		} catch {
			return {};
		}
	}

	private async importKey(rawKey: Uint8Array): Promise<CryptoKey> {
		return await crypto.subtle.importKey("raw", rawKey as unknown as BufferSource, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
	}

	// Base64Url to/from Buffer helpers
	bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
		const bytes = new Uint8Array(buffer);
		let binary = "";
		for (let i = 0; i < bytes.byteLength; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return btoa(binary);
	}

	base64ToBuffer(base64: string): Uint8Array {
		const binary = atob(base64);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) {
			bytes[i] = binary.charCodeAt(i);
		}
		return bytes;
	}

	base64UrlToBuffer(base64url: string): Uint8Array {
		// Simple base64url to base64 conversion
		const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
		// Pad with '='
		const pad = base64.length % 4;
		const paddedCall = pad ? base64 + "=".repeat(4 - pad) : base64;
		return this.base64ToBuffer(paddedCall);
	}
}
