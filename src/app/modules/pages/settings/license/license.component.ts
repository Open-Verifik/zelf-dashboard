import { TextFieldModule } from "@angular/cdk/text-field";
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators, FormArray, FormControl } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatOptionModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { Router } from "@angular/router";
import { AuthService } from "app/core/auth/auth.service";
import { HttpWrapperService } from "app/http-wrapper.service";
import { environment } from "../../../../../environments/environment";
import { License, LicenseData, DomainConfig } from "./license.class";
import { SaveConfirmationService } from "../../../../core/services/save-confirmation.service";
import { TranslocoService, TranslocoModule } from "@jsverse/transloco";
@Component({
	selector: "settings-license",
	templateUrl: "./license.component.html",
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		CommonModule,
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
		MatSlideToggleModule,
		MatCheckboxModule,
	],
})
export class SettingsLicenseComponent implements OnInit {
	accountForm: UntypedFormGroup;
	isLoading: boolean = false;
	showAlert: boolean = false;
	alertMessage: string = "";
	alertType: "success" | "error" = "success";

	// License data
	currentLicense: License | null = null;

	// Domain configuration arrays
	reservedWords: string[] = ["www", "api", "admin", "support", "help"];
	supportedCurrencies: string[] = ["USD", "BTC", "ETH", "SOL"];
	whitelistItems: any[] = [];
	pricingTableRows: any[] = [];

	// Inappropriate words filter
	inappropriateWords = [
		"dick",
		"vagina",
		"porn",
		"sex",
		"fuck",
		"shit",
		"bitch",
		"ass",
		"damn",
		"hell",
		"crap",
		"piss",
		"bastard",
		"whore",
		"slut",
		"fag",
		"nigger",
		"retard",
		"idiot",
		"stupid",
		"moron",
		"dumb",
		"hate",
		"kill",
		"die",
		"death",
		"murder",
		"suicide",
	];

	/**
	 * Constructor
	 */
	constructor(
		private _formBuilder: UntypedFormBuilder,
		private _authService: AuthService,
		private _httpWrapper: HttpWrapperService,
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
		// Create the comprehensive form
		this.accountForm = this._formBuilder.group({
			// Basic Information
			domain: ["", [Validators.required, Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/)]],
			type: ["custom", Validators.required],
			status: ["active", Validators.required],
			owner: ["zelf-team", Validators.required],
			description: ["Official Zelf domain", Validators.required],

			// Features
			znsEnabled: [true],
			zelfkeysEnabled: [true],

			// Validation Rules
			minLength: [3, [Validators.required, Validators.min(1)]],
			maxLength: [50, [Validators.required, Validators.min(1)]],
			holdSuffix: [".hold", Validators.required],
			contentFilterEnabled: [true],

			// Storage Options
			ipfsEnabled: [true],
			arweaveEnabled: [true],
			walrusEnabled: [true],
			keyPrefix: ["tagName", Validators.required],

			// Payment Settings
			coinbaseEnabled: [true],
			cryptoEnabled: [true],
			stripeEnabled: [true],

			// Limits
			maxTags: [10000, [Validators.required, Validators.min(1)]],
			maxZelfkeys: [10000, [Validators.required, Validators.min(1)]],

			// Metadata
			launchDate: ["2023-01-01"],
			version: ["1.0.0", Validators.required],
			documentation: ["https://docs.zelf.world"],
			community: [""],
			enterprise: [""],
			support: ["standard"],
		});

		// Load current license if exists first
		this.loadCurrentLicense();

		// Initialize whitelist items if not loaded from license
		if (this.whitelistItems.length === 0) {
			this.initializeWhitelistItems();
		}

		// Add whitelist form controls
		this.addWhitelistFormControls();

