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
import { environment } from "../../../../environments/environment";

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
	showAlert: boolean = false;
	alertMessage: string = "";
	alertType: "success" | "error" = "success";

	// Save data
	saveData: SaveConfirmationData | null = null;
	redirectUrl: string = "/settings/license";

	constructor(
		private saveConfirmationService: SaveConfirmationService,
		private httpWrapper: HttpWrapperService,
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

		// Create license with biometric data
		const licenseData = {
			...this.saveData.license.toJSON(),
			faceBase64: biometricData.faceBase64,
			masterPassword: biometricData.password || this.masterPassword,
		};

		// Call license API
		this.createOrUpdateLicense(licenseData);
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
	 * Create or update license
	 */
	private async createOrUpdateLicense(licenseData: any): Promise<void> {
		try {
			// First, check if domain already exists
			const existingLicense = await this.searchLicense(licenseData.domain);

			if (existingLicense) {
				// Update existing license
				await this.updateLicense(licenseData, existingLicense);
			} else {
				// Create new license
				await this.createLicense(licenseData);
			}
		} catch (error) {
			console.error("License operation error:", error);
			this.showError("Failed to save license. Please try again.");
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Search for existing license by domain
	 */
	private async searchLicense(domain: string): Promise<any> {
		try {
			const response = await this.httpWrapper.sendRequest("get", `${environment.apiUrl}${environment.endpoints.license.search}`, { domain });
			return response.data;
		} catch (error) {
			// If not found, return null
			if (error.status === 404) {
				return null;
			}
			throw error;
		}
	}

	/**
	 * Create new license
	 */
	private async createLicense(licenseData: any): Promise<void> {
		try {
			const response = await this.httpWrapper.sendRequest("post", `${environment.apiUrl}${environment.endpoints.license.create}`, licenseData);

			// Store in localStorage
			localStorage.setItem("license", JSON.stringify(response.data));

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
	 * Update existing license
	 */
	private async updateLicense(licenseData: any, existingLicense: any): Promise<void> {
		try {
			// Delete previous IPFS record if exists
			if (existingLicense.ipfsHash) {
				await this.deleteLicense(existingLicense.ipfsHash);
			}

			// Create new license with updated domain
			await this.createLicense(licenseData);

			this.showSuccess(
				this.translocoService.translate("saving_operations.updated_successfully", {
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
	 * Delete license from IPFS
	 */
	private async deleteLicense(ipfsHash: string): Promise<void> {
		try {
			await this.httpWrapper.sendRequest("delete", `${environment.apiUrl}${environment.endpoints.license.delete}/${ipfsHash}`);
		} catch (error) {
			console.warn("Failed to delete previous license record:", error);
			// Continue with creation even if deletion fails
		}
	}

	/**
	 * Show success message
	 */
	private showSuccess(message: string): void {
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
