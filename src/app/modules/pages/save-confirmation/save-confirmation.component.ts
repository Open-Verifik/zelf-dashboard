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
			await this.createLicense(licenseData);
		} catch (error) {
			console.error("License operation error:", error);
			this.showError("Failed to save license. Please try again.");
		} finally {
			this.isLoading = false;
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
