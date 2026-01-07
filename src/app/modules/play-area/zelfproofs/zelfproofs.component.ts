import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { AuthService } from "app/core/auth/auth.service";
import { DataBiometricsComponent, BiometricData } from "../../auth/biometric-verification/biometric-verification.component";
import { PasskeyService } from "app/core/services/passkey.service";
import { TranslocoModule, TranslocoService } from "@jsverse/transloco";

@Component({
	selector: "app-zelfproofs",
	templateUrl: "./zelfproofs.component.html",
	styleUrls: ["./zelfproofs.component.scss"],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatCardModule,
		MatIconModule,
		MatProgressSpinnerModule,
		MatSnackBarModule,
		MatDialogModule,
		DataBiometricsComponent,
		TranslocoModule,
	],
})
export class ZelfProofsComponent implements OnInit {
	encryptForm: FormGroup;
	loading = false;
	paymentRequired = false;
	paymentDetails: any = null;
	response: any = null;
	error: any = null;

	// Secure Flow State
	masterPassword = "";
	showPassword = false;
	hasPasskey = false;
	showPasswordStep = false;
	showBiometricModal = false;

	// Payment state
	paymentProcessing = false;
	paymentTxHash = "";
	paymentChain = "solana";
	walletAddress = "";

	chains = [
		{ value: "solana", label: "Solana", icon: "account_balance_wallet" },
		{ value: "avalanche", label: "Avalanche", icon: "account_balance_wallet" },
		{ value: "base", label: "Base", icon: "account_balance_wallet" },
	];

	livenessLevels = [
		{ value: "SOFT", label: "Soft" },
		{ value: "REGULAR", label: "Regular" },
		{ value: "HARDENED", label: "Hardened" },
	];

	constructor(
		private fb: FormBuilder,
		private http: HttpClient,
		private authService: AuthService,
		private snackBar: MatSnackBar,
		private dialog: MatDialog,
		private passkeyService: PasskeyService,
		private translocoService: TranslocoService
	) {}

	ngOnInit(): void {
		this.encryptForm = this.fb.group({
			publicData: ['{"name": "Test User", "email": "test@example.com"}', Validators.required],
			faceBase64: ["", Validators.required],
			os: ["DESKTOP", Validators.required],
			livenessLevel: ["REGULAR", Validators.required],
			metadata: ['{"device": "Browser", "location": "Test"}'],
		});

		// Get wallet address from auth service
		const wallet = this.authService.wallet;
		if (wallet) {
			this.walletAddress = wallet.solanaAddress || "";
		}

		// Check for passkey
		const email = this.authService.zelfAccount?.publicData?.accountEmail || this.authService.zelfAccount?.publicData?.staffEmail;

		if (email) {
			this.passkeyService.getPasskeyMetadata(email).then((metadata) => {
				if (metadata) {
					this.hasPasskey = true;
				}
			});
		}
	}

	async testEncrypt(isPolling = false): Promise<boolean> {
		if (this.encryptForm.invalid) {
			this.snackBar.open("Please fill in all required fields", "Close", { duration: 3000 });
			if (!isPolling) {
				this.snackBar.open("Please fill in all required fields", "Close", { duration: 3000 });
			}
			return false;
		}

		if (!isPolling) {
			this.loading = true;
		}
		this.error = null;
		this.response = null;
		this.paymentRequired = false;

		try {
			const formValue = this.encryptForm.value;
			const publicDataObj = JSON.parse(formValue.publicData);
			const payload = {
				publicData: publicDataObj,
				faceBase64: formValue.faceBase64,
				os: formValue.os,
				metadata: formValue.metadata ? JSON.parse(formValue.metadata) : {},
				livenessLevel: formValue.livenessLevel,
				tolerance: formValue.livenessLevel,
				identifier: publicDataObj.email || publicDataObj.identifier || `test-id-${Date.now()}`,
			};

			// Build headers
			const headers: any = {
				Authorization: `Bearer ${this.authService.accessToken}`,
			};

			// Add payment headers if we have them
			if (this.paymentTxHash && this.paymentChain) {
				headers["x-payment-chain"] = this.paymentChain;
				headers["x-payment-tx"] = this.paymentTxHash;
				headers["x-wallet-address"] = this.walletAddress;
				headers["x-payment-proof"] = "verified"; // Proof that payment was made
			}

			const response = await this.http
				.post(`${environment.apiUrl}/api/zelf-proof/encrypt`, payload, {
					headers: new HttpHeaders(headers),
				})
				.toPromise();

			this.response = response;
			this.snackBar.open("Encryption successful!", "Close", { duration: 5000 });
			return true;
		} catch (error: any) {
			console.error("Error:", error);

			if (error.status === 402) {
				// Payment required
				this.paymentRequired = true;
				this.paymentDetails = error.error;

				if (!isPolling) {
					this.snackBar.open("Payment required - Please complete payment", "Close", {
						duration: 5000,
					});
				}
			} else {
				this.error = error.error || error.message || "Unknown error occurred";

				// Don't show error snackbar if we are polling and it's likely a propagation delay
				const errorMsg = this.getErrorMessage(error);
				if (!isPolling || (!errorMsg.includes("Transaction not found") && error.status !== 402 && error.status !== 400)) {
					this.snackBar.open(`Error: ${errorMsg}`, "Close", {
						duration: 5000,
					});
				}
			}
			return false;
		} finally {
			this.loading = false;
		}
	}

