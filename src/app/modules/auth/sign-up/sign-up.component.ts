import { Component, OnInit, ViewChild, ViewEncapsulation, inject, HostListener } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from "@angular/material/select";
import { Router, RouterLink } from "@angular/router";
import { fuseAnimations } from "@fuse/animations";
import { FuseAlertComponent, FuseAlertType } from "@fuse/components/alert";
import { AuthService } from "app/core/auth/auth.service";
import { DataBiometricsComponent, BiometricData } from "../biometric-verification/biometric-verification.component";
import { TranslocoService, TranslocoModule } from "@jsverse/transloco";
import { cleanedCountryCodes } from "app/core/cleaned_country_codes";
import { environment } from "environments/environment";
@Component({
	selector: "auth-sign-up",
	templateUrl: "./sign-up.component.html",
	encapsulation: ViewEncapsulation.None,
	animations: fuseAnimations,
	imports: [
		CommonModule,
		RouterLink,
		FuseAlertComponent,
		FormsModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		MatIconModule,
		MatCheckboxModule,
		MatProgressSpinnerModule,
		MatSelectModule,
		DataBiometricsComponent,
		TranslocoModule,
	],
})
export class AuthSignUpComponent implements OnInit {
	@ViewChild("signUpNgForm") signUpNgForm: NgForm;
	@ViewChild("biometricVerification") biometricVerification: DataBiometricsComponent;

	production: boolean;

	alert: { type: FuseAlertType; message: string } = {
		type: "success",
		message: "",
	};
	signUpForm: UntypedFormGroup;
	showAlert: boolean = false;
	showBiometricVerification: boolean = false;
	userData: any = {};

	// Language picker
	availableLanguages = [
		{ code: "en", name: "English", flag: "🇺🇸" },
		{ code: "es", name: "Español", flag: "🇪🇸" },
		{ code: "fr", name: "Français", flag: "🇫🇷" },
		{ code: "zh", name: "中文", flag: "🇨🇳" },
		{ code: "ja", name: "日本語", flag: "🇯🇵" },
		{ code: "ko", name: "한국어", flag: "🇰🇷" },
	];
	currentLanguage = "en";

	// Country code search functionality
	countryCodeSearchTerm = "";
	filteredCountryCodes: any[] = [];
	showCountryDropdown = false;

	// Country codes for phone number
	countryCodes = cleanedCountryCodes;

	// Random data generators for testing
	private firstNames = [
		"Alex",
		"Jordan",
		"Taylor",
		"Morgan",
		"Casey",
		"Riley",
		"Avery",
		"Quinn",
		"Sage",
		"River",
		"Blake",
		"Cameron",
		"Drew",
		"Emery",
		"Finley",
		"Hayden",
		"Jamie",
		"Kendall",
		"Logan",
		"Parker",
	];

	private lastNames = [
		"Smith",
		"Johnson",
		"Williams",
		"Brown",
		"Jones",
		"Garcia",
		"Miller",
		"Davis",
		"Rodriguez",
		"Martinez",
		"Anderson",
		"Taylor",
		"Thomas",
		"Hernandez",
		"Moore",
		"Martin",
		"Jackson",
		"Thompson",
		"White",
		"Lopez",
	];

	private companies = [
		"TechCorp",
		"InnovateLabs",
		"Digital Solutions",
		"Cloud Systems",
		"Data Dynamics",
		"Cyber Security Inc",
		"AI Innovations",
		"Blockchain Technologies",
		"Web3 Solutions",
		"Crypto Ventures",
		"Smart Contracts Ltd",
		"Decentralized Systems",
		"NFT Marketplace",
		"DeFi Protocols",
		"Metaverse Corp",
		"Quantum Computing",
		"Machine Learning Co",
		"Big Data Analytics",
		"IoT Solutions",
		"Edge Computing",
	];

	private domains = [
		"gmail.com",
		"yahoo.com",
		"outlook.com",
		"hotmail.com",
		"icloud.com",
		"protonmail.com",
		"company.com",
		"business.org",
		"enterprise.net",
		"corp.io",
	];

	/**
	 * Constructor
	 */
	private _translocoService = inject(TranslocoService);

	constructor(
		private _authService: AuthService,
		private _formBuilder: UntypedFormBuilder,
		private _router: Router
	) {}

	// -----------------------------------------------------------------------------------------------------
	// @ Lifecycle hooks
	// -----------------------------------------------------------------------------------------------------