		// Initialize pricing table
		this.initializePricingTable();
	}

	// -----------------------------------------------------------------------------------------------------
	// @ Public methods
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Initialize whitelist items
	 */
	initializeWhitelistItems(): void {
		this.whitelistItems = [{ domain: "", discount: "", type: "%" }];
	}

	/**
	 * Add whitelist form controls
	 */
	addWhitelistFormControls(): void {
		this.whitelistItems.forEach((item, index) => {
			// Check if control already exists before adding
			if (!this.accountForm.get(`whitelistDomain_${index}`)) {
				this.accountForm.addControl(`whitelistDomain_${index}`, new FormControl(item.domain));
			}
			if (!this.accountForm.get(`whitelistDiscount_${index}`)) {
				this.accountForm.addControl(`whitelistDiscount_${index}`, new FormControl(item.discount));
			}
			if (!this.accountForm.get(`whitelistType_${index}`)) {
				this.accountForm.addControl(`whitelistType_${index}`, new FormControl(item.type));
			}
		});
	}

	/**
	 * Remove whitelist form controls
	 */
	removeWhitelistFormControls(): void {
		this.whitelistItems.forEach((_, index) => {
			this.accountForm.removeControl(`whitelistDomain_${index}`);
			this.accountForm.removeControl(`whitelistDiscount_${index}`);
			this.accountForm.removeControl(`whitelistType_${index}`);
		});
	}

	/**
	 * Add reserved word
	 */
	addReservedWord(word: string): void {
		if (word && word.trim() && !this.reservedWords.includes(word.trim())) {
			this.reservedWords.push(word.trim());
		}
	}

	/**
	 * Remove reserved word
	 */
	removeReservedWord(word: string): void {
		const index = this.reservedWords.indexOf(word);
		if (index > -1) {
			this.reservedWords.splice(index, 1);
		}
	}

	/**
	 * Add currency
	 */
	addCurrency(currency: string): void {
		if (currency && currency.trim() && !this.supportedCurrencies.includes(currency.trim().toUpperCase())) {
			this.supportedCurrencies.push(currency.trim().toUpperCase());
		}
	}

	/**
	 * Remove currency
	 */
	removeCurrency(currency: string): void {
		const index = this.supportedCurrencies.indexOf(currency);
		if (index > -1) {
			this.supportedCurrencies.splice(index, 1);
		}
	}

	/**
	 * Add whitelist item
	 */
	addWhitelistItem(): void {
		console.log("Adding whitelist item, current length:", this.whitelistItems.length);

		// Add new item to array
		const newItem = { domain: "", discount: "", type: "%" };
		this.whitelistItems.push(newItem);

		console.log("After adding, length:", this.whitelistItems.length);
		console.log("Whitelist items:", this.whitelistItems);

		// Add form controls for the new item
		const newIndex = this.whitelistItems.length - 1;
		this.accountForm.addControl(`whitelistDomain_${newIndex}`, new FormControl(""));
		this.accountForm.addControl(`whitelistDiscount_${newIndex}`, new FormControl(""));
		this.accountForm.addControl(`whitelistType_${newIndex}`, new FormControl("%"));

		console.log("Form controls added for index:", newIndex);
	}

	/**
	 * Track by function for whitelist items
	 */
	trackByWhitelistItem(index: number, item: any): number {
		return index;
	}

	/**
	 * Remove whitelist item
	 */
	removeWhitelistItem(index: number): void {
		if (this.whitelistItems.length > 1) {
			// Remove form controls first
			this.accountForm.removeControl(`whitelistDomain_${index}`);
			this.accountForm.removeControl(`whitelistDiscount_${index}`);
			this.accountForm.removeControl(`whitelistType_${index}`);

			// Remove from array
			this.whitelistItems.splice(index, 1);

			// Rebuild form controls with updated indices
			this.removeWhitelistFormControls();
			this.addWhitelistFormControls();
		}
	}

	/**
	 * Validate domain name against inappropriate words
	 */
	validateDomainName(name: string): boolean {
		if (!this.accountForm.get("contentFilterEnabled")?.value) {
			return true;
		}

		const lowerName = name.toLowerCase();
		return !this.inappropriateWords.some((word) => lowerName.includes(word));
	}

	/**
	 * Get payment methods array
	 */
	getPaymentMethods(): string[] {
		const methods: string[] = [];
		if (this.accountForm.get("coinbaseEnabled")?.value) methods.push("coinbase");
		if (this.accountForm.get("cryptoEnabled")?.value) methods.push("crypto");
		if (this.accountForm.get("stripeEnabled")?.value) methods.push("stripe");
		return methods;
	}

	/**
	 * Get default pricing table
	 */
	getDefaultPricingTable(): { [key: string]: { [key: string]: number } } {
		return {
			1: { 1: 240, 2: 432, 3: 612, 4: 768, 5: 900, lifetime: 3600 },
			2: { 1: 120, 2: 216, 3: 306, 4: 384, 5: 450, lifetime: 1800 },
			3: { 1: 72, 2: 130, 3: 184, 4: 230, 5: 270, lifetime: 1080 },
			4: { 1: 36, 2: 65, 3: 92, 4: 115, 5: 135, lifetime: 540 },
			5: { 1: 30, 2: 54, 3: 76, 4: 96, 5: 112, lifetime: 450 },
			"6-15": { 1: 24, 2: 43, 3: 61, 4: 77, 5: 90, lifetime: 360 },
			16: { 1: 23, 2: 41, 3: 59, 4: 74, 5: 86, lifetime: 345 },
			17: { 1: 22, 2: 40, 3: 56, 4: 70, 5: 82, lifetime: 330 },
			18: { 1: 21, 2: 38, 3: 54, 4: 67, 5: 79, lifetime: 315 },
			19: { 1: 20, 2: 36, 3: 51, 4: 64, 5: 75, lifetime: 300 },
			20: { 1: 19, 2: 34, 3: 48, 4: 61, 5: 72, lifetime: 285 },
			21: { 1: 18, 2: 32, 3: 46, 4: 58, 5: 68, lifetime: 270 },
			22: { 1: 17, 2: 31, 3: 43, 4: 54, 5: 64, lifetime: 255 },
			23: { 1: 16, 2: 29, 3: 41, 4: 51, 5: 60, lifetime: 240 },
			24: { 1: 15, 2: 27, 3: 38, 4: 48, 5: 56, lifetime: 225 },
			25: { 1: 14, 2: 25, 3: 36, 4: 45, 5: 53, lifetime: 210 },
			26: { 1: 13, 2: 23, 3: 33, 4: 42, 5: 49, lifetime: 195 },
			27: { 1: 12, 2: 22, 3: 31, 4: 38, 5: 45, lifetime: 180 },
		};
	}

	/**
	 * Build domain configuration object
	 */
	buildDomainConfig(): DomainConfig {
		const formValue = this.accountForm.value;

		// Build whitelist object
		const whitelist: any = {};
		this.whitelistItems.forEach((_, index) => {
			const domain = this.accountForm.get(`whitelistDomain_${index}`)?.value;
			const discount = this.accountForm.get(`whitelistDiscount_${index}`)?.value;
			const type = this.accountForm.get(`whitelistType_${index}`)?.value;

			if (domain && discount && type) {
				whitelist[domain] = `${discount}${type}`;
			}
		});

		return {
			name: formValue.domain,
			type: formValue.type,
			holdSuffix: formValue.holdSuffix,
			status: formValue.status,
			owner: formValue.owner,
			description: formValue.description,
			limits: {
				tags: formValue.maxTags,
				zelfkeys: formValue.maxZelfkeys,
			},
			features: [
				{
					name: "Zelf Name System",
					code: "zns",
					description: "Encryptions, Decryptions, previews of ZelfProofs",
					enabled: formValue.znsEnabled,
				},
				{
					name: "Zelf Keys",
					code: "zelfkeys",
					description: "Zelf Keys: Passwords, Notes, Credit Cards, etc.",
					enabled: formValue.zelfkeysEnabled,
				},
			],
			validation: {
				minLength: formValue.minLength,
				maxLength: formValue.maxLength,
				allowedChars: /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/,
				reserved: this.reservedWords,
				customRules: [],
			},
			storage: {
				keyPrefix: formValue.keyPrefix,
				ipfsEnabled: formValue.ipfsEnabled,
				arweaveEnabled: formValue.arweaveEnabled,
				walrusEnabled: formValue.walrusEnabled,
			},
			tagPaymentSettings: {
				methods: this.getPaymentMethods(),
				currencies: this.supportedCurrencies,
				whitelist: whitelist,
				pricingTable: this.getPricingTableFromRows(),
			},
			metadata: {
				launchDate: formValue.launchDate,
				version: formValue.version,
				documentation: formValue.documentation,
				community: formValue.community || undefined,
				enterprise: formValue.enterprise || undefined,
				support: formValue.support,
			},
		};
	}

	/**
	 * Load current license from localStorage
	 */
	loadCurrentLicense(): void {
		const storedLicense = localStorage.getItem("license");
		if (storedLicense) {
			try {
				const licenseData = JSON.parse(storedLicense);
				this.currentLicense = License.fromJSON(licenseData);

				// Populate form with existing license data
				if (this.currentLicense.domainConfig) {
					const config = this.currentLicense.domainConfig;
					this.accountForm.patchValue({
						domain: config.name || "",
						type: config.type || "custom",
						status: config.status || "active",
						owner: config.owner || "zelf-team",
						description: config.description || "",
						znsEnabled: config.features?.[0]?.enabled || true,
						zelfkeysEnabled: config.features?.[1]?.enabled || true,
						minLength: config.validation?.minLength || 3,
						maxLength: config.validation?.maxLength || 50,
						holdSuffix: config.holdSuffix || ".hold",
						ipfsEnabled: config.storage?.ipfsEnabled || true,
						arweaveEnabled: config.storage?.arweaveEnabled || true,
						walrusEnabled: config.storage?.walrusEnabled || true,
						keyPrefix: config.storage?.keyPrefix || "tagName",
						coinbaseEnabled: config.tagPaymentSettings?.methods?.includes("coinbase") || true,
						cryptoEnabled: config.tagPaymentSettings?.methods?.includes("crypto") || true,
						stripeEnabled: config.tagPaymentSettings?.methods?.includes("stripe") || true,
						maxTags: config.limits?.tags || 10000,
						maxZelfkeys: config.limits?.zelfkeys || 10000,
						launchDate: config.metadata?.launchDate || "2023-01-01",
						version: config.metadata?.version || "1.0.0",
						documentation: config.metadata?.documentation || "",
						community: config.metadata?.community || "",
						enterprise: config.metadata?.enterprise || "",
						support: config.metadata?.support || "standard",
					});

					// Populate arrays
					if (config.validation?.reserved) {
						this.reservedWords = [...config.validation.reserved];
					}
					if (config.tagPaymentSettings?.currencies) {
						this.supportedCurrencies = [...config.tagPaymentSettings.currencies];
					}
					if (config.tagPaymentSettings?.pricingTable) {
						this.loadPricingTableFromConfig(config.tagPaymentSettings.pricingTable);
					}
					if (config.tagPaymentSettings?.whitelist) {
						this.whitelistItems = Object.entries(config.tagPaymentSettings.whitelist).map(([domain, price]) => {
							const priceStr = price as string;
							const match = priceStr.match(/^(\d+(?:\.\d+)?)([%$])$/);
							if (match) {
								return {
									domain,
									discount: match[1],
									type: match[2],
								};
							}
							return {
								domain,
								discount: priceStr,
								type: "%",
							};
						});

						// Rebuild form controls with loaded data
						this.removeWhitelistFormControls();
						this.addWhitelistFormControls();

						// Populate form controls
						this.whitelistItems.forEach((item, index) => {
							this.accountForm.get(`whitelistDomain_${index}`)?.setValue(item.domain);
							this.accountForm.get(`whitelistDiscount_${index}`)?.setValue(item.discount);
							this.accountForm.get(`whitelistType_${index}`)?.setValue(item.type);
						});
					}
				} else {
					// Fallback for old license format
					this.accountForm.patchValue({
						domain: this.currentLicense.domain || "",
					});
				}
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
			this.showError("Please fill in all required fields correctly");
			return;
		}

		const domain = this.accountForm.get("domain")?.value;
		if (!domain) {
			this.showError("Domain is required");
			return;
		}

		// Validate domain name against inappropriate words
		if (!this.validateDomainName(domain)) {
			this.showError("Domain name contains inappropriate content. Please choose a different name.");
			return;
		}

		// Check if domain has changed
		if (this.currentLicense && this.currentLicense.domain === domain) {
			this.showError("Domain is already set to this value");
			return;
		}

		// Build domain configuration
		const domainConfig = this.buildDomainConfig();

		// Create license object
		const licenseData: LicenseData = {
			domain,
			domainConfig,
			faceBase64: "", // Will be set during biometric verification
			masterPassword: "", // Will be set during biometric verification
		};
		const license = new License(licenseData);

		// Set save data in service
		this._saveConfirmationService.setSaveData({
			license,
			domainConfig,
			redirectUrl: "/settings/license",
			operation: {
				title: this._translocoService.translate("saving_operations.license_configuration.title"),
				description: this._translocoService.translate("saving_operations.license_configuration.description"),
				action: this._translocoService.translate("saving_operations.license_configuration.action"),
				itemName: this._translocoService.translate("saving_operations.license_configuration.itemName"),
			},
		});

		// Navigate to save confirmation page
		this._router.navigate(["/save-confirmation"], {
			queryParams: { redirect: "/settings/license" },
		});
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

	/**
	 * Get current license instance
	 */
	getCurrentLicense(): License | null {
		return this.currentLicense;
	}

	/**
	 * Check if current license is active
	 */
	isLicenseActive(): boolean {
		return this.currentLicense?.isActive() || false;
	}

	/**
	 * Check if current license supports a feature
	 */
	licenseSupportsFeature(featureCode: string): boolean {
		return this.currentLicense?.supportsFeature(featureCode) || false;
	}

	/**
	 * Get price for a tag name and duration
	 */
	getTagPrice(tagName: string, duration: string = "1", referralTagName: string = ""): any {
		return this.currentLicense?.getPrice(tagName, duration, referralTagName) || null;
	}

	/**
	 * Validate a tag name against current license rules
	 */
	validateTagName(tagName: string): { valid: boolean; error?: string } {
		return this.currentLicense?.validateTagName(tagName) || { valid: false, error: "No license found" };
	}

	/**
	 * Generate hold domain name
	 */
	generateHoldDomain(tagName: string): string {
		return this.currentLicense?.generateHoldDomain(tagName) || "";
	}

	/**
	 * Initialize pricing table rows
	 */
	initializePricingTable(): void {
		const defaultPricing = this.getDefaultPricingTable();
		this.pricingTableRows = [];

		// Add individual length rows (1-5)
		for (let i = 1; i <= 5; i++) {
			this.pricingTableRows.push({
				length: i.toString(),
				prices: { ...defaultPricing[i] },
			});
		}

		// Add range row (6-15)
		this.pricingTableRows.push({
			length: "6-15",
			prices: { ...defaultPricing["6-15"] },
		});

		// Add individual length rows (16-27)
		for (let i = 16; i <= 27; i++) {
			this.pricingTableRows.push({
				length: i.toString(),
				prices: { ...defaultPricing[i] },
			});
		}
	}

	/**
	 * Reset pricing table to default values
	 */
	resetPricingTable(): void {
		this.initializePricingTable();
	}

	/**
	 * Track by function for pricing table rows
	 */
	trackByPricingRow(index: number, item: any): string {
		return item.length;
	}

	/**
	 * Get pricing table as object for domain config
	 */
	getPricingTableFromRows(): { [key: string]: { [key: string]: number } } {
		const pricingTable: { [key: string]: { [key: string]: number } } = {};

		this.pricingTableRows.forEach((row) => {
			pricingTable[row.length] = { ...row.prices };
		});

		return pricingTable;
	}

	/**
	 * Load pricing table from domain config
	 */
	loadPricingTableFromConfig(pricingTable: { [key: string]: { [key: string]: number } }): void {
		if (!pricingTable) {
			this.initializePricingTable();
			return;
		}

		this.pricingTableRows = [];

		// Add individual length rows (1-5)
		for (let i = 1; i <= 5; i++) {
			this.pricingTableRows.push({
				length: i.toString(),
				prices: pricingTable[i] ? { ...pricingTable[i] } : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, lifetime: 0 },
			});
		}

		// Add range row (6-15)
		this.pricingTableRows.push({
			length: "6-15",
			prices: pricingTable["6-15"] ? { ...pricingTable["6-15"] } : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, lifetime: 0 },
		});

		// Add individual length rows (16-27)
		for (let i = 16; i <= 27; i++) {
			this.pricingTableRows.push({
				length: i.toString(),
				prices: pricingTable[i] ? { ...pricingTable[i] } : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, lifetime: 0 },
			});
		}
	}
}
