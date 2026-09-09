import { Component, OnInit, QueryList, ViewChild, ViewChildren, ElementRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
	FormsModule,
	ReactiveFormsModule,
	FormBuilder,
	FormGroup,
	FormArray,
	Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { AuthService } from "app/core/auth/auth.service";
import { DataBiometricsComponent, BiometricData } from "../../auth/biometric-verification/biometric-verification.component";
import { isBiometricApiError } from "app/core/i18n/api-error-codes";
import { PasskeyService } from "app/core/services/passkey.service";
import { TranslocoModule, TranslocoService } from "@jsverse/transloco";
import { HumanAuthnPaymentService } from "../human-authn-payment.service";
import { HumanAuthnPlayHeaderComponent } from "../human-authn-play-header/human-authn-play-header.component";
import { HumanAuthnStepCardComponent } from "../human-authn-step-card/human-authn-step-card.component";
import { HumanAuthnIoPanelComponent } from "../human-authn-io-panel/human-authn-io-panel.component";
import {
	HUMAN_AUTHN_NEXT_DECRYPT,
	HUMAN_AUTHN_NEXT_PREVIEW,
	HumanAuthnNextStep,
	HumanAuthnPlayStepId,
	resolveHumanAuthnPlayStep,
} from "../human-authn-play.utils";

/** Encrypt credential mode — maps to optional `password` on POST /api/human-authn/encrypt-qr-code. */
type CredentialMode = "none" | "password" | "pin";

/** Max selfie size in bytes; backend validates the image, but bail early so users get a friendly hint. */
const MAX_SELFIE_BYTES = 5 * 1024 * 1024;

/** PIN entry uses OTP-style boxes; value is still sent as one string on `credentialValue`. */
const PIN_SLOT_COUNT = 6;

@Component({
	selector: "app-human-authn-encrypt-qr",
	templateUrl: "./human-authn-encrypt-qr.component.html",
	styleUrls: ["../zelfproofs/zelfproofs.component.scss"],
	providers: [HumanAuthnPaymentService],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatButtonToggleModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatCardModule,
		MatIconModule,
		MatProgressSpinnerModule,
		MatSnackBarModule,
		MatDialogModule,
		MatTooltipModule,
		DataBiometricsComponent,
		MatCheckboxModule,
		TranslocoModule,
		HumanAuthnPlayHeaderComponent,
		HumanAuthnStepCardComponent,
		HumanAuthnIoPanelComponent,
	],
})
export class HumanAuthnEncryptQrComponent implements OnInit {
	readonly encryptMethod = "POST";
	readonly encryptPath = "/api/human-authn/encrypt-qr-code";
	readonly encryptUrl = `${environment.apiUrl}/api/human-authn/encrypt-qr-code`;
	readonly expectedShape = `{
  "zelfIDQR": "data:image/png;base64,...",
  "zelfID": "<proof string>"
}`;
	readonly emptyHint = "A PNG QR (zelfIDQR). Optional zelfID is the same proof string Create returns.";
	readonly nextSteps: HumanAuthnNextStep[] = [HUMAN_AUTHN_NEXT_PREVIEW, HUMAN_AUTHN_NEXT_DECRYPT];
	private readonly playIdentifier = `play-id-${Date.now()}`;
	readonly pinSlotIndices = Array.from({ length: PIN_SLOT_COUNT }, (_, i) => i);

	@ViewChild(DataBiometricsComponent) biometricVerification?: DataBiometricsComponent;
	@ViewChildren("pinBox") pinBoxRefs!: QueryList<ElementRef<HTMLInputElement>>;

	encryptForm: FormGroup;
	loading = false;
	response: any = null;
	error: any = null;

	masterPassword = "";
	showPassword = false;
	hasPasskey = false;
	showPasswordStep = false;
	showBiometricModal = false;

	selfiePreviewUrl: string | null = null;
	selfieFileName: string | null = null;
	showCredentialValue = true;