	/**
	 * Poll for payment verification
	 */
	async pollForVerification(attempts = 0): Promise<void> {
		if (attempts >= 30) {
			this.snackBar.open("Payment verification timed out. Please try manually.", "Close", { duration: 5000 });
			this.paymentProcessing = false;
			return;
		}

		// Try to verify
		const success = await this.testEncrypt(true);

		if (success) {
			this.paymentProcessing = false;

			this.showPasswordStep = false;

			this.cancelPaymentFlow(); // Reset flow state

			return;
		}

		// If not successful, check if we should retry
		// We retry if we got a 402 (Payment Required) or if error message mentions transaction not found
		const errorMsg = this.error && typeof this.error === "object" ? this.error.message || JSON.stringify(this.error) : String(this.error || "");

		// If payment is required or specific transaction error, retry
		if (this.paymentRequired || errorMsg.includes("Transaction not found") || errorMsg.includes("Payment Verification Failed")) {
			// Wait 2 seconds and retry
			await new Promise((resolve) => setTimeout(resolve, 2200));
			await this.pollForVerification(attempts + 1);
		} else {
			// Fatal error
			this.paymentProcessing = false;
		}
	}

	/**
	 * Start the secure payment flow
	 */
	startPaymentFlow(): void {
		this.showPasswordStep = true;
	}

	cancelPaymentFlow(): void {
		this.showPasswordStep = false;
		this.showBiometricModal = false;
		this.masterPassword = "";
	}

	togglePasswordVisibility(): void {
		this.showPassword = !this.showPassword;
	}

	/**
	 * Login with Passkey
	 */
	async onPasskeyLogin(): Promise<void> {
		this.paymentProcessing = true;
		try {
			const email = this.authService.zelfAccount?.publicData?.accountEmail || this.authService.zelfAccount?.publicData?.staffEmail;
			if (!email) throw new Error("No user email found");

			const metadata = await this.passkeyService.getPasskeyMetadata(email);
			if (!metadata) throw new Error("No passkey metadata found");

			// Authenticate with passkey
			const key = await this.passkeyService.authenticate(metadata.credentialId, this.passkeyService.base64ToBuffer(metadata.salt));

			if (key) {
				// Decrypt master password
				const decryptedPassword = await this.passkeyService.decryptPassword(metadata.ciphertext, metadata.iv, key);

				if (decryptedPassword) {
					this.masterPassword = decryptedPassword;
					this.paymentProcessing = false;
					this.proceedToBiometric();
					return;
				}
			}
			throw new Error("Passkey authentication failed");
		} catch (error) {
			console.error("Passkey login error:", error);
			this.snackBar.open("Passkey login failed. Please use your master password.", "Close", {
				duration: 5000,
			});
			this.paymentProcessing = false;
		}
	}

	/**
	 * Proceed to biometric verification
	 */
	proceedToBiometric(): void {
		if (!this.masterPassword.trim()) {
			this.snackBar.open("Please enter your master password", "Close", { duration: 3000 });
			return;
		}

		// Show biometric modal
		this.showBiometricModal = true;
	}

	/**
	 * Handle biometric success
	 */
	async onBiometricSuccess(biometricData: BiometricData): Promise<void> {
		this.showBiometricModal = false;

		const amount = this.paymentDetails?.paymentDetails?.cost || 0.1;
		await this.submitPayment(biometricData, amount);
	}

	/**
	 * Handle biometric cancel
	 */
	onBiometricCancel(): void {
		this.showBiometricModal = false;
	}

	/**
	 * Submit payment with biometric verification
	 */
	async submitPayment(biometricData: BiometricData, amount: number): Promise<void> {
		this.paymentProcessing = true;

		try {
			const payload = {
				amount,
				faceBase64: biometricData.faceBase64,
				masterPassword: biometricData.password,
			};

			const response: any = await this.http
				.post(`${environment.apiUrl}/api/solana/payment`, payload, {
					headers: new HttpHeaders({
						Authorization: `Bearer ${this.authService.accessToken}`,
					}),
				})
				.toPromise();

			if (response.success && response.transactionHash) {
				this.paymentTxHash = response.transactionHash;
				this.paymentChain = "solana";

				this.snackBar.open("Payment successful! Retrying encryption...", "Close", {
					duration: 3000,
				});

				// Automatically poll for verification
				await this.pollForVerification();
			} else {
				throw new Error("Payment failed - no transaction hash received");
			}
		} catch (error: any) {
			console.error("Payment error:", error);
			this.snackBar.open(`Payment failed: ${this.getErrorMessage(error)}`, "Close", {
				duration: 5000,
			});
		} finally {
			this.paymentProcessing = false;
		}
	}

	clearPayment(): void {
		this.paymentTxHash = "";
		this.paymentRequired = false;
		this.paymentDetails = null;
	}

	private getErrorMessage(error: any): string {
		if (error.error?.message) {
			return error.error.message;
		}
		if (error.error?.error) {
			return error.error.error;
		}
		if (error.message) {
			return error.message;
		}
		return "Unknown error";
	}

	copyResponseToClipboard(): void {
		if (this.response) {
			const text = JSON.stringify(this.response, null, 2);
			this.copyToClipboard(text);
		}
	}

	copyToClipboard(text: string): void {
		navigator.clipboard.writeText(text).then(() => {
			this.snackBar.open("Copied to clipboard!", "Close", { duration: 2000 });
		});
	}

	fillSampleData(): void {
		this.encryptForm.patchValue({
			publicData: JSON.stringify(
				{
					name: "John Doe",
					email: "john.doe@example.com",
					age: 30,
					city: "New York",
				},
				null,
				2
			),
			faceBase64: "data:image/jpeg;base64,/9j/4AAQSkZJRg...(sample)",
			os: "DESKTOP",
			metadata: JSON.stringify(
				{
					device: "Chrome Browser",
					location: "New York, USA",
					timestamp: new Date().toISOString(),
				},
				null,
				2
			),
		});
		this.snackBar.open("Sample data filled", "Close", { duration: 2000 });
	}
}
