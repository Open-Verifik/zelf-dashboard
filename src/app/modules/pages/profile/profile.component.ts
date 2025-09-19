import { TextFieldModule } from "@angular/cdk/text-field";
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation, HostListener } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatSelectModule } from "@angular/material/select";
import { MatTooltipModule } from "@angular/material/tooltip";
import { RouterLink, Router } from "@angular/router";
import { FuseCardComponent } from "@fuse/components/card";
import { AuthService } from "app/core/auth/auth.service";
import { CommonModule } from "@angular/common";
import { ZelfUser } from "app/core/user/user.types";
import { TranslocoModule, TranslocoService } from "@jsverse/transloco";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { SaveConfirmationService, SaveConfirmationData } from "app/core/services/save-confirmation.service";
import { cleanedCountryCodes } from "app/core/cleaned_country_codes";

@Component({
	selector: "profile",
	templateUrl: "./profile.component.html",
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		CommonModule,
		RouterLink,
		FuseCardComponent,
		MatIconModule,
		MatButtonModule,
		MatMenuModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		TextFieldModule,
		MatDividerModule,
		MatTooltipModule,
		TranslocoModule,
		ReactiveFormsModule,
		FormsModule,
	],
})
export class ProfileComponent implements OnInit {
	user: ZelfUser | null = null;
	userPhoto: string | null = null;
	loading: boolean = true;
	license: any = null;

	// Form properties
	profileForm: FormGroup;
	isEditing: boolean = false;
	hasChanges: boolean = false;

	// Error handling
	showAlert: boolean = false;
	alertMessage: string = "";
	alertType: "success" | "error" = "success";

	// Country codes for phone number
	countryCodes = cleanedCountryCodes;

	// Country code search functionality
	countryCodeSearchTerm = "";
	filteredCountryCodes: any[] = this.countryCodes;
	showCountryDropdown = false;

	/**
	 * Constructor
	 */
	constructor(
		private _authService: AuthService,
		private _formBuilder: FormBuilder,
		private _router: Router,
		private _translocoService: TranslocoService,
		private _saveConfirmationService: SaveConfirmationService
	) {
		this.profileForm = this._formBuilder.group({
			name: ["", [Validators.required, Validators.minLength(2)]],
			email: ["", [Validators.required, Validators.email]],
			countryCode: ["", [Validators.required]],
			phone: ["", [Validators.required, Validators.pattern(/^\d+$/)]],
			company: ["", [Validators.required]],
		});
	}

	ngOnInit(): void {
		this.license = null;

		this.loadUserData();
	}

	private async loadUserData(): Promise<void> {
		try {
			const zelfAccount = this._authService.zelfAccount;

			console.log({ zelfAccount });

			if (zelfAccount) {
				this.user = new ZelfUser(zelfAccount);
				this.populateForm();
			}

			this.loading = false;
		} catch (error) {
			console.error("Error loading user data:", error);
		} finally {
			this.loading = false;
		}
	}

	/**
	 * Populate form with user data
	 */
	private populateForm(): void {
		if (!this.user) return;

		// Extract only the code part from countryCode (e.g., "+507" from "🇵🇦 +507")
		const cleanCountryCode = this.user.countryCode ? this.user.countryCode.replace(/^[^\d+]*/, "").trim() : "";

		this.profileForm.patchValue({
			name: this.user.name || "",
			email: this.user.email || "",
			countryCode: cleanCountryCode,
			phone: this.user.phone || "",
			company: this.user.company || "",
		});

		// Set country code search term if country code exists
		if (this.user.countryCode) {
			// Extract only the code part (e.g., "+507" from "🇵🇦 +507")
			const codeOnly = this.user.countryCode.replace(/^[^\d+]*/, "").trim();
			const country = this.countryCodes.find((c) => c.code === codeOnly);
			if (country) {
				this.countryCodeSearchTerm = `${country.flag} ${country.code}`;
				// Update the form with the clean code
				this.profileForm.patchValue({ countryCode: country.code });
			}
		}

		// Disable form initially
		this.profileForm.disable();
	}

