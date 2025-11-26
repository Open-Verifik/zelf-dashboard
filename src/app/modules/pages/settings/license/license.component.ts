import { TextFieldModule } from "@angular/cdk/text-field";
import { CommonModule } from "@angular/common";
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatOptionModule } from "@angular/material/core";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from "@angular/material/select";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { Router } from "@angular/router";
import { TranslocoModule, TranslocoService } from "@jsverse/transloco";

import { SaveConfirmationService } from "../../../../core/services/save-confirmation.service";
import { HttpWrapperService } from "../../../../http-wrapper.service";
import { DomainConfig, License, NetworkConfig } from "./license.class";
import { LicenseService } from "./license.service";
import { NetworksConfigComponent } from "./networks-config/networks-config.component";

export interface PricingRow {
	length: string;
	oneYear: number;
	twoYears: number;
	threeYears: number;
	fourYears: number;
	fiveYears: number;
	lifetime: number;
}

export interface WhitelistItem {
	domain: string;
	discount: string | number;
	type: string;
}

@Component({
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	selector: "settings-license",
	templateUrl: "./license.component.html",
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
		TranslocoModule,
		NetworksConfigComponent,
	],
})
export class SettingsLicenseComponent implements OnInit, AfterViewInit {
	accountForm: UntypedFormGroup;
	alertMessage: string = "";
	alertType: "success" | "error" = "success";
	currentLicense: License | null = null;
	isLoading: boolean = false;
	pricingTableRows: PricingRow[] = [];
	reservedWords: string[] = ["www", "api", "admin", "support", "help"];
	showAlert: boolean = false;
	whitelistItems: WhitelistItem[] = [];

	zelfkeysPlans: any[] = [];

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

	constructor(
		private _formBuilder: UntypedFormBuilder,
		private _router: Router,
		private _saveConfirmationService: SaveConfirmationService,
		private _translocoService: TranslocoService,
		private _cdr: ChangeDetectorRef,
		private _licenseService: LicenseService,
		private _httpWrapper: HttpWrapperService
	) {}

	get networksFormGroup(): UntypedFormGroup {
		return this.accountForm.get("networks") as UntypedFormGroup;
	}

	ngOnInit(): void {
		this.initializeWhitelistItems();
		this.initializePricingTable();

		this.createEmptyForm();
	}

	/**
	 * After view init - load license data and populate form
	 */
	ngAfterViewInit(): void {
		this.loadLicense().then(() => {
			this.populateFormFromLicense();
		});
	}

	/**
	 * Create empty form to prevent template errors
	 */
	private createEmptyForm(): void {
		this.accountForm = this._formBuilder.group({
			// Basic Information
			domain: ["", [Validators.required, Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/)]],
			status: [{ value: "active", disabled: true }],
			owner: ["zelf-team", Validators.required],
			description: ["Official Zelf domain", Validators.required],

			// Features
			znsEnabled: [true],
			zelfkeysEnabled: [true],

			// Validation Rules
			minLength: [3, [Validators.required, Validators.min(1)]],
			maxLength: [27, [Validators.required, Validators.min(1), Validators.max(27)]],
			holdSuffix: [".hold", Validators.required],
			contentFilterEnabled: [true],

			// Storage Options (ZNS)
			ipfsEnabled: [true],
			arweaveEnabled: [true],
			walrusEnabled: [true],
			keyPrefix: ["tagName", Validators.required],

			// Storage Options (ZelfKeys)
			zelfkeysIpfsEnabled: [true],
			zelfkeysArweaveEnabled: [true],
			zelfkeysWalrusEnabled: [true],
			zelfkeysKeyPrefix: ["tagName", Validators.required],

			// Payment Settings
			coinbaseEnabled: [true],
			cryptoEnabled: [true],
			stripeEnabled: [true],
			networks: this.createNetworksFormGroup(),

			// Start and End Dates (read-only)
			startDate: [{ value: "", disabled: true }],
			endDate: [{ value: "", disabled: true }],

			// Metadata
			launchDate: ["2023-01-01"],
			version: ["1.0.0", Validators.required],
			documentation: ["https://docs.zelf.world"],
			community: [""],
			enterprise: [""],
			support: ["standard"],
		});