	/** One character per PIN box (`''` or a single digit); mirrors `credentialValue` in PIN mode. */
	pinSlots: string[] = Array(PIN_SLOT_COUNT).fill("");

	chains = [
		{ value: "solana", label: "Solana", icon: "account_balance_wallet" },
		{ value: "avalanche", label: "Avalanche", icon: "account_balance_wallet" },
		{ value: "base", label: "Base", icon: "account_balance_wallet" },
	];

	livenessLevels = [
		{ value: "SOFT", label: "Soft (lenient)" },
		{ value: "REGULAR", label: "Regular" },
		{ value: "HARDENED", label: "Hardened (strict)" },
	];

	credentialModes: { value: CredentialMode; label: string; icon: string }[] = [
		{ value: "none", label: "No password", icon: "lock_open" },
		{ value: "password", label: "Password", icon: "key" },
		{ value: "pin", label: "PIN", icon: "pin" },
	];

	/** PNG data URL from API (`zelfIDQR`) or legacy `zelfQR`; supports raw base64 without prefix. */
	get encryptQrImageSrc(): string | null {
		const r = this.response;
		if (!r || typeof r !== "object") return null;
		const raw = (r as Record<string, unknown>).zelfIDQR ?? (r as Record<string, unknown>).zelfQR;
		if (typeof raw !== "string") return null;
		const s = raw.trim();
		if (!s) return null;
		if (s.startsWith("data:image/")) return s;
		const b64 = s.replace(/\s/g, "");
		if (b64.length > 32 && /^[A-Za-z0-9+/]+=*$/.test(b64)) return `data:image/png;base64,${b64}`;
		return null;
	}

	constructor(
		private fb: FormBuilder,
		private http: HttpClient,
		private authService: AuthService,
		public humanPay: HumanAuthnPaymentService,
		private snackBar: MatSnackBar,
		private dialog: MatDialog,
		private passkeyService: PasskeyService,
		private translocoService: TranslocoService
	) {}

	ngOnInit(): void {
		this.encryptForm = this.fb.group({
			publicData: this.fb.array([
				this.buildKvRow("name", "John Doe"),
				this.buildKvRow("email", "john.doe@example.com"),
			]),
			metadata: this.fb.array([
				this.buildKvRow("source", "play-area"),
				this.buildKvRow("client", "dashboard"),
			]),
			faceBase64: ["", Validators.required],
			os: ["DESKTOP", Validators.required],
			livenessLevel: ["SOFT", Validators.required],
			credentialMode: ["none" as CredentialMode, Validators.required],
			credentialValue: [""],
			generateZelfProof: [true],
		});

		this.humanPay.initWalletFromAuth();

		const email = this.authService.zelfAccount?.publicData?.accountEmail || this.authService.zelfAccount?.publicData?.staffEmail;

		if (email) {
			this.passkeyService.getPasskeyMetadata(email).then((metadata) => {
				if (metadata) {
					this.hasPasskey = true;
				}
			});
		}
	}

	get publicDataRows(): FormArray {
		return this.encryptForm.get("publicData") as FormArray;
	}

	get metadataRows(): FormArray {
		return this.encryptForm.get("metadata") as FormArray;
	}

	private buildKvRow(key = "", value = ""): FormGroup {
		return this.fb.group({
			key: [key],
			value: [value],
		});
	}

	addPublicDataRow(): void {
		this.publicDataRows.push(this.buildKvRow());
	}

	removePublicDataRow(index: number): void {
		if (this.publicDataRows.length > 1) {
			this.publicDataRows.removeAt(index);
		} else {
			this.publicDataRows.at(0).patchValue({ key: "", value: "" });
		}
	}

	addMetadataRow(): void {
		this.metadataRows.push(this.buildKvRow());
	}

