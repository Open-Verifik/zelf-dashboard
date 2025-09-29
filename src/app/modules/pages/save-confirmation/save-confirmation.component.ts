import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { Router, ActivatedRoute } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { TranslocoService, TranslocoModule } from "@jsverse/transloco";
import { DataBiometricsComponent, BiometricData } from "../../auth/biometric-verification/biometric-verification.component";
import { SaveConfirmationService, SaveConfirmationData } from "../../../core/services/save-confirmation.service";
import { HttpWrapperService } from "../../../http-wrapper.service";
import { AuthService } from "../../../core/auth/auth.service";
import { environment } from "../../../../environments/environment";
import { License } from "../settings/license/license.class";

@Component({
	selector: "app-save-confirmation",
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		MatButtonModule,
		MatFormFieldModule,
		MatInputModule,
		MatIconModule,
		MatProgressSpinnerModule,
		DataBiometricsComponent,
		TranslocoModule,
	],
	templateUrl: "./save-confirmation.component.html",
	styleUrls: ["./save-confirmation.component.scss"],
})
export class SaveConfirmationComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();

	// Form data
	masterPassword: string = "";
	showPassword: boolean = false;

	// Modal state
	showBiometricModal: boolean = false;
	isLoading: boolean = false;
	isSuccess: boolean = false;
	showAlert: boolean = false;
	alertMessage: string = "";
	alertType: "success" | "error" = "success";

	// Save data
	saveData: SaveConfirmationData | null = null;
	redirectUrl: string = "/settings/license";

	constructor(
		private saveConfirmationService: SaveConfirmationService,
		private httpWrapper: HttpWrapperService,
		private authService: AuthService,
		private router: Router,
		private route: ActivatedRoute,
		private translocoService: TranslocoService
	) {}

	ngOnInit(): void {
		// Get redirect URL from query params
		this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
			if (params["redirect"]) {
				this.redirectUrl = params["redirect"];
			}
		});

		// Get save data from service
		this.saveConfirmationService.saveData$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
			if (data) {
				this.saveData = data;
			} else {
				// No data available, redirect back
				this.router.navigate([this.redirectUrl]);
			}
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	/**
	 * Toggle password visibility
	 */
	togglePasswordVisibility(): void {
		this.showPassword = !this.showPassword;
	}

	/**
	 * Proceed to biometric verification
	 */
	proceedToBiometric(): void {
		if (!this.masterPassword.trim()) {
			this.showError("Please enter your master password");
			return;
		}

		if (!this.saveData) {
			this.showError("No save data available");
			return;
		}

		// Show biometric modal
		this.showBiometricModal = true;
	}

	/**
	 * Handle successful biometric verification
	 */
	onBiometricSuccess(biometricData: BiometricData): void {
		this.showBiometricModal = false;
		this.isLoading = true;

		if (!this.saveData) {
			this.showError("No save data available");
			this.isLoading = false;
			return;
		}

		// Check if this is a security operation
		if (this.saveData.securityData) {
			// Handle security operation (password change)
			this.handleSecurityOperation(biometricData);
		} else if (this.saveData.license) {
			// Handle license operation
			this.handleLicenseOperation(biometricData);
		} else if (this.saveData.profileData) {
			// Handle profile operation
			this.handleProfileOperation(biometricData);
		} else {
			this.showError("Invalid operation data");
			this.isLoading = false;
		}
	}

	/**
	 * Handle biometric verification cancellation
	 */
	onBiometricCancel(): void {
		this.showBiometricModal = false;
	}

	/**
	 * Go back to previous screen
	 */
	goBack(): void {
		this.saveConfirmationService.clearSaveData();
		this.router.navigate([this.redirectUrl]);
	}

	/**
	 * Handle security operation (password change or load API key)
	 */
	private async handleSecurityOperation(biometricData: BiometricData): Promise<void> {
		if (!this.saveData?.securityData) {
			this.showError("No security data available");
			this.isLoading = false;
			return;
		}

		try {
			const securityData = {
				...this.saveData.securityData,
				faceBase64: biometricData.faceBase64,
				masterPassword: biometricData.password || this.masterPassword,
			};

			// Check operation type
			if (securityData.operation === "loadApiKey") {
				await this.loadApiKey(securityData);
			} else if (securityData.operation === "changePassword") {
				await this.changePassword(securityData);
			} else {
				this.showError("Unknown security operation");
				this.isLoading = false;
			}
		} catch (error) {
			const operation = this.saveData?.securityData?.operation === "loadApiKey" ? "load API key" : "change password";
			this.showError(`Failed to ${operation}. Please try again.`);
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Handle license operation
	 */
	private async handleLicenseOperation(biometricData: BiometricData): Promise<void> {
		if (!this.saveData?.license) {
			this.showError("No license data available");

			this.isLoading = false;

			return;
		}

		try {
			const licenseData = {
				...this.saveData.license.toJSON(),
				faceBase64: biometricData.faceBase64,
				masterPassword: biometricData.password || this.masterPassword,
			};

			await this.createLicense(licenseData);
		} catch (error) {
			this.showError("Failed to save license. Please try again.");
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Handle profile operation
	 */
	private async handleProfileOperation(biometricData: BiometricData): Promise<void> {
		if (!this.saveData?.profileData) {
			this.showError("No profile data available");
			this.isLoading = false;
			return;
		}

		try {
			const profileData = {
				...this.saveData.profileData,
				faceBase64: biometricData.faceBase64,
				masterPassword: biometricData.password || this.masterPassword,
			};

			await this.updateProfile(profileData);
		} catch (error) {
			let errorMessage = "Failed to update profile. Please try again.";

			// Handle specific error cases
			if (error?.message) {
				if (error.message.includes("error_decrypting_zelf_account")) {
					errorMessage = "Biometric verification failed. Please check your face image and master password.";
				} else if (error.message.includes("zelf_account_not_found")) {
					errorMessage = "Account not found. Please contact support.";
				} else if (error.message.includes("404")) {
					errorMessage = "Account not found. Please contact support.";
				} else if (error.message.includes("409")) {
					errorMessage = "Verification failed. Please try again.";
				} else {
					errorMessage = error.message;
				}
			}

			this.showError(errorMessage);
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Load API key
	 */
	private async loadApiKey(securityData: any): Promise<void> {
		try {
			// Get account information from zelfAccount
			const zelfAccount = this.authService.zelfAccount;
			const accountEmail = zelfAccount?.publicData?.accountEmail;

			const requestData = {
				...securityData,
				email: accountEmail,
				identificationMethod: "email",
			};

			const response = await this.httpWrapper.sendRequest(
				"post",
				`${environment.apiUrl}${environment.endpoints.security.loadApiKey}`,
				requestData
			);

			if (response && response.data && response.data.apiKey) {
				// Store API key in sessionStorage as requested
				sessionStorage.setItem("apiKey", response.data.apiKey);

				// Update access token if provided
				if (response.data.token) {
					localStorage.setItem("accessToken", response.data.token);
				}

				// Update zelfAccount if provided
				if (response.data.zelfAccount) {
					localStorage.setItem("zelfAccount", JSON.stringify(response.data.zelfAccount));
				}

				// Update zelfProof if provided
				if (response.data.zelfProof) {
					localStorage.setItem("zelfProof", response.data.zelfProof);
				}

				this.showSuccess(
					this.translocoService.translate("saving_operations.api_key_loaded_successfully", {
						itemName: this.saveData?.operation?.itemName || "API Key",
					})
				);
			} else {
				throw new Error("No API key received from server");
			}

			// Redirect after success
			setTimeout(() => {
				this.saveConfirmationService.clearSaveData();
				this.router.navigate([this.redirectUrl]);
			}, 2000);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Change password
	 */
	private async changePassword(securityData: any): Promise<void> {
		try {
			const requestData = {
				...securityData,
				identificationMethod: "email",
			};

			const response = await this.httpWrapper.sendRequest(
				"put",
				`${environment.apiUrl}${environment.endpoints.security.changePassword}`,
				requestData
			);

			console.log({ response: response.data });

			if (response && response.data) {
				this.showSuccess(
					this.translocoService.translate("saving_operations.password_changed_successfully", {
						itemName: this.saveData?.operation?.itemName || "Password",
					})
				);
				// Redirect after success
				setTimeout(() => {
					this.saveConfirmationService.clearSaveData();
					this.router.navigate([this.redirectUrl]);
				}, 2000);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Create new license
	 */
	private async createLicense(licenseData: any): Promise<void> {
		try {
			const response = await this.httpWrapper.sendRequest("post", `${environment.apiUrl}${environment.endpoints.license.create}`, licenseData);

			const license = License.fromAPIResponseWithWrapper(response);

			// Store in localStorage
			localStorage.setItem("license", JSON.stringify(license.toJSON()));

			this.showSuccess(
				this.translocoService.translate("saving_operations.created_successfully", {
					itemName: this.saveData?.operation?.itemName || "Configuration",
				})
			);

			// Redirect after success
			setTimeout(() => {
				this.saveConfirmationService.clearSaveData();
				this.router.navigate([this.redirectUrl]);
			}, 2000);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Update profile
	 */
	private async updateProfile(profileData: any): Promise<void> {
		try {
			const requestData = {
				...profileData,
				// Don't override the email - let the backend handle it
			};

			const response = await this.httpWrapper.sendRequest("put", `${environment.apiUrl}${environment.endpoints.client.update}`, requestData);

			if (response && response.data) {
				// Update zelfAccount if provided
				if (response.data.zelfAccount) {
					localStorage.setItem("zelfAccount", JSON.stringify(response.data.zelfAccount));
					// Update the auth service
					this.authService.setSession({
						zelfProof: response.data.zelfProof || this.authService.zelfProof,
						zelfAccount: response.data.zelfAccount,
					});
				}

				// Update zelfProof if provided
				if (response.data.zelfProof) {
					localStorage.setItem("zelfProof", response.data.zelfProof);
				}

				this.showSuccess(
					this.translocoService.translate("saving_operations.updated_successfully", {
						itemName: this.saveData?.operation?.itemName || "Profile",
					})
				);

				// Redirect after success
				setTimeout(() => {
					this.saveConfirmationService.clearSaveData();
					this.router.navigate([this.redirectUrl]);
				}, 2000);
			} else {
				throw new Error("No response data received from server");
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Show success message
	 */
	private showSuccess(message: string): void {
		this.isSuccess = true;
		this.alertMessage = message;
		this.alertType = "success";
		this.showAlert = true;
		setTimeout(() => {
			this.showAlert = false;
		}, 5000);
	}

	/**
	 * Show error message
	 */
	private showError(message: string): void {
		this.alertMessage = message;
		this.alertType = "error";
		this.showAlert = true;
		setTimeout(() => {
			this.showAlert = false;
		}, 5000);
	}
}