	/**
	 * On init
	 */
	ngOnInit(): void {
		this.production = environment.production;

		// Create the form
		this.signUpForm = this._formBuilder.group({
			name: ["", Validators.required],
			email: ["", [Validators.required, Validators.email]],
			masterPassword: ["", Validators.required],
			countryCode: ["+1", Validators.required],
			phone: ["", [Validators.required, Validators.pattern(/^[0-9]{8,12}$/)]],
			company: ["", Validators.required],
			agreements: ["", Validators.requiredTrue],
		});

		// Initialize current language
		this.currentLanguage = this._translocoService.getActiveLang() || "en";

		// Initialize filtered country codes
		this.filteredCountryCodes = this.countryCodes;

		// Auto-fill form with random data for testing
		this.fillRandomData();
	}

	// -----------------------------------------------------------------------------------------------------
	// @ Private methods
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Map error codes to translated messages
	 */
	private getErrorMessage(error: any): string {
		// Extract error code from error response
		// Backend returns: { status, message, code }
		const errorCode = error?.code || error?.message || "unknown_error";

		// Map error codes to translation keys
		const errorMapping: { [key: string]: string } = {
			phone_already_exists: "errors.phone_already_exists",
			email_already_exists: "errors.email_already_exists",
			"403:phone_already_exists": "errors.phone_already_exists",
			"403:email_already_exists": "errors.email_already_exists",
			Forbidden: "errors.unknown_error", // Generic 403 error
			Conflict: "errors.unknown_error", // Generic 409 error
			BadRequest: "errors.validation_error",
			UnprocessableEntity: "errors.validation_error",
			InternalServerError: "errors.unknown_error",
			Timeout: "errors.network_error",
			unknown_error: "errors.unknown_error",
			network_error: "errors.network_error",
			validation_error: "errors.validation_error",
		};

		// Check if it's a specific error message that contains our error codes
		if (error?.message) {
			if (error.message.includes("phone_already_exists")) {
				return this._translocoService.translate("errors.phone_already_exists");
			}
			if (error.message.includes("email_already_exists")) {
				return this._translocoService.translate("errors.email_already_exists");
			}
			if (error.message.includes("Incomplete authentication data received")) {
				return this._translocoService.translate("errors.incomplete_auth_data");
			}
		}

		const translationKey = errorMapping[errorCode] || "errors.unknown_error";

		// Return translated message
		return this._translocoService.translate(translationKey);
	}

	// -----------------------------------------------------------------------------------------------------
	// @ Public methods
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Sign up
	 */
	signUp(): void {
		// Do nothing if the form is invalid
		if (this.signUpForm.invalid) {
			return;
		}

		// Store user data and show biometric verification
		this.userData = this.signUpForm.value;
		this.showBiometricVerification = true;
		this.showAlert = false;
	}

	/**
	 * Handle successful biometric verification
	 */
	onBiometricSuccess(biometricData: BiometricData): void {
		// Disable the form
		this.signUpForm.disable();

		// Combine user data with biometric data
		const signUpData = {
			...this.userData,
			faceBase64: biometricData.faceBase64,
			masterPassword: biometricData.password,
		};

		console.info({ signUpData });

		// Sign up with biometric data
		this._authService
			.signUp(signUpData)
			.then((response) => {
				// Check if we have all required data for authentication
				if (response.data?.token && response.data?.zelfProof && response.data?.zelfAccount) {
					// Set session data
					this._authService.setSession({
						zelfProof: response.data.zelfProof,
						zelfAccount: response.data.zelfAccount,
					});

					// Set access token
					this._authService.setAccessToken(response.data.token);

					// Navigate to dashboard
					this._router.navigateByUrl("/analytics");
				} else {
					// Handle case where required data is missing
					console.error("Sign up response missing required authentication data:", response);

					// Show error message
					this.alert = {
						type: "error",
						message: this.getErrorMessage({ message: "Incomplete authentication data received" }),
					};
					this.showAlert = true;

					// Re-enable the form
					this.signUpForm.enable();
					this.showBiometricVerification = false;
				}
			})
			.catch((error) => {
				console.error("Sign up error:", error);

				// Check if this is a biometric-related error
				if (
					error?.message &&
					(error.message.includes("Multiple face were detected") ||
						error.message.includes("No face detected") ||
						error.message.includes("Face not recognized") ||
						error.message.includes("biometric") ||
						error.message.includes("face"))
				) {
					// Handle biometric-specific errors in the biometric component
					if (this.biometricVerification) {
						this.biometricVerification.handleApiError(error);
					}
					return; // Don't show the general error alert
				}

				// Re-enable the form
				this.signUpForm.enable();

				// Reset the form
				this.signUpNgForm.resetForm();

				// Hide biometric verification
				this.showBiometricVerification = false;

				// Get translated error message
				const errorMessage = this.getErrorMessage(error);

				// Set the alert with translated message
				this.alert = {
					type: "error",
					message: errorMessage,
				};

				// Show the alert
				this.showAlert = true;
			});
	}