	removeMetadataRow(index: number): void {
		if (this.metadataRows.length > 1) {
			this.metadataRows.removeAt(index);
		} else {
			this.metadataRows.at(0).patchValue({ key: "", value: "" });
		}
	}

	/**
	 * Fold a FormArray of `{ key, value }` rows into a `{ [key]: string }` object.
	 * Trims empty keys; coerces every value to string so backend `stringKeyValueObject` validation passes.
	 */
	private rowsToStringObject(rows: FormArray): Record<string, string> {
		const out: Record<string, string> = {};
		rows.controls.forEach((row) => {
			const rawKey = (row.value?.key ?? "").toString().trim();
			if (!rawKey) return;
			const rawValue = row.value?.value;
			out[rawKey] = rawValue === null || rawValue === undefined ? "" : String(rawValue);
		});
		return out;
	}

	onCredentialModeChange(): void {
		const mode: CredentialMode = this.encryptForm.get("credentialMode")?.value;
		const valueCtrl = this.encryptForm.get("credentialValue");
		if (!valueCtrl) return;
		if (mode === "none") {
			valueCtrl.setValue("");
			valueCtrl.clearValidators();
			this.resetPinSlots();
		} else if (mode === "pin") {
			this.showCredentialValue = true;
			valueCtrl.setValidators([Validators.required, Validators.pattern(/^[0-9]{6}$/)]);
			const digits = (valueCtrl.value ?? "").toString().replace(/\D/g, "").slice(0, PIN_SLOT_COUNT);
			valueCtrl.setValue(digits);
			this.pinSlots = Array.from({ length: PIN_SLOT_COUNT }, (_, i) => digits[i] ?? "");
			setTimeout(() => {
				this.pinBoxRefs?.forEach((ref, i) => {
					ref.nativeElement.value = this.pinSlots[i] ?? "";
				});
				const focusIx = digits.length >= PIN_SLOT_COUNT ? PIN_SLOT_COUNT - 1 : digits.length;
				this.focusPinBox(focusIx);
			});
		} else {
			this.showCredentialValue = false;
			valueCtrl.setValidators([Validators.required, Validators.minLength(4)]);
			this.resetPinSlots();
		}
		valueCtrl.updateValueAndValidity();
	}

	private resetPinSlots(): void {
		this.pinSlots = Array(PIN_SLOT_COUNT).fill("");
	}

	private flushPinSlotsToCredential(): void {
		const pin = this.pinSlots.join("");
		const ctrl = this.encryptForm.get("credentialValue");
		ctrl?.setValue(pin);
		ctrl?.markAsDirty();
		ctrl?.updateValueAndValidity({ emitEvent: true });
	}

	focusPinBox(index: number): void {
		const boxes = this.pinBoxRefs?.toArray();
		const el = boxes?.[index]?.nativeElement;
		el?.focus();
		el?.select();
	}

	onPinSlotInput(event: Event, index: number): void {
		const el = event.target as HTMLInputElement;
		const digits = el.value.replace(/\D/g, "");
		const digit = digits.slice(-1);
		const next = [...this.pinSlots];
		next[index] = digit;
		this.pinSlots = next;
		el.value = digit;
		this.flushPinSlotsToCredential();
		if (digit && index < PIN_SLOT_COUNT - 1) {
			this.focusPinBox(index + 1);
		}
	}

	onPinSlotKeydown(event: KeyboardEvent, index: number): void {
		if (event.key === "Backspace") {
			if (this.pinSlots[index]) {
				const next = [...this.pinSlots];
				next[index] = "";
				this.pinSlots = next;
				(event.target as HTMLInputElement).value = "";
				this.flushPinSlotsToCredential();
				event.preventDefault();
				return;
			}
			if (index > 0) {
				event.preventDefault();
				const next = [...this.pinSlots];
				next[index - 1] = "";
				this.pinSlots = next;
				this.flushPinSlotsToCredential();
				const prev = this.pinBoxRefs?.toArray()[index - 1]?.nativeElement;
				if (prev) prev.value = "";
				this.focusPinBox(index - 1);
			}
			return;
		}
		if (event.key === "ArrowLeft" && index > 0) {
			event.preventDefault();
			this.focusPinBox(index - 1);
		}
		if (event.key === "ArrowRight" && index < PIN_SLOT_COUNT - 1) {
			event.preventDefault();
			this.focusPinBox(index + 1);
		}
	}

