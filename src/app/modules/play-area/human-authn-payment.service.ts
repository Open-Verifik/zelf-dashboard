import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { AuthService } from "app/core/auth/auth.service";

/**
 * Per-play-area-page payment proof for Human Authn APIs (402 + x-payment-* headers).
 * Provide at component level so each screen has isolated tx state.
 */
@Injectable()
export class HumanAuthnPaymentService {
	paymentProcessing = false;
	paymentTxHash = "";
	paymentChain = "solana";
	walletAddress = "";
	paymentRequired = false;
	paymentDetails: unknown = null;

	constructor(
		private http: HttpClient,
		private authService: AuthService
	) {}

	initWalletFromAuth(): void {
		const wallet = this.authService.wallet;
		if (wallet) {
			this.walletAddress = wallet.solanaAddress || "";
		}
	}

	clearPayment(): void {
		this.paymentTxHash = "";
		this.paymentRequired = false;
		this.paymentDetails = null;
	}

	normalizeFaceBase64ForApi(raw: string): string {
		const trimmed = (raw ?? "").trim();
		const marker = "base64,";
		const idx = trimmed.indexOf(marker);
		if (idx !== -1 && trimmed.slice(0, 5).toLowerCase() === "data:") {
			return trimmed.slice(idx + marker.length).replace(/\s/g, "");
		}
		return trimmed.replace(/\s/g, "");
	}

	isPaymentAlreadyUsedError(error: unknown): boolean {
		const err = error as { error?: { error?: string; message?: string } };
		const body = err?.error;
		if (!body || typeof body !== "object") return false;
		if (body.error === "Payment Already Used") return true;
		const msg = typeof body.message === "string" ? body.message : "";
		return msg.includes("already been used");
	}

	getErrorMessage(error: unknown): string {
		const err = error as { error?: { message?: string; error?: string }; message?: string };
		if (err.error?.message) return err.error.message;
		if (err.error?.error) return String(err.error.error);
		if (err.message) return err.message;
		return "Unknown error";
	}

	buildAuthPaymentHeaders(): HttpHeaders {
		let headers = new HttpHeaders({
			Authorization: `Bearer ${this.authService.accessToken}`,
		});
		if (this.paymentTxHash && this.paymentChain) {
			headers = headers
				.set("x-payment-chain", this.paymentChain)
				.set("x-payment-tx", this.paymentTxHash)
				.set("x-wallet-address", this.walletAddress)
				.set("x-payment-proof", "verified");
		}
		return headers;
	}

	async submitSolanaPayment(faceBase64Normalized: string, masterPassword: string | undefined, amount: number): Promise<void> {
		const payload: Record<string, unknown> = {
			amount,
			faceBase64: faceBase64Normalized,
		};
		if (masterPassword && masterPassword.length > 0) {
			payload.masterPassword = masterPassword;
		}

		const response = (await this.http
			.post(`${environment.apiUrl}/api/solana/payment`, payload, {
				headers: new HttpHeaders({
					Authorization: `Bearer ${this.authService.accessToken}`,
				}),
			})
			.toPromise()) as { success?: boolean; transactionHash?: string };

		if (response?.success && response.transactionHash) {
			this.paymentTxHash = response.transactionHash;
			this.paymentChain = "solana";
			return;
		}
		throw new Error("Payment failed - no transaction hash received");
	}
}
