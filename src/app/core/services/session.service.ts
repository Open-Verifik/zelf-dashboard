import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { firstValueFrom, Observable, ReplaySubject, tap } from "rxjs";
import { environment } from "../../../environments/environment";

export interface CreateSessionRequest {
	identifier: string;
	isWebExtension?: boolean;
	type?: "createWallet" | "decryptWallet" | "importWallet" | "general";
	domain?: string;
}

export interface SessionTokenResponse {
	token: string;
	activatedAt: number;
	expiresAt: number;
}

export interface Session {
	_id: string;
	identifier: string;
	domain?: string;
	clientIP: string;
	isWebExtension: boolean;
	status: "active" | "used";
	type: "createWallet" | "decryptWallet" | "importWallet" | "general";
	activatedAt: string;
	globalCount: number;
	searchCount: number;
	leaseCount: number;
	decryptCount: number;
	previewCount: number;
	completedAt?: string;
	createdAt: string;
	updatedAt: string;
}

export interface GetPublicKeyRequest {
	identifier: string;
	name?: string;
	email?: string;
}

export interface GetPublicKeyResponse {
	data: {
		publicKey: string;
		sessionId: string;
	};
}

export interface DecryptContentRequest {
	message: string;
	sessionId: string;
}

export interface DecryptContentResponse {
	data: {
		decryptedContent: string;
		sessionId: string;
	};
}

export interface ApiResponse<T> {
	data: T;
}

@Injectable({ providedIn: "root" })
export class SessionService {
	private _httpClient = inject(HttpClient);
	private _sessionToken: string | null = null;

	// -----------------------------------------------------------------------------------------------------
	// @ Accessors
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Get session token from localStorage
	 */
	getSessionToken(): string | null {
		if (!this._sessionToken) {
			this._sessionToken = localStorage.getItem("sessionToken");
		}
		return this._sessionToken;
	}

	/**
	 * Set session token
	 */
	setSessionToken(token: string): void {
		this._sessionToken = token;

		localStorage.setItem("sessionToken", token);
	}

	/**
	 * Clear session token
	 */
	clearSessionToken(): void {
		this._sessionToken = null;
		localStorage.removeItem("sessionToken");
	}

	// -----------------------------------------------------------------------------------------------------
	// @ Public methods
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Create a new session
	 * @param sessionData - Session data including identifier, type, etc.
	 */
	createSession(sessionData: CreateSessionRequest): Observable<ApiResponse<SessionTokenResponse>> {
		return this._httpClient.post<ApiResponse<SessionTokenResponse>>(`${environment.apiUrl}/api/sessions`, sessionData).pipe(
			tap((response) => {
				if (response && response.data && response.data.token) {
					// Store the JWT token for API calls
					this.setSessionToken(response.data.token);
					console.log("Session token stored:", response.data.token.substring(0, 20) + "...");
				}
			})
		);
	}

	/**
	 * Get public key for a session
	 * @param params - Parameters including identifier, name, email
	 */
	getPublicKey(params: GetPublicKeyRequest): Observable<GetPublicKeyResponse> {
		return this._httpClient.get<GetPublicKeyResponse>(`${environment.apiUrl}/api/sessions/yek-cilbup`, { params: params as any });
	}

	/**
	 * Decrypt content using session
	 * @param decryptData - Decryption data including message and sessionId
	 */
	decryptContent(decryptData: DecryptContentRequest): Observable<DecryptContentResponse> {
		return this._httpClient.post<DecryptContentResponse>(`${environment.apiUrl}/api/sessions/decrypt-content`, decryptData);
	}

	/**
	 * Generate a unique session identifier
	 */
	generateSessionIdentifier(): string {
		const timestamp = Date.now();
		const random = Math.random().toString(36).substring(2, 9);
		return `session_${timestamp}_${random}`;
	}

	/**
	 * Check if a session token exists
	 */
	hasSessionToken(): boolean {
		return !!this.getSessionToken();
	}

	/**
	 * Initialize session for payment routes
	 * Creates a new session if one doesn't exist
	 */
	async initializePaymentSession(): Promise<ApiResponse<SessionTokenResponse> | null> {
		// Check if we already have a session token
		if (this.hasSessionToken()) {
			// Session already exists, return null to indicate we're ready
			console.log("Existing session token found");
			return null;
		}

		// Create a new session
		try {
			const identifier = this.generateSessionIdentifier();
			console.log("Creating new session with identifier:", identifier);
			const response = await firstValueFrom(
				this.createSession({
					identifier,
					isWebExtension: false,
					type: "general",
				})
			);

			console.log("Session created:", response);
			return response || null;
		} catch (error) {
			console.error("Failed to create session:", error);
			return null;
		}
	}
}
