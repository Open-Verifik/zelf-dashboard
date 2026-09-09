import { Component, OnInit, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { environment } from "../../../../environments/environment";
import { AuthService } from "app/core/auth/auth.service";
import { DataBiometricsComponent, BiometricData } from "../../auth/biometric-verification/biometric-verification.component";
import { isBiometricApiError } from "app/core/i18n/api-error-codes";
import { PasskeyService } from "app/core/services/passkey.service";
import { HumanAuthnPaymentService } from "../human-authn-payment.service";
import { AnalyticsOnboardingService } from "app/modules/dashboards/analytics/analytics-onboarding.service";
import { HumanAuthnPlayHeaderComponent } from "../human-authn-play-header/human-authn-play-header.component";
import { HumanAuthnStepCardComponent } from "../human-authn-step-card/human-authn-step-card.component";
import { HumanAuthnIoPanelComponent } from "../human-authn-io-panel/human-authn-io-panel.component";
import {
	HUMAN_AUTHN_NEXT_DECRYPT,
	HumanAuthnNextStep,
	HumanAuthnPlayStepId,
	resolveHumanAuthnPlayStep,
} from "../human-authn-play.utils";

@Component({
	selector: "app-human-authn-preview",
	templateUrl: "./human-authn-preview.component.html",
	styleUrls: ["../zelfproofs/zelfproofs.component.scss"],
	providers: [HumanAuthnPaymentService],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatCardModule,
		MatFormFieldModule,
		MatInputModule,
		MatIconModule,
		MatProgressSpinnerModule,
		MatSnackBarModule,
		MatTooltipModule,
		DataBiometricsComponent,
		HumanAuthnPlayHeaderComponent,
		HumanAuthnStepCardComponent,
		HumanAuthnIoPanelComponent,
	],
})
export class HumanAuthnPreviewComponent implements OnInit {
	readonly previewMethod = "POST";
	readonly previewPath = "/api/human-authn/preview";
	readonly previewUrl = `${environment.apiUrl}/api/human-authn/preview`;
	readonly expectedShape = `{
  "publicData": { "name": "John Doe" },
  "passwordLayer": false
}`;
	readonly emptyHint = "No face needed. You only get publicData — secrets stay locked.";
	readonly nextSteps: HumanAuthnNextStep[] = [HUMAN_AUTHN_NEXT_DECRYPT];
	form: FormGroup;
	loading = false;
	response: unknown = null;
	error: unknown = null;

	@ViewChild(DataBiometricsComponent) biometricVerification?: DataBiometricsComponent;

	masterPassword = "";
	showPassword = false;
	hasPasskey = false;
	showPasswordStep = false;
	showBiometricModal = false;

	constructor(
		private fb: FormBuilder,
		private http: HttpClient,
		private authService: AuthService,
		public humanPay: HumanAuthnPaymentService,
		private snackBar: MatSnackBar,
		private passkeyService: PasskeyService,
		private _analyticsOnboardingService: AnalyticsOnboardingService
	) {
		this.form = this.fb.group({
			zelfProof: ["", Validators.required],
			verifierKey: [""],
		});
	}

	ngOnInit(): void {
		this.humanPay.initWalletFromAuth();
		const email =
			this.authService.zelfAccount?.publicData?.accountEmail || this.authService.zelfAccount?.publicData?.staffEmail;
		if (email) {
			this.passkeyService.getPasskeyMetadata(email).then((metadata) => {
				if (metadata) this.hasPasskey = true;
			});
		}
	}

	get playStep(): HumanAuthnPlayStepId {
		return resolveHumanAuthnPlayStep({
			loading: this.loading,
			paymentRequired: this.humanPay.paymentRequired,
			response: this.response,
		});
	}

	get livePayload(): Record<string, unknown> {
		return this.buildPayload();
	}

	buildPayload(): Record<string, unknown> {
		if (!this.form) return {};
		const raw = this.form.value;
		const payload: Record<string, unknown> = {
			zelfProof: (raw.zelfProof || "").toString().trim(),
		};
		if (raw.verifierKey?.trim()) payload.verifierKey = raw.verifierKey.trim();
		return payload;
	}

