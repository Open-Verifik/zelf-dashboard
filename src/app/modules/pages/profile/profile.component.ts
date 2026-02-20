import { TextFieldModule } from "@angular/cdk/text-field";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation, HostListener } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatSelectModule } from "@angular/material/select";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatChipsModule } from "@angular/material/chips";
import { Router } from "@angular/router";
import { AuthService } from "app/core/auth/auth.service";
import { PermissionService } from "app/core/auth/permission.service";
import { CommonModule } from "@angular/common";
import { ZelfUser } from "app/core/user/user.types";
import { TranslocoModule, TranslocoService } from "@jsverse/transloco";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { SaveConfirmationService, SaveConfirmationData } from "app/core/services/save-confirmation.service";
import { cleanedCountryCodes } from "app/core/cleaned_country_codes";
import { StaffService } from "app/core/services/staff.service";
import { ClientService } from "app/core/services/client.service";
import { LawyerService } from "app/modules/zelf-legacy/lawyers/lawyer.service";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
	selector: "profile",
	templateUrl: "./profile.component.html",
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		CommonModule,
		MatIconModule,
		MatButtonModule,
		MatMenuModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatProgressSpinnerModule,
		MatChipsModule,
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

	profileForm: FormGroup;
	isEditing: boolean = false;
	hasChanges: boolean = false;

	showAlert: boolean = false;
	alertMessage: string = "";
	alertType: "success" | "error" = "success";

	countryCodes = cleanedCountryCodes;
	countryCodeSearchTerm = "";
	filteredCountryCodes: any[] = this.countryCodes;
	showCountryDropdown = false;

	selectedPhotoFile: File | null = null;
	selectedPhotoBase64: string | null = null;
	photoPreviewUrl: string | null = null;

	// Lawyer-specific
	isLawyer = false;
	lawyerProfile: any = null;
	specializationInput = "";

	constructor(
		private _authService: AuthService,
		private _permissionService: PermissionService,
		private _formBuilder: FormBuilder,
		private _router: Router,
		private _translocoService: TranslocoService,
		private _saveConfirmationService: SaveConfirmationService,
		private _staffService: StaffService,
		private _clientService: ClientService,
		private _lawyerService: LawyerService,
		private _cdr: ChangeDetectorRef,
	) {
		this.profileForm = this._formBuilder.group({
			name: ["", [Validators.required, Validators.minLength(2)]],
			email: ["", [Validators.required, Validators.email]],
			countryCode: ["", [Validators.required]],
			phone: ["", [Validators.required, Validators.pattern(/^\d+$/)]],
			company: [""],
			// Lawyer fields
			specialization: [[]],
			education: [[]],
			locationCity: [""],
			locationCountry: [""],
			bio: [""],
			hourlyRate: [null],
			licenseNumber: [""],
			professionalId: [""],
			zelfName: [""],
			contactEmail: [""],
		});
	}

	get authService(): AuthService {
		return this._authService;
	}

	get permissionService(): PermissionService {
		return this._permissionService;
	}

	get accountTypeLabel(): string {
		if (this.isLawyer) return "Lawyer";
		const t = this._authService.accountType;
		if (!t) return "";
		if (t === "staff" || t === "staff_account") return "profile.accountAccess.accountType_staff";
		if (t === "client_account") return "profile.accountAccess.accountType_client";
		return "profile.accountAccess.accountType_owner";
	}

	get roleLabel(): string {
		if (this.isLawyer) return "Lawyer";
		const r = this._authService.role;
		if (r === "admin") return "profile.accountAccess.role_admin";
		if (r === "write") return "profile.accountAccess.role_write";
		return "profile.accountAccess.role_read";
	}

	ngOnInit(): void {
		this.isLawyer = this._authService.isLawyer;
		this.license = null;
		this.loadUserData();
	}

	private async loadUserData(): Promise<void> {
		try {
			let zelfAccount = this._authService.zelfAccount;
			if (!zelfAccount) {
				this._router.navigate(["/sign-in"]);
				return;
			}

			const publicData = zelfAccount.publicData || zelfAccount.keyvalues;
			const email = publicData?.accountEmail || publicData?.staffEmail || publicData?.lawyerEmail;

			if (email && !this.isLawyer) {
				try {
					const response = await this._clientService.getProfile(email);
					if (response?.data) {
						const freshRecord = response.data;
						freshRecord.publicData = freshRecord.keyvalues || freshRecord.publicData;
						const updatedAccount = { ...zelfAccount, ...freshRecord };
						this._authService.setSession({ zelfProof: this._authService.zelfProof, zelfAccount: updatedAccount });
						zelfAccount = updatedAccount;
					}
				} catch (err) {
					console.error("Failed to refresh profile data", err);
				}
			}

			// Load lawyer profile from backend
			if (this.isLawyer) {
				try {
					const lawyerResp = await this._lawyerService.getMyProfile();
					this.lawyerProfile = lawyerResp?.data || lawyerResp;
				} catch (err) {
					console.error("Failed to load lawyer profile", err);
				}
			}

			this.user = new ZelfUser(zelfAccount);

			const meta = zelfAccount.publicData || zelfAccount.keyvalues || {};
			if (meta.staffPhotoUrl || meta.accountPhotoUrl) {
				this.userPhoto = meta.staffPhotoUrl || meta.accountPhotoUrl;
			}

			this.populateForm();
			this.loading = false;
		} catch (error) {
			console.error("Error loading user data:", error);
		} finally {
			this.loading = false;
			this._cdr.markForCheck();
		}
	}

	private populateForm(): void {
		if (!this.user) return;

		const cleanCountryCode = this.user.countryCode ? this.user.countryCode.replace(/^[^\d+]*/, "").trim() : "";

		this.profileForm.patchValue({
			name: this.user.name || "",
			email: this.user.email || "",
			countryCode: cleanCountryCode,
			phone: this.user.phone || "",
			company: this.user.company || "",
		});

		if (this.user.countryCode) {
			const codeOnly = this.user.countryCode.replace(/^[^\d+]*/, "").trim();
			const country = this.countryCodes.find((c) => c.code === codeOnly);
			if (country) {
				this.countryCodeSearchTerm = country.code;
				this.profileForm.patchValue({ countryCode: country.code });
			}
		}

		// Populate lawyer fields
		if (this.isLawyer && this.lawyerProfile) {
			const lp = this.lawyerProfile.profile || this.lawyerProfile;
			const pd = this.lawyerProfile.publicData || {};

			const specStr = pd.lawyerSpecialization || lp.specialization || "";
			const specArr = typeof specStr === "string" ? specStr.split(",").map((s: string) => s.trim()).filter(Boolean) : specStr;

			const eduStr = pd.lawyerEducation || lp.education || "";
			const eduArr = typeof eduStr === "string" ? eduStr.split(",").map((s: string) => s.trim()).filter(Boolean) : eduStr;

			this.profileForm.patchValue({
				name: pd.lawyerName || lp.name || this.user.name || "",
				phone: pd.lawyerPhone || lp.phone || this.user.phone || "",
				countryCode: pd.lawyerCountryCode || lp.countryCode || this.user.countryCode || "",
				email: pd.lawyerEmail || lp.email || this.user.email || "",
				specialization: specArr,
				education: eduArr,
				locationCity: pd.lawyerCity || lp.location?.city || "",
				locationCountry: pd.lawyerCountry || lp.location?.country || "",
				bio: lp.bio || "",
				hourlyRate: pd.lawyerHourlyRate || lp.hourlyRate || null,
				licenseNumber: pd.lawyerLicenseNumber || lp.licenseNumber || "",
				professionalId: pd.lawyerProfessionalId || lp.professionalId || "",
				zelfName: pd.lawyerZelfName || lp.zelfName || "",
				contactEmail: lp.contactEmail || pd.lawyerEmail || "",
			});
			const lawyerCountryCode = pd.lawyerCountryCode || lp.countryCode || "";
			if (lawyerCountryCode) {
				const codeOnly = String(lawyerCountryCode).replace(/^[^\d+]*/, "").trim();
				const country = this.countryCodes.find((c) => c.code === codeOnly || c.code === lawyerCountryCode);
				if (country) {
					this.countryCodeSearchTerm = country.code;
				}
			}
		}

		this.profileForm.disable();
	}

	get displayName(): string {
		return this.user?.displayName || "User";
	}
	get displayEmail(): string {
		return this.user?.email || "";
	}
	get displayPhone(): string {
		return this.user?.formattedPhone || "";
	}
	get displayCompany(): string {
		return this.user?.company || "Zelf";
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

	toggleEditMode(): void {
		this.isEditing = !this.isEditing;
		if (this.isEditing) {
			this.profileForm.enable();
		} else {
			this.profileForm.disable();
			this.hasChanges = false;
			this.populateForm();
		}
	}

	onFormChange(): void {
		this.hasChanges = true;
	}

	addSpecialization(): void {
		const val = this.specializationInput.trim();
		if (!val) return;
		const current: string[] = this.profileForm.get("specialization")?.value || [];
		if (!current.includes(val)) {
			this.profileForm.patchValue({ specialization: [...current, val] });
			this.onFormChange();
		}
		this.specializationInput = "";
	}

	removeSpecialization(spec: string): void {
		const current: string[] = this.profileForm.get("specialization")?.value || [];
		this.profileForm.patchValue({ specialization: current.filter((s) => s !== spec) });
		this.onFormChange();
	}

	addEducation(): void {
		const current: string[] = this.profileForm.get("education")?.value || [];
		current.push("");
		this.profileForm.patchValue({ education: current });
	}

	filterCountryCodes(): void {
		if (!this.countryCodeSearchTerm.trim()) {
			this.filteredCountryCodes = this.countryCodes;
			this.showCountryDropdown = false;
			return;
		}
		const searchTerm = this.countryCodeSearchTerm.toLowerCase().trim();
		this.filteredCountryCodes = this.countryCodes.filter(
			(country) => country.country.toLowerCase().includes(searchTerm) || country.code.includes(searchTerm),
		);
		this.showCountryDropdown = this.filteredCountryCodes.length > 0;
	}

	selectCountryCode(country: any): void {
		const cleanCode = country.code.replace(/^[^\d+]*/, "").trim();
		this.profileForm.patchValue({ countryCode: cleanCode });
		this.countryCodeSearchTerm = country.code;
		this.filteredCountryCodes = this.countryCodes;
		this.showCountryDropdown = false;
		this.onFormChange();
	}

	clearCountryCodeSearch(): void {
		this.countryCodeSearchTerm = "";
		this.filteredCountryCodes = this.countryCodes;
		this.showCountryDropdown = false;
		this.profileForm.patchValue({ countryCode: "" });
	}

	toggleCountryDropdown(): void {
		this.filteredCountryCodes = this.countryCodes;
		this.showCountryDropdown = true;
	}

	saveProfile(): void {
		if (!this.isEditing) return;
		if (this.profileForm.invalid) {
			this.showError("Please fill in all required fields correctly");
			return;
		}
		if (!this.hasChanges) {
			this.showError("No changes detected");
			return;
		}

		const formValue = this.profileForm.value;
		let profileData: any = {};

		if (this.isLawyer) {
			profileData = {
				name: formValue.name,
				phone: formValue.phone,
				countryCode: formValue.countryCode,
				specialization: formValue.specialization,
				education: formValue.education,
				location: { city: formValue.locationCity, country: formValue.locationCountry },
				bio: formValue.bio,
				hourlyRate: formValue.hourlyRate ? Number(formValue.hourlyRate) : undefined,
				licenseNumber: formValue.licenseNumber,
				professionalId: formValue.professionalId,
				zelfName: formValue.zelfName,
				contactEmail: formValue.contactEmail,
			};
		} else if (this.user?.type === "staff_account") {
			profileData = {
				staffName: formValue.name,
				staffEmail: formValue.email,
				staffPhone: formValue.phone,
				staffCountryCode: formValue.countryCode,
			};
			if (this.selectedPhotoBase64) profileData.staffPhoto = this.selectedPhotoBase64;
		} else {
			profileData = { ...formValue };
			if (this.selectedPhotoBase64) profileData.accountPhoto = this.selectedPhotoBase64;
		}

		const saveData: SaveConfirmationData = {
			domain: null,
			domainConfig: null,
			redirectUrl: "/profile",
			operation: {
				title: "Update Profile",
				description: "Verify your identity to save your profile changes",
				action: "updating",
				itemName: "profile",
			},
			profileData,
		};

		this._saveConfirmationService.setSaveData(saveData);
		this._router.navigate(["/save-confirmation"], { queryParams: { redirect: "/profile" } });
	}

	private showError(message: string): void {
		this.alertMessage = message;
		this.alertType = "error";
		this.showAlert = true;
		setTimeout(() => (this.showAlert = false), 5000);
	}

	clearAlert(): void {
		this.showAlert = false;
		this.alertMessage = "";
	}

	@HostListener("document:click", ["$event"])
	onDocumentClick(event: Event): void {
		const target = event.target as HTMLElement;
		if (!target.closest(".country-code-field")) this.showCountryDropdown = false;
	}

	onPhotoSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			const file = input.files[0];
			if (!file.type.startsWith("image/")) { this.showError("Please select a valid image file"); return; }
			if (file.size > 5 * 1024 * 1024) { this.showError("Image size must be less than 5MB"); return; }
			this.selectedPhotoFile = file;
			const reader = new FileReader();
			reader.onload = (e: any) => {
				this.photoPreviewUrl = e.target.result;
				this.selectedPhotoBase64 = e.target.result;
				this.hasChanges = true;
				this._cdr.detectChanges();
			};
			reader.readAsDataURL(file);
		}
	}

	triggerPhotoUpload(): void {
		const fileInput = document.getElementById("photoInput") as HTMLInputElement;
		if (fileInput) fileInput.click();
	}
}