	onPinPaste(event: ClipboardEvent): void {
		event.preventDefault();
		const raw = event.clipboardData?.getData("text") ?? "";
		const digits = raw.replace(/\D/g, "").slice(0, PIN_SLOT_COUNT);
		this.pinSlots = Array.from({ length: PIN_SLOT_COUNT }, (_, i) => digits[i] ?? "");
		this.flushPinSlotsToCredential();
		this.pinBoxRefs?.forEach((ref, i) => {
			ref.nativeElement.value = this.pinSlots[i] ?? "";
		});
		const focusIx = digits.length >= PIN_SLOT_COUNT ? PIN_SLOT_COUNT - 1 : digits.length;
		setTimeout(() => this.focusPinBox(focusIx));
	}

	toggleCredentialVisibility(): void {
		this.showCredentialValue = !this.showCredentialValue;
		if (this.credentialMode !== "pin") return;
		setTimeout(() => {
			this.pinBoxRefs?.forEach((ref, i) => {
				ref.nativeElement.value = this.pinSlots[i] ?? "";
			});
		});
	}

	get credentialMode(): CredentialMode {
		return this.encryptForm.get("credentialMode")?.value || "none";
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
		if (!this.encryptForm) return {};
		const publicData = this.rowsToStringObject(this.publicDataRows);
		const metadata = this.rowsToStringObject(this.metadataRows);
		const formValue = this.encryptForm.value;
		const credentialMode: CredentialMode = formValue.credentialMode;
		const credentialValue = (formValue.credentialValue || "").toString();
		const payload: Record<string, unknown> = {
			publicData,
			metadata,
			faceBase64: this.humanPay.normalizeFaceBase64ForApi(formValue.faceBase64 || ""),
			os: formValue.os,
			livenessLevel: formValue.livenessLevel,
			check_live_face_before_creation: true,
			identifier: publicData.email || publicData.identifier || this.playIdentifier,
			generateZelfProof: !!formValue.generateZelfProof,
		};
		if (credentialMode !== "none" && credentialValue.length > 0) {
			payload.password = credentialValue;
		}
		return payload;
	}