	get displayName(): string {
		return this.user?.displayName || "User";
	}

	get displayEmail(): string {
		return this.user?.email || "user@example.com";
	}

	get displayPhone(): string {
		return this.user?.formattedPhone || "000-000-0000";
	}

	get displayCompany(): string {
		return this.user?.company || "Zelf Technology";
	}

	get subscriptionType(): string {
		return this.user?.subscriptionDisplayName || "Free";
	}

	get accountStatus(): string {
		return this.user?.status || "Active";
	}

	get accountCreatedAt(): string {
		return this.user?.formattedCreatedAt || "";
	}

	get isPremium(): boolean {
		return this.user?.isPremium || false;
	}

	/**
	 * Toggle edit mode
	 */
	toggleEditMode(): void {
		this.isEditing = !this.isEditing;

		if (this.isEditing) {
			this.profileForm.enable();
		} else {
			this.profileForm.disable();
			this.hasChanges = false;
			// Reset form to original values
			this.populateForm();
		}
	}

	/**
	 * Check if form has changes
	 */
	onFormChange(): void {
		if (!this.user) return;

		const currentValues = this.profileForm.value;
		// Extract only the code part from countryCode (e.g., "+507" from "🇵🇦 +507")
		const cleanCountryCode = this.user.countryCode ? this.user.countryCode.replace(/^[^\d+]*/, "").trim() : "";

		const originalValues = {
			name: this.user.name || "",
			email: this.user.email || "",
			countryCode: cleanCountryCode,
			phone: this.user.phone || "",
			company: this.user.company || "",
		};

		this.hasChanges = JSON.stringify(currentValues) !== JSON.stringify(originalValues);
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
	 * Select a country code from the dropdown
	 */
	selectCountryCode(country: any): void {
		this.profileForm.patchValue({ countryCode: country.code });
		this.countryCodeSearchTerm = `${country.flag} ${country.code}`;
		this.filteredCountryCodes = this.countryCodes;
		this.showCountryDropdown = false;
		this.onFormChange();
	}

	/**
	 * Clear country code search
	 */
	clearCountryCodeSearch(): void {
		this.countryCodeSearchTerm = "";
		this.filteredCountryCodes = this.countryCodes;
		this.showCountryDropdown = false;
		this.profileForm.patchValue({ countryCode: "" });
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
	 * Save profile with biometric verification
	 */
	saveProfile(): void {
		// Ensure form is enabled before saving
		if (!this.isEditing) {
			this.showError("Please enable edit mode before saving.");
			return;
		}

		if (this.profileForm.invalid) {
			this.showError("Please fill in all required fields correctly");
			return;
		}

		if (!this.hasChanges) {
			this.showError("No changes detected. Please modify at least one field before saving.");
			return;
		}

		// Create profile data object
		const profileData = {
			...this.profileForm.value,
			faceBase64: "", // Will be set during biometric verification
			masterPassword: "", // Will be set during biometric verification
		};

		console.log("Profile data being sent:", profileData);

		// Set save data in service
		const saveData: SaveConfirmationData = {
			license: null, // Not needed for profile operations
			domainConfig: null, // Not needed for profile operations
			redirectUrl: "/profile",
			operation: {
				title: this._translocoService.translate("saving_operations.profile_update.title"),
				description: this._translocoService.translate("saving_operations.profile_update.description"),
				action: this._translocoService.translate("saving_operations.profile_update.action"),
				itemName: this._translocoService.translate("saving_operations.profile_update.itemName"),
			},
			profileData: profileData, // Add profile-specific data
		};

		this._saveConfirmationService.setSaveData(saveData);

		// Navigate to save confirmation page
		this._router.navigate(["/save-confirmation"], {
			queryParams: { redirect: "/profile" },
		});
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
	 * Clear alert
	 */
	clearAlert(): void {
		this.showAlert = false;
		this.alertMessage = "";
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
