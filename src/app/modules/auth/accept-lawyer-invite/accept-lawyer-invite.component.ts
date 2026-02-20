import { Component, OnInit, ViewChild, ViewEncapsulation, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { ActivatedRoute, Router } from "@angular/router";
import { fuseAnimations } from "@fuse/animations";
import { FuseAlertComponent, FuseAlertType } from "@fuse/components/alert";
import { AuthService } from "app/core/auth/auth.service";
import { DataBiometricsComponent, BiometricData } from "../biometric-verification/biometric-verification.component";
import { TranslocoModule, TranslocoService } from "@jsverse/transloco";
import { PasskeyPromptModalComponent } from "../passkey-prompt-modal/passkey-prompt-modal.component";
import { PasskeyService } from "app/core/services/passkey.service";

@Component({
	selector: "auth-accept-lawyer-invite",
	templateUrl: "./accept-lawyer-invite.component.html",
	encapsulation: ViewEncapsulation.None,
	animations: fuseAnimations,
	imports: [
		CommonModule,
		FuseAlertComponent,
		FormsModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		MatIconModule,
		MatProgressSpinnerModule,
		DataBiometricsComponent,
		TranslocoModule,
		PasskeyPromptModalComponent,
	],
})
export class AuthAcceptLawyerInviteComponent implements OnInit {
	@ViewChild("acceptInviteNgForm") acceptInviteNgForm: NgForm;
	@ViewChild("biometricVerification") biometricVerification: DataBiometricsComponent;

	alert: { type: FuseAlertType; message: string } = { type: "success", message: "" };
	acceptInviteForm: UntypedFormGroup;
	showAlert = false;
	showBiometricVerification = false;
	showPasskeyPrompt = false;
	isLoading = true;
	inviteData: any = null;
	token = "";

	availableLanguages = [
		{ code: "en", name: "English", flag: "🇺🇸" },
		{ code: "es", name: "Español", flag: "🇪🇸" },
		{ code: "fr", name: "Français", flag: "🇫🇷" },
		{ code: "zh", name: "中文", flag: "🇨🇳" },
		{ code: "ja", name: "日本語", flag: "🇯🇵" },
		{ code: "ko", name: "한국어", flag: "🇰🇷" },
	];
	currentLanguage = "en";
	private _translocoService = inject(TranslocoService);

	constructor(
		private _authService: AuthService,
		private _formBuilder: UntypedFormBuilder,
		private _router: Router,
		private _route: ActivatedRoute,
		private _passkeyService: PasskeyService,
	) {}

	ngOnInit(): void {
		this.currentLanguage = this._translocoService.getActiveLang() || "en";
		this.token = this._route.snapshot.queryParamMap.get("token");

		if (!this.token) {
			this.isLoading = false;
			this.alert = { type: "error", message: "Invalid invitation link. Token is missing." };
			this.showAlert = true;
			return;
		}

		this._authService
			.validateLawyerInvite(this.token)
			.then((response) => {
				this.inviteData = response?.data || response;
				this.isLoading = false;
			})
			.catch((error) => {
				this.isLoading = false;
				const msg = error?.error?.message || error?.message || "Invalid or expired invitation link.";
				this.alert = { type: "error", message: msg };
				this.showAlert = true;
			});

		this.acceptInviteForm = this._formBuilder.group({
			masterPassword: ["", Validators.required],
		});
	}

	acceptInvite(): void {
		if (this.acceptInviteForm.invalid) return;
		this.showBiometricVerification = true;
		this.showAlert = false;
	}

	onBiometricSuccess(biometricData: BiometricData): void {
		this.acceptInviteForm.disable();

		const data = {
			invitationToken: this.token,
			faceBase64: biometricData.faceBase64,
			masterPassword: this.acceptInviteForm.get("masterPassword")?.value,
		};

		this._authService
			.acceptLawyerInvite(data)
			.then((response) => {
				const result = response?.data || response;
				if (result?.token) {
					this._authService.setSession({
						zelfProof: result.zelfProof,
						zelfAccount: result.lawyerAccount,
					});
					this._authService.setAccessToken(result.token);
					this.showPasskeyPrompt = true;
				}
			})
			.catch((error) => {
				this.acceptInviteForm.enable();
				this.showBiometricVerification = false;
				const msg = error?.error?.message || error?.message || "Failed to accept invitation.";
				this.alert = { type: "error", message: msg };
				this.showAlert = true;

				if (this.biometricVerification && (msg.includes("face") || msg.includes("LIVENESS") || msg.includes("biometric"))) {
					this.biometricVerification.handleApiError(error);
				}
			});
	}

	onBiometricCancel(): void {
		this.showBiometricVerification = false;
	}

	onPasskeySave(): void {
		const email = this.inviteData?.lawyerEmail;
		const password = this.acceptInviteForm.get("masterPassword")?.value;

		if (email && password) {
			this._passkeyService
				.register(email)
				.then(async (regResult) => {
					if (regResult) {
						const encrypted = await this._passkeyService.encryptPassword(password, regResult.key);
						await this._passkeyService.savePasskeyMetadata(email, {
							credentialId: regResult.credentialId,
							salt: this._passkeyService.bufferToBase64(regResult.salt),
							iv: encrypted.iv,
							ciphertext: encrypted.ciphertext,
						});
					}
					this._router.navigateByUrl("/zelf-legacy/lawyers");
				})
				.catch(() => this._router.navigateByUrl("/zelf-legacy/lawyers"));
		} else {
			this._router.navigateByUrl("/zelf-legacy/lawyers");
		}
	}

	onPasskeyCancel(): void {
		this._router.navigateByUrl("/zelf-legacy/lawyers");
	}

	onLanguageChange(languageCode: string): void {
		this.currentLanguage = languageCode;
		this._translocoService.setActiveLang(languageCode);
	}
}