	/** Selfie file upload: read into a data URL and set `faceBase64`. Falls back to a hint if too large. */
	onSelfieFileSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		const file = input?.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			this.snackBar.open("Please choose an image file", "Close", { duration: 3000 });
			input.value = "";
			return;
		}

		if (file.size > MAX_SELFIE_BYTES) {
			this.snackBar.open(`Image too large (max ${Math.round(MAX_SELFIE_BYTES / (1024 * 1024))} MB)`, "Close", { duration: 4000 });
			input.value = "";
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			const dataUrl = typeof reader.result === "string" ? reader.result : "";
			this.encryptForm.patchValue({ faceBase64: dataUrl });
			this.selfiePreviewUrl = dataUrl;
			this.selfieFileName = file.name;
			this.encryptForm.get("faceBase64")?.markAsDirty();
		};
		reader.onerror = () => {
			this.snackBar.open("Failed to read image", "Close", { duration: 3000 });
		};
		reader.readAsDataURL(file);
	}

	clearSelfie(): void {
		this.encryptForm.patchValue({ faceBase64: "" });
		this.selfiePreviewUrl = null;
		this.selfieFileName = null;
	}

	async testEncrypt(isPolling = false): Promise<boolean> {
		const publicData = this.rowsToStringObject(this.publicDataRows);
		const metadata = this.rowsToStringObject(this.metadataRows);

		if (!this.encryptForm.get("faceBase64")?.value || Object.keys(publicData).length === 0 || Object.keys(metadata).length === 0) {
			if (!isPolling) {
				this.snackBar.open("Please add a selfie and at least one publicData / metadata pair", "Close", { duration: 3500 });
			}
			return false;
		}

		const credentialMode: CredentialMode = this.encryptForm.get("credentialMode")?.value;
		const credentialValue = (this.encryptForm.get("credentialValue")?.value || "").toString();

		if (credentialMode !== "none" && credentialValue.trim().length === 0) {
			if (!isPolling) {
				this.snackBar.open(`Enter a ${credentialMode === "pin" ? "6-digit PIN" : "password"} or switch to "No password"`, "Close", {
					duration: 3500,
				});
			}
			return false;
		}

		if (credentialMode === "pin" && !/^[0-9]{6}$/.test(credentialValue)) {
			if (!isPolling) {
				this.snackBar.open("Enter all 6 PIN digits", "Close", { duration: 3500 });
				this.encryptForm.get("credentialValue")?.markAsTouched();
			}
			return false;
		}

		if (!isPolling) {
			this.loading = true;
		}
		this.error = null;
		this.response = null;
		this.humanPay.paymentRequired = false;

		try {
			const payload = this.buildPayload();

			const response = await this.http
				.post(this.encryptUrl, payload, {
					headers: this.humanPay.buildAuthPaymentHeaders(),
				})
				.toPromise();

			this.response = response;
			// Backend treats each proof as single-use; drop headers so the next encrypt triggers payment again.
			this.humanPay.clearPayment();
			this.snackBar.open("QR encryption successful!", "Close", { duration: 5000 });
			return true;
		} catch (error: any) {
			console.error("Error:", error);

			if (error.status === 402) {
				this.humanPay.paymentRequired = true;
				this.humanPay.paymentDetails = error.error;

				if (!isPolling) {
					this.snackBar.open("Payment required - Please complete payment", "Close", {
						duration: 5000,
					});
				}
			} else {
				this.error = error.error || error.message || "Unknown error occurred";

				if (error.status === 409 && this.humanPay.isPaymentAlreadyUsedError(error)) {
					this.humanPay.clearPayment();
				}

				const errorMsg = this.humanPay.getErrorMessage(error);
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

	async pollForVerification(attempts = 0): Promise<void> {
		if (attempts >= 30) {
			this.snackBar.open("Payment verification timed out. Please try manually.", "Close", { duration: 5000 });
			this.humanPay.paymentProcessing = false;
			return;
		}

		const success = await this.testEncrypt(true);

		if (success) {
			this.humanPay.paymentProcessing = false;

			this.showPasswordStep = false;

			this.cancelPaymentFlow();

			return;
		}

		const errorMsg = this.error && typeof this.error === "object" ? this.error.message || JSON.stringify(this.error) : String(this.error || "");

		if (this.humanPay.paymentRequired || errorMsg.includes("Transaction not found") || errorMsg.includes("Payment Verification Failed")) {
			await new Promise((resolve) => setTimeout(resolve, 2200));
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
			const email = this.authService.zelfAccount?.publicData?.accountEmail || this.authService.zelfAccount?.publicData?.staffEmail;
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
		} catch (error) {
			console.error("Passkey login error:", error);
			this.snackBar.open("Passkey login failed. Please use your master password.", "Close", {
				duration: 5000,
			});
			this.humanPay.paymentProcessing = false;
		}
	}

	/**
	 * Proceed to biometric verification. The Solana fee-payer endpoint accepts an optional
	 * master password, so an empty value is allowed for accounts that don't use one.
	 */
	proceedToBiometric(): void {
		this.showBiometricModal = true;
	}

	async onBiometricSuccess(biometricData: BiometricData): Promise<void> {
		const pd = this.humanPay.paymentDetails as { paymentDetails?: { cost?: number } } | null;
		const amount = pd?.paymentDetails?.cost ?? 0.1;
		await this.submitPayment(biometricData, amount);
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
		} catch (error: unknown) {
			console.error("Payment error:", error);
			if (isBiometricApiError(error) && this.biometricVerification) {
				this.biometricVerification.handleApiError(error);
				return;
			}
			this.showBiometricModal = false;
			this.snackBar.open(`Payment failed: ${this.humanPay.getErrorMessage(error)}`, "Close", {
				duration: 5000,
			});
			return;
		} finally {
			this.humanPay.paymentProcessing = false;
		}

		this.showBiometricModal = false;
		this.snackBar.open("Payment successful! Retrying QR encrypt...", "Close", {
			duration: 3000,
		});

		try {
			await this.pollForVerification();
		} catch (error: unknown) {
			console.error("Encrypt retry error:", error);
			this.snackBar.open(this.humanPay.getErrorMessage(error), "Close", { duration: 5000 });
		}
	}

	copyResponseToClipboard(): void {
		if (this.response) {
			const text = JSON.stringify(this.response, null, 2);
			this.copyToClipboard(text);
		}
	}

	/** Save PNG from current QR data URL (matches Response JSON `zelfIDQR`). */
	downloadQrPng(): void {
		const src = this.encryptQrImageSrc;
		if (!src) {
			this.snackBar.open("No QR image to download", "Close", { duration: 3000 });
			return;
		}
		try {
			const comma = src.indexOf(",");
			if (comma === -1) throw new Error("invalid_data_url");
			const header = src.slice(0, comma);
			const b64 = src.slice(comma + 1);
			const mimeMatch = /^data:([^;]+)/.exec(header);
			const mime = mimeMatch?.[1] || "image/png";
			const binary = atob(b64.replace(/\s/g, ""));
			const bytes = new Uint8Array(binary.length);
			for (let i = 0; i < binary.length; i++) {
				bytes[i] = binary.charCodeAt(i);
			}
			const blob = new Blob([bytes], { type: mime });
			const objectUrl = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = objectUrl;
			a.download = `human-authn-qr-${Date.now()}.png`;
			a.rel = "noopener";
			a.click();
			URL.revokeObjectURL(objectUrl);
			this.snackBar.open("QR code downloaded", "Close", { duration: 2500 });
		} catch {
			this.snackBar.open("Download failed", "Close", { duration: 3000 });
		}
	}

	copyToClipboard(text: string): void {
		navigator.clipboard.writeText(text).then(() => {
			this.snackBar.open("Copied to clipboard!", "Close", { duration: 2000 });
		});
	}

	/**
	 * Reset KV rows to a string-only sample. Backend `stringKeyValueObject` rejects non-string values,
	 * so every value here is intentionally a string (e.g. `age: "30"`).
	 */
	fillSampleData(): void {
		this.publicDataRows.clear();
		[
			{ key: "name", value: "John Doe" },
			{ key: "email", value: "john.doe@example.com" },
			{ key: "age", value: "30" },
			{ key: "city", value: "New York" },
		].forEach((row) => this.publicDataRows.push(this.buildKvRow(row.key, row.value)));

		this.metadataRows.clear();
		[
			{ key: "device", value: "Chrome Browser" },
			{ key: "location", value: "New York, USA" },
			{ key: "timestamp", value: new Date().toISOString() },
			{ key: "source", value: "play-area" },
		].forEach((row) => this.metadataRows.push(this.buildKvRow(row.key, row.value)));

		this.encryptForm.patchValue({
			os: "DESKTOP",
			livenessLevel: "SOFT",
			credentialMode: "none",
			credentialValue: "",
		});
		this.onCredentialModeChange();

		this.snackBar.open("Sample data filled — add a selfie next", "Close", { duration: 3000 });
	}
}