	/**
	 * Handle biometric verification cancellation
	 */
	onBiometricCancel(): void {
		this.showBiometricVerification = false;
		this.userData = {};
	}

	// -----------------------------------------------------------------------------------------------------
	// @ Helper methods for testing
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Fill form with random data for easy testing
	 */
	fillRandomData(): void {
		const randomData = this.generateRandomUserData();

		this.signUpForm.patchValue({
			name: randomData.name,
			email: randomData.email,
			masterPassword: randomData.masterPassword,
			countryCode: randomData.countryCode,
			phone: randomData.phone,
			company: randomData.company,
			agreements: true,
		});
	}

	/**
	 * Generate random user data
	 */
	private generateRandomUserData(): any {
		const firstName = this.getRandomItem(this.firstNames);
		const lastName = this.getRandomItem(this.lastNames);
		const company = this.getRandomItem(this.companies);
		const domain = this.getRandomItem(this.domains);
		const countryCode = this.getRandomItem(this.countryCodes);

		return {
			name: `${firstName} ${lastName}`,
			email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
			masterPassword: this.generateRandomPassword(),
			countryCode: countryCode.code,
			phone: this.generateRandomPhoneNumber(),
			company: company,
		};
	}

	/**
	 * Get random item from array
	 */
	private getRandomItem<T>(array: T[]): T {
		return array[Math.floor(Math.random() * array.length)];
	}

	/**
	 * Generate random password
	 */
	private generateRandomPassword(): string {
		const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
		let password = "";
		for (let i = 0; i < 12; i++) {
			password += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return password;
	}

	/**
	 * Generate random phone number
	 */
	private generateRandomPhoneNumber(): string {
		// Generate 10-digit phone number
		return Math.floor(1000000000 + Math.random() * 9000000000).toString();
	}

	/**
	 * Manually fill random data (for testing button)
	 */
	onFillRandomData(): void {
		this.fillRandomData();
	}

	/**
	 * Change language
	 */
	onLanguageChange(languageCode: string): void {
		this.currentLanguage = languageCode;
		this._translocoService.setActiveLang(languageCode);
	}

	/**
	 * Filter country codes based on search term
	 */
	filterCountryCodes(): void {
		if (!this.countryCodeSearchTerm.trim()) {
			this.filteredCountryCodes = this.countryCodes;
			this.showCountryDropdown = false;
			return;
		}

		const searchTerm = this.countryCodeSearchTerm.toLowerCase().trim();
		this.filteredCountryCodes = this.countryCodes.filter(
			(country) => country.country.toLowerCase().includes(searchTerm) || country.code.includes(searchTerm) || country.flag.includes(searchTerm)
		);
		this.showCountryDropdown = this.filteredCountryCodes.length > 0;
	}

	/**
	 * Clear country code search
	 */
	clearCountryCodeSearch(): void {
		this.countryCodeSearchTerm = "";
		this.filteredCountryCodes = this.countryCodes;
		this.showCountryDropdown = false;
		this.signUpForm.patchValue({ countryCode: "" });
	}

	/**
	 * Toggle country dropdown visibility
	 */
	toggleCountryDropdown(): void {
		if (!this.countryCodeSearchTerm) {
			this.countryCodeSearchTerm = "";
			this.filteredCountryCodes = this.countryCodes;
			this.showCountryDropdown = true;
		}
	}

	/**
	 * Select a country code from the dropdown
	 */
	selectCountryCode(country: any): void {
		this.signUpForm.patchValue({ countryCode: country.code });
		this.countryCodeSearchTerm = `${country.flag} ${country.code}`;
		this.filteredCountryCodes = this.countryCodes;
		this.showCountryDropdown = false;
	}

	/**
	 * Close dropdown when clicking outside
	 */
	@HostListener("document:click", ["$event"])
	onDocumentClick(event: Event): void {
		const target = event.target as HTMLElement;
		const countryCodeField = target.closest(".country-code-field");
		if (!countryCodeField) {
			this.showCountryDropdown = false;
		}
	}
}