	async runPreview(isPolling = false): Promise<boolean> {
		if (!this.form.get("zelfProof")?.value?.trim()) {
			if (!isPolling) this.snackBar.open("Paste the zelfID from Create", "Close", { duration: 3500 });
			return false;
		}

		if (!isPolling) this.loading = true;
		this.error = null;
		this.response = null;
		this.humanPay.paymentRequired = false;

		try {
			const payload = this.buildPayload();

			const res = await this.http
				.post(this.previewUrl, payload, {
					headers: this.humanPay.buildAuthPaymentHeaders(),
				})
				.toPromise();

			this.response = res;
			this.humanPay.clearPayment();
			this.snackBar.open("Preview successful!", "Close", { duration: 5000 });
			void this._analyticsOnboardingService.refresh();
			return true;
		} catch (err: unknown) {
			console.error(err);
			const error = err as { status?: number; error?: unknown };
			if (error.status === 402) {
				this.humanPay.paymentRequired = true;
				this.humanPay.paymentDetails = error.error;
				if (!isPolling)
					this.snackBar.open("Payment required - Please complete payment", "Close", { duration: 5000 });
			} else {
				this.error = error.error || (error as Error).message || "Unknown error";
				if (error.status === 409 && this.humanPay.isPaymentAlreadyUsedError(err)) this.humanPay.clearPayment();
				const msg = this.humanPay.getErrorMessage(err);
				if (!isPolling || (!msg.includes("Transaction not found") && error.status !== 402 && error.status !== 400)) {
					this.snackBar.open(`Error: ${msg}`, "Close", { duration: 5000 });
				}
			}
			return false;
		} finally {
			this.loading = false;
		}
	}

	async pollForVerification(attempts = 0): Promise<void> {
		if (attempts >= 30) {
			this.snackBar.open("Payment verification timed out. Please try manually.", "Close", { duration: 5000 });
			this.humanPay.paymentProcessing = false;
			return;
		}
		const ok = await this.runPreview(true);
		if (ok) {
			this.humanPay.paymentProcessing = false;
			this.showPasswordStep = false;
			this.cancelPaymentFlow();
			return;
		}
		const errorMsg =
			this.error && typeof this.error === "object" && this.error !== null && "message" in this.error
				? String((this.error as { message?: string }).message)
				: JSON.stringify(this.error || "");
		if (
			this.humanPay.paymentRequired ||
			errorMsg.includes("Transaction not found") ||
			errorMsg.includes("Payment Verification Failed")
		) {
			await new Promise((r) => setTimeout(r, 2200));
			await this.pollForVerification(attempts + 1);
		} else {
			this.humanPay.paymentProcessing = false;
		}
	}

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

	async onPasskeyLogin(): Promise<void> {
		this.humanPay.paymentProcessing = true;
		try {
			const email =
				this.authService.zelfAccount?.publicData?.accountEmail || this.authService.zelfAccount?.publicData?.staffEmail;
			if (!email) throw new Error("No user email found");
			const metadata = await this.passkeyService.getPasskeyMetadata(email);
			if (!metadata) throw new Error("No passkey metadata found");
			const key = await this.passkeyService.authenticate(metadata.credentialId, this.passkeyService.base64ToBuffer(metadata.salt));
			if (key) {
				const decryptedPassword = await this.passkeyService.decryptPassword(metadata.ciphertext, metadata.iv, key);
				if (decryptedPassword) {
					this.masterPassword = decryptedPassword;
					this.humanPay.paymentProcessing = false;
					this.proceedToBiometric();
					return;
				}
			}
			throw new Error("Passkey authentication failed");
		} catch (e) {
			console.error(e);
			this.snackBar.open("Passkey login failed. Please use your master password.", "Close", { duration: 5000 });
			this.humanPay.paymentProcessing = false;
		}
	}

	proceedToBiometric(): void {
		this.showBiometricModal = true;
	}

	async onBiometricSuccess(data: BiometricData): Promise<void> {
		const pd = this.humanPay.paymentDetails as { paymentDetails?: { cost?: number } } | null;
		const amount = pd?.paymentDetails?.cost ?? 0.01;
		await this.submitPayment(data, amount);
	}

	onBiometricCancel(): void {
		this.showBiometricModal = false;
	}

	async submitPayment(biometricData: BiometricData, amount: number): Promise<void> {
		this.humanPay.paymentProcessing = true;
		try {
			const face = this.humanPay.normalizeFaceBase64ForApi(biometricData.faceBase64);
			const password = biometricData.password || this.masterPassword;
			await this.humanPay.submitSolanaPayment(face, password, amount);
		} catch (err: unknown) {
			console.error(err);
			if (isBiometricApiError(err) && this.biometricVerification) {
				this.biometricVerification.handleApiError(err);
				return;
			}
			this.showBiometricModal = false;
			this.snackBar.open(`Payment failed: ${this.humanPay.getErrorMessage(err)}`, "Close", { duration: 5000 });
			return;
		} finally {
			this.humanPay.paymentProcessing = false;
		}

		this.showBiometricModal = false;
		this.snackBar.open("Payment successful! Retrying preview...", "Close", { duration: 3000 });

		try {
			await this.pollForVerification();
		} catch (err: unknown) {
			console.error(err);
			this.snackBar.open(this.humanPay.getErrorMessage(err), "Close", { duration: 5000 });
		}
	}

	copyResponseToClipboard(): void {
		if (this.response) {
			navigator.clipboard.writeText(JSON.stringify(this.response, null, 2)).then(() => {
				this.snackBar.open("Copied to clipboard!", "Close", { duration: 2000 });
			});
		}
	}
}
