import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, AfterViewInit, ViewEncapsulation } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { Router } from "@angular/router";
import { TranslocoService, TranslocoModule } from "@jsverse/transloco";
import { HttpWrapperService } from "../../../../http-wrapper.service";
import { SaveConfirmationService } from "../../../../core/services/save-confirmation.service";
import { environment } from "../../../../../environments/environment";

@Component({
	selector: "settings-security",
	templateUrl: "./security.component.html",
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatIconModule,
		MatInputModule,
		MatButtonModule,
		MatProgressSpinnerModule,
		TranslocoModule,
	],
})
export class SettingsSecurityComponent implements OnInit, AfterViewInit {
	securityForm: UntypedFormGroup;

	// Alert properties
	showAlert: boolean = false;
	alertMessage: string = "";
	alertType: "success" | "error" = "success";

	// Loading states
	isLoading: boolean = false;
	isLoadingApiKey: boolean = false;

	// API Key properties
	apiKey: string = "";
	showApiKey: boolean = false;

	// JWT Token properties
	jwtToken: string = "";
	showJwt: boolean = false;

	/**
	 * Constructor
	 */
	constructor(
		private _formBuilder: UntypedFormBuilder,
		private _httpWrapper: HttpWrapperService,
		private _cdr: ChangeDetectorRef,
		private _router: Router,
		private _saveConfirmationService: SaveConfirmationService,
		private _translocoService: TranslocoService
	) {}

	// -----------------------------------------------------------------------------------------------------
	// @ Lifecycle hooks
	// -----------------------------------------------------------------------------------------------------

	/**
	 * On init
	 */
	ngOnInit(): void {
		// Create the form
		this.securityForm = this._formBuilder.group({
			currentPassword: ["", [Validators.required]],
			newPassword: ["", [Validators.required, Validators.minLength(8)]],
		});

		// Load JWT token from localStorage
		this.loadJwtToken();

		// Load API key from sessionStorage if available
		this.loadApiKeyFromStorage();
	}

	/**
	 * After view init - refresh data when returning from other pages
	 */
	ngAfterViewInit(): void {
		// Refresh data when component becomes visible again
		this.loadJwtToken();
		this.loadApiKeyFromStorage();
	}

	// -----------------------------------------------------------------------------------------------------
	// @ Public methods
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Load JWT token from localStorage
	 */
	loadJwtToken(): void {
		this.jwtToken = localStorage.getItem("accessToken") || "";
		this._cdr.detectChanges();
	}

	/**
	 * Load API key from sessionStorage
	 */
	loadApiKeyFromStorage(): void {
		this.apiKey = sessionStorage.getItem("apiKey") || "";
		this._cdr.detectChanges();
	}

	/**
	 * Load API key with biometric verification
	 */
	loadApiKey(): void {
		// Create security data object for API key loading
		const securityData = {
			operation: "loadApiKey",
			faceBase64: "", // Will be set during biometric verification
			masterPassword: "", // Will be set during biometric verification
		};

		// Set save data in service
		this._saveConfirmationService.setSaveData({
			license: null, // Not needed for security operations
			domainConfig: null, // Not needed for security operations
			redirectUrl: "/settings/security",
			operation: {
				title: this._translocoService.translate("saving_operations.load_api_key.title"),
				description: this._translocoService.translate("saving_operations.load_api_key.description"),
				action: this._translocoService.translate("saving_operations.load_api_key.action"),
				itemName: this._translocoService.translate("saving_operations.load_api_key.itemName"),
			},
			securityData: securityData, // Add security-specific data
		});

		// Navigate to save confirmation page
		this._router.navigate(["/save-confirmation"], {
			queryParams: { redirect: "/settings/security" },
		});
	}

	/**
	 * Toggle API key visibility
	 */
	toggleApiKeyVisibility(): void {
		this.showApiKey = !this.showApiKey;
		this._cdr.detectChanges();
	}

	/**
	 * Toggle JWT token visibility
	 */
	toggleJwtVisibility(): void {
		this.showJwt = !this.showJwt;
		this._cdr.detectChanges();
	}

	/**
	 * Save password with biometric verification
	 */
	savePassword(): void {
		if (this.securityForm.invalid) {
			this.showError("Please fill in all required fields correctly");
			return;
		}

		const formValue = this.securityForm.value;

		// Create security data object
		const securityData = {
			currentPassword: formValue.currentPassword,
			newPassword: formValue.newPassword,
			operation: "changePassword",
			faceBase64: "", // Will be set during biometric verification
			masterPassword: "", // Will be set during biometric verification
		};

		// Set save data in service
		this._saveConfirmationService.setSaveData({
			license: null, // Not needed for security operations
			domainConfig: null, // Not needed for security operations
			redirectUrl: "/settings/security",
			operation: {
				title: this._translocoService.translate("saving_operations.password_change.title"),
				description: this._translocoService.translate("saving_operations.password_change.description"),
				action: this._translocoService.translate("saving_operations.password_change.action"),
				itemName: this._translocoService.translate("saving_operations.password_change.itemName"),
			},
			securityData: securityData, // Add security-specific data
		});

		// Navigate to save confirmation page
		this._router.navigate(["/save-confirmation"], {
			queryParams: { redirect: "/settings/security" },
		});
	}

	/**
	 * Cancel operation
	 */
	cancel(): void {
		this.securityForm.reset();
		this.showAlert = false;
		this._cdr.detectChanges();
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
			this._cdr.detectChanges();
		}, 5000);
		this._cdr.detectChanges();
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
			this._cdr.detectChanges();
		}, 5000);
		this._cdr.detectChanges();
	}
}
