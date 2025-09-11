import { TextFieldModule } from "@angular/cdk/text-field";
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation, ViewChild } from "@angular/core";
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatOptionModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { DataBiometricsComponent, BiometricData } from "../../../auth/biometric-verification/biometric-verification.component";
import { AuthService } from "app/core/auth/auth.service";
import { HttpWrapperService } from "app/http-wrapper.service";
import { environment } from "../../../../../environments/environment";

@Component({
	selector: "settings-license",
	templateUrl: "./license.component.html",
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		FormsModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatIconModule,
		MatInputModule,
		TextFieldModule,
		MatSelectModule,
		MatOptionModule,
		MatButtonModule,
		MatDialogModule,
		MatProgressSpinnerModule,
		DataBiometricsComponent,
	],
})
export class SettingsLicenseComponent implements OnInit {
	@ViewChild("biometricVerification") biometricVerification: DataBiometricsComponent;

	accountForm: UntypedFormGroup;
	showBiometricModal: boolean = false;
	isLoading: boolean = false;
	showAlert: boolean = false;
	alertMessage: string = "";
	alertType: "success" | "error" = "success";

	// License data
	currentLicense: any = null;
	userData: any = {};

	/**
	 * Constructor
	 */
	constructor(
		private _formBuilder: UntypedFormBuilder,
		private _authService: AuthService,
		private _httpWrapper: HttpWrapperService
	) {}

	// -----------------------------------------------------------------------------------------------------
	// @ Lifecycle hooks
	// -----------------------------------------------------------------------------------------------------

	/**
	 * On init
	 */
	ngOnInit(): void {
		// Create the form
		this.accountForm = this._formBuilder.group({
			domain: ["", [Validators.required, Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/)]],
		});

		// Load current license if exists
		this.loadCurrentLicense();
	}

	// -----------------------------------------------------------------------------------------------------
	// @ Public methods
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Load current license from localStorage
	 */
	loadCurrentLicense(): void {
		const storedLicense = localStorage.getItem("license");
		if (storedLicense) {
			try {
				this.currentLicense = JSON.parse(storedLicense);
				this.accountForm.patchValue({
					domain: this.currentLicense.domain || "",
				});
			} catch (error) {
				console.error("Error parsing stored license:", error);
			}
		}
	}

	/**
	 * Save license with biometric verification
	 */
	saveLicense(): void {
		if (this.accountForm.invalid) {
			this.showError("Please enter a valid domain name");
			return;
		}

		const domain = this.accountForm.get("domain")?.value;
		if (!domain) {
			this.showError("Domain is required");
			return;
		}

		// Check if domain has changed
		if (this.currentLicense && this.currentLicense.domain === domain) {
			this.showError("Domain is already set to this value");
			return;
		}

		// Show biometric verification modal
		this.showBiometricModal = true;
		this.userData = { domain };
	}

	/**
	 * Handle successful biometric verification
	 */
	onBiometricSuccess(biometricData: BiometricData): void {
		this.showBiometricModal = false;
		this.isLoading = true;

		const domain = this.accountForm.get("domain")?.value;
		const licenseData = {
			domain,
			faceBase64: biometricData.faceBase64,
			masterPassword: biometricData.password,
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
			const response = await this._httpWrapper.sendRequest("get", `${environment.apiUrl}${environment.endpoints.license.search}`, { domain });
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
			const response = await this._httpWrapper.sendRequest("post", `${environment.apiUrl}${environment.endpoints.license.create}`, licenseData);

			// Store in localStorage
			localStorage.setItem("license", JSON.stringify(response.data));
			this.currentLicense = response.data;

			this.showSuccess("License created successfully!");
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

			this.showSuccess("License updated successfully!");
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Delete license from IPFS
	 */
	private async deleteLicense(ipfsHash: string): Promise<void> {
		try {
			await this._httpWrapper.sendRequest("delete", `${environment.apiUrl}${environment.endpoints.license.delete}/${ipfsHash}`);
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

	/**
	 * Cancel operation
	 */
	cancel(): void {
		// Reset form to current license values
		this.loadCurrentLicense();
	}
}