		// Add whitelist form controls immediately
		this.addWhitelistFormControls();
	}

	/**
	 * Create networks form group
	 */
	private createNetworksFormGroup(networks: { [key: string]: NetworkConfig } | null = null): UntypedFormGroup {
		const group = this._formBuilder.group({});

		const defaultLicense = License.createEmpty("temp");
		const defaultNetworks = networks || defaultLicense.getNetworks();

		Object.keys(defaultNetworks).forEach((key) => {
			const net = defaultNetworks[key];
			// Skip custom networks if they exist in data but we don't support them in UI anymore
			if (!key.startsWith("other_")) {
				group.addControl(
					key,
					this._formBuilder.group({
						enabled: [net.enabled],
						nativeCurrency: this._formBuilder.group({
							enabled: [net.nativeCurrency.enabled],
							code: [net.nativeCurrency.code],
						}),
						altCoins: net.altCoins
							? this._formBuilder.group({
									enabled: [net.altCoins.enabled],
									standard: [net.altCoins.standard],
								})
							: null,
					})
				);
			}
		});
		return group;
	}

	// -----------------------------------------------------------------------------------------------------
	// @ Public methods
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Initialize whitelist items
	 */
	initializeWhitelistItems(): void {
		this.whitelistItems = [{ domain: "", discount: "", type: "percentage" }];
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
	 * Toggle payment method selection
	 */
	togglePaymentMethod(method: string): void {
		const currentMethods = this.getPaymentMethods();
		if (currentMethods.includes(method)) {
			// Remove method
			if (method === "coinbase") {
				this.accountForm.get("coinbaseEnabled")?.setValue(false);
			} else if (method === "crypto") {
				this.accountForm.get("cryptoEnabled")?.setValue(false);
			} else if (method === "stripe") {
				this.accountForm.get("stripeEnabled")?.setValue(false);
			}
		} else {
			// Add method
			if (method === "coinbase") {
				this.accountForm.get("coinbaseEnabled")?.setValue(true);
			} else if (method === "crypto") {
				this.accountForm.get("cryptoEnabled")?.setValue(true);
			} else if (method === "stripe") {
				this.accountForm.get("stripeEnabled")?.setValue(true);
			}
		}
	}

	/**
	 * Check if payment method is enabled
	 */
	isPaymentMethodEnabled(method: string): boolean {
		return this.getPaymentMethods().includes(method);
	}

	/**
	 * Add whitelist item
	 */
	addWhitelistItem(): void {
		// Add new item to array
		const newItem = { domain: "", discount: "", type: "percentage" };
		this.whitelistItems.push(newItem);

		// Add form controls for the new item (for compatibility, though template uses ngModel)
		const newIndex = this.whitelistItems.length - 1;
		this.accountForm.addControl(`whitelistDomain_${newIndex}`, new FormControl(""));
		this.accountForm.addControl(`whitelistDiscount_${newIndex}`, new FormControl(""));
		this.accountForm.addControl(`whitelistType_${newIndex}`, new FormControl("percentage"));
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
	 * Check if there are any changes between current license and form data
	 */
	hasLicenseChanges(newDomain: string): boolean {
		if (!this.currentLicense) {
			return true; // No current license, so any data is a change
		}

		const formValue = this.accountForm.value;
		const currentConfig = this.currentLicense.domainConfig;

		// Check basic domain info
		if (this.currentLicense.domain !== newDomain) return true;
		if (currentConfig.name !== newDomain) return true;
		if (currentConfig.holdSuffix !== formValue.holdSuffix) return true;
		if (currentConfig.status !== formValue.status) return true;
		if (currentConfig.owner !== formValue.owner) return true;
		if (currentConfig.description !== formValue.description) return true;

		// Note: startDate and endDate are read-only and not checked for changes

		// Check features
		const currentZnsEnabled = true; // Default to true
		const currentZelfkeysEnabled = true; // Default to true
		if (currentZnsEnabled !== formValue.znsEnabled) return true;
		if (currentZelfkeysEnabled !== formValue.zelfkeysEnabled) return true;

		// Check validation rules
		if (currentConfig.tags?.minLength !== formValue.minLength) return true;
		if (currentConfig.tags?.maxLength !== formValue.maxLength) return true;

		// Check ZNS storage settings
		if (currentConfig.tags?.storage?.keyPrefix !== formValue.keyPrefix) return true;
		if (currentConfig.tags?.storage?.ipfsEnabled !== formValue.ipfsEnabled) return true;
		if (currentConfig.tags?.storage?.arweaveEnabled !== formValue.arweaveEnabled) return true;
		if (currentConfig.tags?.storage?.walrusEnabled !== formValue.walrusEnabled) return true;

		// Check ZelfKeys storage settings
		if (currentConfig.zelfkeys?.storage?.keyPrefix !== formValue.zelfkeysKeyPrefix) return true;
		if (currentConfig.zelfkeys?.storage?.ipfsEnabled !== formValue.zelfkeysIpfsEnabled) return true;
		if (currentConfig.zelfkeys?.storage?.arweaveEnabled !== formValue.zelfkeysArweaveEnabled) return true;
		if (currentConfig.zelfkeys?.storage?.walrusEnabled !== formValue.zelfkeysWalrusEnabled) return true;

		// Check payment methods
		const currentMethods = currentConfig.tags?.payment?.methods || [];
		const newMethods = this.getPaymentMethods();
		if (JSON.stringify(currentMethods.sort()) !== JSON.stringify(newMethods.sort())) return true;

		// Check networks
		const currentNetworks = currentConfig.tags?.payment?.networks || this.currentLicense.getNetworks();
		const newNetworks = formValue.networks;
		if (JSON.stringify(currentNetworks) !== JSON.stringify(newNetworks)) return true;

		// Check whitelist
		const currentWhitelist = currentConfig.tags?.payment?.whitelist || {};
		const newWhitelist = this.buildWhitelistFromForm();
		if (JSON.stringify(currentWhitelist) !== JSON.stringify(newWhitelist)) return true;

		// Check pricing table
		const currentPricingTable = currentConfig.tags?.payment?.pricingTable || {};
		const newPricingTable = this.getPricingTableFromRows();
		if (JSON.stringify(currentPricingTable) !== JSON.stringify(newPricingTable)) return true;

		// Check metadata
		if (currentConfig.metadata.launchDate !== formValue.launchDate) return true;
		if (currentConfig.metadata.version !== formValue.version) return true;
		if (currentConfig.metadata.documentation !== formValue.documentation) return true;
		if (currentConfig.metadata.community !== formValue.community) return true;
		if (currentConfig.metadata.enterprise !== formValue.enterprise) return true;
		if (currentConfig.metadata.support !== formValue.support) return true;

		return false; // No changes detected
	}

	/**
	 * Get detailed list of changes between current license and form data
	 * Useful for debugging and user feedback
	 */
	getLicenseChanges(newDomain: string): string[] {
		if (!this.currentLicense) {
			return ["Creating new license"];
		}

		const changes: string[] = [];
		const formValue = this.accountForm.value;
		const currentConfig = this.currentLicense.domainConfig;

		this.getBasicInfoChanges(currentConfig, newDomain, formValue, changes);
		this.getFeatureChanges(formValue, changes);
		this.getValidationChanges(currentConfig, formValue, changes);
		this.getStorageChanges(currentConfig, formValue, changes);
		this.getPaymentChanges(currentConfig, formValue, changes);
		this.getMetadataChanges(currentConfig, formValue, changes);

		return changes;
	}

	private getBasicInfoChanges(currentConfig: DomainConfig, newDomain: string, formValue: any, changes: string[]): void {
		if (this.currentLicense?.domain !== newDomain) changes.push(`Domain: ${this.currentLicense?.domain} → ${newDomain}`);
		if (currentConfig.name !== newDomain) changes.push(`Name: ${currentConfig.name} → ${newDomain}`);
		if (currentConfig.holdSuffix !== formValue.holdSuffix) changes.push(`Hold Suffix: ${currentConfig.holdSuffix} → ${formValue.holdSuffix}`);
		if (currentConfig.status !== formValue.status) changes.push(`Status: ${currentConfig.status} → ${formValue.status}`);
		if (currentConfig.owner !== formValue.owner) changes.push(`Owner: ${currentConfig.owner} → ${formValue.owner}`);
		if (currentConfig.description !== formValue.description) changes.push(`Description: ${currentConfig.description} → ${formValue.description}`);
	}

	private getFeatureChanges(formValue: any, changes: string[]): void {
		const currentZnsEnabled = true; // Default to true
		const currentZelfkeysEnabled = true; // Default to true
		if (currentZnsEnabled !== formValue.znsEnabled) changes.push(`ZNS Feature: ${currentZnsEnabled} → ${formValue.znsEnabled}`);
		if (currentZelfkeysEnabled !== formValue.zelfkeysEnabled)
			changes.push(`Zelfkeys Feature: ${currentZelfkeysEnabled} → ${formValue.zelfkeysEnabled}`);
	}

	private getValidationChanges(currentConfig: DomainConfig, formValue: any, changes: string[]): void {
		if (currentConfig.tags?.minLength !== formValue.minLength)
			changes.push(`Min Length: ${currentConfig.tags?.minLength} → ${formValue.minLength}`);
		if (currentConfig.tags?.maxLength !== formValue.maxLength)
			changes.push(`Max Length: ${currentConfig.tags?.maxLength} → ${formValue.maxLength}`);
	}

	private getStorageChanges(currentConfig: DomainConfig, formValue: any, changes: string[]): void {
		// Check ZNS storage settings
		if (currentConfig.tags?.storage?.keyPrefix !== formValue.keyPrefix)
			changes.push(`ZNS Key Prefix: ${currentConfig.tags?.storage?.keyPrefix} → ${formValue.keyPrefix}`);
		if (currentConfig.tags?.storage?.ipfsEnabled !== formValue.ipfsEnabled)
			changes.push(`ZNS IPFS Enabled: ${currentConfig.tags?.storage?.ipfsEnabled} → ${formValue.ipfsEnabled}`);
		if (currentConfig.tags?.storage?.arweaveEnabled !== formValue.arweaveEnabled)
			changes.push(`ZNS Arweave Enabled: ${currentConfig.tags?.storage?.arweaveEnabled} → ${formValue.arweaveEnabled}`);
		if (currentConfig.tags?.storage?.walrusEnabled !== formValue.walrusEnabled)
			changes.push(`ZNS Walrus Enabled: ${currentConfig.tags?.storage?.walrusEnabled} → ${formValue.walrusEnabled}`);

		// Check ZelfKeys storage settings
		if (currentConfig.zelfkeys?.storage?.keyPrefix !== formValue.zelfkeysKeyPrefix)
			changes.push(`ZelfKeys Key Prefix: ${currentConfig.zelfkeys?.storage?.keyPrefix} → ${formValue.zelfkeysKeyPrefix}`);
		if (currentConfig.zelfkeys?.storage?.ipfsEnabled !== formValue.zelfkeysIpfsEnabled)
			changes.push(`ZelfKeys IPFS Enabled: ${currentConfig.zelfkeys?.storage?.ipfsEnabled} → ${formValue.zelfkeysIpfsEnabled}`);
		if (currentConfig.zelfkeys?.storage?.arweaveEnabled !== formValue.zelfkeysArweaveEnabled)
			changes.push(`ZelfKeys Arweave Enabled: ${currentConfig.zelfkeys?.storage?.arweaveEnabled} → ${formValue.zelfkeysArweaveEnabled}`);
		if (currentConfig.zelfkeys?.storage?.walrusEnabled !== formValue.zelfkeysWalrusEnabled)
			changes.push(`ZelfKeys Walrus Enabled: ${currentConfig.zelfkeys?.storage?.walrusEnabled} → ${formValue.zelfkeysWalrusEnabled}`);
	}

	private getPaymentChanges(currentConfig: DomainConfig, formValue: any, changes: string[]): void {
		// Check payment methods
		const currentMethods = currentConfig.tags?.payment?.methods || [];
		const newMethods = this.getPaymentMethods();
		if (JSON.stringify(currentMethods.sort()) !== JSON.stringify(newMethods.sort())) {
			changes.push(`Payment Methods: ${currentMethods.join(", ")} → ${newMethods.join(", ")}`);
		}

		// Check networks
		const currentNetworks = currentConfig.tags?.payment?.networks || this.currentLicense?.getNetworks();
		const newNetworks = formValue.networks;
		if (JSON.stringify(currentNetworks) !== JSON.stringify(newNetworks)) {
			changes.push(`Networks configuration updated`);
		}

		// Check whitelist
		const currentWhitelist = currentConfig.tags?.payment?.whitelist || {};
		const newWhitelist = this.buildWhitelistFromForm();
		if (JSON.stringify(currentWhitelist) !== JSON.stringify(newWhitelist)) {
			changes.push(`Whitelist: ${Object.keys(currentWhitelist).length} → ${Object.keys(newWhitelist).length} entries`);
		}

		// Check pricing table
		const currentPricingTable = currentConfig.tags?.payment?.pricingTable || {};
		const newPricingTable = this.getPricingTableFromRows();
		if (JSON.stringify(currentPricingTable) !== JSON.stringify(newPricingTable)) {
			changes.push(`Pricing Table: Updated`);
		}
	}

	private getMetadataChanges(currentConfig: DomainConfig, formValue: any, changes: string[]): void {
		if (currentConfig.metadata.launchDate !== formValue.launchDate)
			changes.push(`Launch Date: ${currentConfig.metadata.launchDate} → ${formValue.launchDate}`);
		if (currentConfig.metadata.version !== formValue.version) changes.push(`Version: ${currentConfig.metadata.version} → ${formValue.version}`);
		if (currentConfig.metadata.documentation !== formValue.documentation)
			changes.push(`Documentation: ${currentConfig.metadata.documentation} → ${formValue.documentation}`);
		if (currentConfig.metadata.community !== formValue.community)
			changes.push(`Community: ${currentConfig.metadata.community} → ${formValue.community}`);
		if (currentConfig.metadata.enterprise !== formValue.enterprise)
			changes.push(`Enterprise: ${currentConfig.metadata.enterprise} → ${formValue.enterprise}`);
		if (currentConfig.metadata.support !== formValue.support) changes.push(`Support: ${currentConfig.metadata.support} → ${formValue.support}`);
	}

	/**
	 * Build whitelist object from form data
	 */
	private buildWhitelistFromForm(): any {
		const whitelist: any = {};
		this.whitelistItems.forEach((item) => {
			const domain = item.domain?.trim();
			const discount = item.discount?.toString().trim();
			const type = item.type?.trim();

			// Skip empty items
			if (domain && discount && type) {
				// Format: "discount%type" where type is either "%" or "$"
				// The template uses "percentage" or "fixed" but we need "%" or "$"
				const typeSymbol = type === "percentage" ? "%" : type === "fixed" ? "$" : type;
				whitelist[domain] = `${discount}${typeSymbol}`;
			}
		});
		return whitelist;
	}

	/**
	 * Clean up invalid currencies and payment methods from existing license data
	 */
	private cleanupInvalidData(): void {
		// Clean up invalid payment methods (this shouldn't happen with checkboxes, but just in case)
		const paymentMethods = this.getPaymentMethods();
		const validMethods = paymentMethods.filter((method) => ["coinbase", "crypto", "stripe"].includes(method));
		if (validMethods.length !== paymentMethods.length) {
			const removedMethods = paymentMethods.filter((method) => !["coinbase", "crypto", "stripe"].includes(method));
			// Reset payment method checkboxes to only valid ones
			this.accountForm.get("coinbaseEnabled")?.setValue(validMethods.includes("coinbase"));
			this.accountForm.get("cryptoEnabled")?.setValue(validMethods.includes("crypto"));
			this.accountForm.get("stripeEnabled")?.setValue(validMethods.includes("stripe"));
			if (removedMethods.length > 0) {
				this.showError(`Removed invalid payment methods: ${removedMethods.join(", ")}. These are no longer supported.`);
			}
		}
	}

	/**
	 * Validate data before sending to backend
	 */
	private validateDataBeforeSend(): { valid: boolean; errors: string[] } {
		const errors: string[] = [];

		// Validate payment methods
		const paymentMethods = this.getPaymentMethods();
		const invalidMethods = paymentMethods.filter((method) => !["coinbase", "crypto", "stripe"].includes(method));
		if (invalidMethods.length > 0) {
			errors.push(`Invalid payment methods: ${invalidMethods.join(", ")}. Allowed: coinbase, crypto, stripe`);
		}

		return { valid: errors.length === 0, errors };
	}

	/**
	 * Build domain configuration object
	 */
	buildDomainConfig(): DomainConfig {
		const formValue = this.accountForm.value;

		// Validate data before building config
		const validation = this.validateDataBeforeSend();

		if (!validation.valid) {
			this.showError(`Validation failed: ${validation.errors.join(", ")}`);
			throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
		}

		// Build whitelist object
		const whitelist = this.buildWhitelistFromForm();

		return {
			name: formValue.domain,
			// Note: type is excluded as it's only modified during license purchasing process
			holdSuffix: formValue.holdSuffix,
			status: this.accountForm.get("status")?.value || "active", // Get disabled field value
			owner: formValue.owner,
			description: formValue.description,
			// Note: startDate and endDate are excluded as they are system-managed
			// Note: domainType is excluded as it's not sent to backend
			// Note: status is read-only and determined by license purchase
			tags: {
				minLength: formValue.minLength,
				maxLength: formValue.maxLength,
				allowedChars: /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/,
				reserved: this.reservedWords,
				customRules: [],
				payment: {
					methods: this.getPaymentMethods(),
					networks: formValue.networks,
					discounts: {
						yearly: 0.1,
						lifetime: 0.2,
					},
					rewardPrice: 10,
					whitelist: whitelist,
					pricingTable: this.getPricingTableFromRows(),
				},
				storage: {
					// Moved storage inside tags
					keyPrefix: formValue.keyPrefix,
					ipfsEnabled: formValue.ipfsEnabled,
					arweaveEnabled: formValue.arweaveEnabled,
					walrusEnabled: formValue.walrusEnabled,
					// Note: backupEnabled is excluded as it's not allowed by backend
				},
			},
			zelfkeys: {
				plans: this.zelfkeysPlans,
				payment: {
					whitelist: {},
					pricingTable: {},
				},
				storage: {
					// Moved storage inside zelfkeys
					keyPrefix: formValue.zelfkeysKeyPrefix,
					ipfsEnabled: formValue.zelfkeysIpfsEnabled,
					arweaveEnabled: formValue.zelfkeysArweaveEnabled,
					walrusEnabled: formValue.zelfkeysWalrusEnabled,
					// Note: backupEnabled is excluded as it's not allowed by backend
				},
			},
			// Note: stripe object is excluded as it's managed by backend/Stripe webhooks
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
			} catch (error) {
				console.error("Error parsing stored license:", error);
			}
		}
	}

	/**
	 * Fetch license from backend API
	 */
	async fetchLicenseFromBackend(): Promise<void> {
		try {
			this.isLoading = true;

			this._cdr.detectChanges();

			const response = await this._licenseService.getMyLicense(true);

			if (!response || !response.data || !response.data.myLicense) {
				return;
			}

			this.currentLicense = License.fromAPIResponseWithWrapper(response.data.myLicense.domainConfig);

			// Save to localStorage
			localStorage.setItem("license", JSON.stringify(this.currentLicense.toJSON()));
		} catch (error) {
			console.error("Error fetching license from backend:", error);
			this.showAlert = true;
			this.alertMessage = "Failed to fetch license from server";
			this.alertType = "error";
		} finally {
			this.isLoading = false;
			this._cdr.detectChanges();
		}
	}

	/**
	 * Load license from localStorage or fetch from backend if not found
	 */
	async loadLicense(): Promise<void> {
		// First try to load from localStorage
		// this.loadCurrentLicense();

		// If no license in localStorage, fetch from backend
		if (!this.currentLicense?.domain) {
			await this.fetchLicenseFromBackend();
		}
	}

	/**
	 * Populate form from license data
	 */
	populateFormFromLicense(): void {
		const config = this.currentLicense?.domainConfig;

		if (config) {
			this.populateBasicInfo(config);
			this.populateFeatures(config);
			this.populateValidationRules(config);
			this.populateStorageOptions(config);
			this.populatePaymentSettings(config);
			this.populateMetadata(config);
		}

		// Clean up any invalid data from existing license
		this.cleanupInvalidData();

		// Trigger change detection
		this._cdr.detectChanges();
	}

	private populateBasicInfo(config: DomainConfig): void {
		this.accountForm.get("domain")?.setValue(config.name || "");
		this.accountForm.get("status")?.setValue(config.status || "active");
		this.accountForm.get("owner")?.setValue(config.owner || "zelf-team");
		this.accountForm.get("description")?.setValue(config.description || "Official Zelf domain");
		this.accountForm.get("startDate")?.setValue(config.startDate || "");
		this.accountForm.get("endDate")?.setValue(config.endDate || "");
	}

	private populateFeatures(config: DomainConfig): void {
		this.accountForm.get("znsEnabled")?.setValue(true); // Default to true
		this.accountForm.get("zelfkeysEnabled")?.setValue(true); // Default to true
	}

	private populateValidationRules(config: DomainConfig): void {
		this.accountForm.get("minLength")?.setValue(config.tags?.minLength || 3);
		this.accountForm.get("maxLength")?.setValue(config.tags?.maxLength || 50);
		this.accountForm.get("holdSuffix")?.setValue(config.holdSuffix || ".hold");

		if (config.tags?.reserved) {
			this.reservedWords = [...config.tags.reserved];
		}
	}

	private populateStorageOptions(config: DomainConfig): void {
		// ZNS Storage Options
		this.accountForm.get("ipfsEnabled")?.setValue(config.tags?.storage?.ipfsEnabled ?? true);
		this.accountForm.get("arweaveEnabled")?.setValue(config.tags?.storage?.arweaveEnabled ?? true);
		this.accountForm.get("walrusEnabled")?.setValue(config.tags?.storage?.walrusEnabled ?? true);
		this.accountForm.get("keyPrefix")?.setValue(config.tags?.storage?.keyPrefix || "tagName");

		// ZelfKeys Storage Options
		this.accountForm.get("zelfkeysIpfsEnabled")?.setValue(config.zelfkeys?.storage?.ipfsEnabled ?? true);
		this.accountForm.get("zelfkeysArweaveEnabled")?.setValue(config.zelfkeys?.storage?.arweaveEnabled ?? true);
		this.accountForm.get("zelfkeysWalrusEnabled")?.setValue(config.zelfkeys?.storage?.walrusEnabled ?? true);
		this.accountForm.get("zelfkeysKeyPrefix")?.setValue(config.zelfkeys?.storage?.keyPrefix || "tagName");
	}

	private populatePaymentSettings(config: DomainConfig): void {
		this.accountForm.get("coinbaseEnabled")?.setValue(config.tags?.payment?.methods?.includes("coinbase") ?? true);
		this.accountForm.get("cryptoEnabled")?.setValue(config.tags?.payment?.methods?.includes("crypto") ?? true);
		this.accountForm.get("stripeEnabled")?.setValue(config.tags?.payment?.methods?.includes("stripe") ?? true);

		// Populate networks
		if (this.currentLicense) {
			const networks = this.currentLicense.getNetworks();
			this.accountForm.setControl("networks", this.createNetworksFormGroup(networks));
		}

		if (config.tags?.payment?.pricingTable) {
			this.loadPricingTableFromConfig(config.tags.payment.pricingTable);
		}

		this.populateWhitelist(config);

		if (config.zelfkeys?.plans) {
			this.zelfkeysPlans = [...config.zelfkeys.plans];
		}
	}

	private populateWhitelist(config: DomainConfig): void {
		if (config.tags?.payment?.whitelist) {
			this.whitelistItems = Object.entries(config.tags.payment.whitelist).map(([domain, price]) => {
				const priceStr = price as string;
				const match = priceStr.match(/^(\d+(?:\.\d+)?)([%$])$/);
				if (match) {
					const typeSymbol = match[2];
					const typeValue = typeSymbol === "%" ? "percentage" : typeSymbol === "$" ? "fixed" : typeSymbol;
					return {
						domain,
						discount: match[1],
						type: typeValue,
					};
				}
				return {
					domain,
					discount: priceStr,
					type: "percentage",
				};
			});
		}

		// Populate whitelist form controls
		this.whitelistItems.forEach((item, index) => {
			this.accountForm.get(`whitelistDomain_${index}`)?.setValue(item.domain);
			this.accountForm.get(`whitelistDiscount_${index}`)?.setValue(item.discount);
			this.accountForm.get(`whitelistType_${index}`)?.setValue(item.type);
		});
	}

	private populateMetadata(config: DomainConfig): void {
		this.accountForm.get("launchDate")?.setValue(config.metadata?.launchDate || "2023-01-01");
		this.accountForm.get("version")?.setValue(config.metadata?.version || "1.0.0");
		this.accountForm.get("documentation")?.setValue(config.metadata?.documentation || "https://docs.zelf.world");
		this.accountForm.get("community")?.setValue(config.metadata?.community || "");
		this.accountForm.get("enterprise")?.setValue(config.metadata?.enterprise || "");
		this.accountForm.get("support")?.setValue(config.metadata?.support || "standard");
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

		// Check if there are any actual changes
		if (this.currentLicense && !this.hasLicenseChanges(domain)) {
			this.showError("No changes detected. Please modify at least one field before saving.");
			return;
		}

		// Build domain configuration
		const domainConfig = this.buildDomainConfig();

		// Set save data in service - pass domain and domainConfig
		this._saveConfirmationService.setSaveData({
			domain: domainConfig.name,
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
			const prices = defaultPricing[i] || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, lifetime: 0 };
			this.pricingTableRows.push({
				length: i.toString(),
				oneYear: prices[1] || 0,
				twoYears: prices[2] || 0,
				threeYears: prices[3] || 0,
				fourYears: prices[4] || 0,
				fiveYears: prices[5] || 0,
				lifetime: prices.lifetime || 0,
			});
		}

		// Add range row (6-15)
		const rangePrices = defaultPricing["6-15"] || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, lifetime: 0 };
		this.pricingTableRows.push({
			length: "6-15",
			oneYear: rangePrices[1] || 0,
			twoYears: rangePrices[2] || 0,
			threeYears: rangePrices[3] || 0,
			fourYears: rangePrices[4] || 0,
			fiveYears: rangePrices[5] || 0,
			lifetime: rangePrices.lifetime || 0,
		});

		// Add individual length rows (16-27)
		for (let i = 16; i <= 27; i++) {
			const prices = defaultPricing[i] || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, lifetime: 0 };
			this.pricingTableRows.push({
				length: i.toString(),
				oneYear: prices[1] || 0,
				twoYears: prices[2] || 0,
				threeYears: prices[3] || 0,
				fourYears: prices[4] || 0,
				fiveYears: prices[5] || 0,
				lifetime: prices.lifetime || 0,
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
			pricingTable[row.length] = {
				1: row.oneYear || 0,
				2: row.twoYears || 0,
				3: row.threeYears || 0,
				4: row.fourYears || 0,
				5: row.fiveYears || 0,
				lifetime: row.lifetime || 0,
			};
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
			const prices = pricingTable[i] || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, lifetime: 0 };
			this.pricingTableRows.push({
				length: i.toString(),
				oneYear: prices[1] || 0,
				twoYears: prices[2] || 0,
				threeYears: prices[3] || 0,
				fourYears: prices[4] || 0,
				fiveYears: prices[5] || 0,
				lifetime: prices.lifetime || 0,
			});
		}

		// Add range row (6-15)
		const rangePrices = pricingTable["6-15"] || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, lifetime: 0 };
		this.pricingTableRows.push({
			length: "6-15",
			oneYear: rangePrices[1] || 0,
			twoYears: rangePrices[2] || 0,
			threeYears: rangePrices[3] || 0,
			fourYears: rangePrices[4] || 0,
			fiveYears: rangePrices[5] || 0,
			lifetime: rangePrices.lifetime || 0,
		});

		// Add individual length rows (16-27)
		for (let i = 16; i <= 27; i++) {
			const prices = pricingTable[i] || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, lifetime: 0 };
			this.pricingTableRows.push({
				length: i.toString(),
				oneYear: prices[1] || 0,
				twoYears: prices[2] || 0,
				threeYears: prices[3] || 0,
				fourYears: prices[4] || 0,
				fiveYears: prices[5] || 0,
				lifetime: prices.lifetime || 0,
			});
		}
	}
}
