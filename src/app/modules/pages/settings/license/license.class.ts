/**
 * License Class
 *
 * This class represents a license configuration for a domain with all its properties
 * and methods. It's designed to work with the frontend license management system
 * and matches the structure used in the backend Domain class.
 */

export interface LicenseData {
	domain: string;
	domainConfig: DomainConfig;
	faceBase64?: string;
	masterPassword?: string;
	ipfsHash?: string;
	createdAt?: string;
	updatedAt?: string;
	// New fields from API response
	ipfs?: IPFSData;
	zelfProof?: string;
	expiresAt?: string;
	subscriptionId?: string;
	previousDomain?: string;
	type?: "official" | "custom" | "community" | "enterprise";
}

export interface IPFSData {
	url: string;
	IpfsHash: string;
	PinSize: number;
	Timestamp: string;
	ID: string;
	Name: string;
	NumberOfFiles: number;
	MimeType: boolean | string;
	GroupId: string | null;
	pinned: boolean;
	web3: boolean;
	name: string;
	metadata: {
		type: string;
		owner: string;
		domain: string;
		zelfProof: string;
		subscriptionId: string;
	};
}

export interface DomainConfig {
	name: string;
	type: "official" | "custom" | "community" | "enterprise";
	holdSuffix: string;
	status: "active" | "inactive" | "maintenance" | "beta";
	owner: string;
	description: string;
	limits: {
		tags: number;
		zelfkeys: number;
	};
	features: Feature[];
	validation: ValidationRules;
	storage: StorageConfig;
	tagPaymentSettings: PaymentSettings;
	metadata: Metadata;
}

export interface Feature {
	name: string;
	code: string;
	description: string;
	enabled: boolean;
}

export interface ValidationRules {
	minLength: number;
	maxLength: number;
	allowedChars: RegExp;
	reserved: string[];
	customRules: any[];
}

export interface StorageConfig {
	keyPrefix: string;
	ipfsEnabled: boolean;
	arweaveEnabled: boolean;
	walrusEnabled: boolean;
}

export interface PaymentSettings {
	methods: string[];
	currencies: string[];
	whitelist: { [key: string]: string };
	pricingTable: { [key: string]: { [key: string]: number } };
}

export interface Metadata {
	launchDate: string;
	version: string;
	documentation: string;
	community?: string;
	enterprise?: string;
	support: string;
}

export class License {
	public domain: string;
	public domainConfig: DomainConfig;
	public faceBase64?: string;
	public masterPassword?: string;
	public ipfsHash?: string;
	public createdAt?: string;
	public updatedAt?: string;
	// New fields from API response
	public ipfs?: IPFSData;
	public zelfProof?: string;
	public expiresAt?: string;
	public subscriptionId?: string;
	public previousDomain?: string;
	public type?: "official" | "custom" | "community" | "enterprise";

	constructor(licenseData: LicenseData) {
		this.domain = licenseData.domain || "";
		this.domainConfig = this.buildDomainConfig(licenseData.domainConfig);
		this.faceBase64 = licenseData.faceBase64;
		this.masterPassword = licenseData.masterPassword;
		this.ipfsHash = licenseData.ipfsHash;
		this.createdAt = licenseData.createdAt;
		this.updatedAt = licenseData.updatedAt;
		// New fields
		this.ipfs = licenseData.ipfs;
		this.zelfProof = licenseData.zelfProof;
		this.expiresAt = licenseData.expiresAt;
		this.subscriptionId = licenseData.subscriptionId;
		this.previousDomain = licenseData.previousDomain;
		this.type = licenseData.type;
	}

	/**
	 * Build domain configuration with defaults
	 * Handles both nested domainConfig structure and flat API response structure
	 */
	private buildDomainConfig(config: any): DomainConfig {
		// Handle both nested domainConfig and flat structure from API response
		const configData = config?.domainConfig || config;

		return {
			name: configData?.name || "",
			type: configData?.type || "custom",
			holdSuffix: configData?.holdSuffix || ".hold",
			status: configData?.status || "inactive",
			owner: configData?.owner || "",
			description: configData?.description || "",
			limits: {
				tags: configData?.limits?.tags || 10000,
				zelfkeys: configData?.limits?.zelfkeys || 10000,
			},
			features: configData?.features || [
				{
					name: "Zelf Name System",
					code: "zns",
					description: "Encryptions, Decryptions, previews of ZelfProofs",
					enabled: true,
				},
				{
					name: "Zelf Keys",
					code: "zelfkeys",
					description: "Zelf Keys: Passwords, Notes, Credit Cards, etc.",
					enabled: true,
				},
			],
			validation: {
				minLength: configData?.validation?.minLength || 3,
				maxLength: configData?.validation?.maxLength || 50,
				allowedChars: configData?.validation?.allowedChars || /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/,
				reserved: configData?.validation?.reserved || ["www", "api", "admin", "support", "help"],
				customRules: configData?.validation?.customRules || [],
			},
			storage: {
				keyPrefix: configData?.storage?.keyPrefix || "tagName",
				ipfsEnabled: configData?.storage?.ipfsEnabled || true,
				arweaveEnabled: configData?.storage?.arweaveEnabled || true,
				walrusEnabled: configData?.storage?.walrusEnabled || true,
			},
			tagPaymentSettings: {
				methods: configData?.tagPaymentSettings?.methods || ["coinbase", "crypto", "stripe"],
				currencies: configData?.tagPaymentSettings?.currencies || ["USD", "BTC", "ETH", "SOL"],
				whitelist: configData?.tagPaymentSettings?.whitelist || {},
				pricingTable: configData?.tagPaymentSettings?.pricingTable || this.getDefaultPricingTable(),
			},
			metadata: {
				launchDate: configData?.metadata?.launchDate || new Date().toISOString().split("T")[0],
				version: configData?.metadata?.version || "1.0.0",
				documentation: configData?.metadata?.documentation || "",
				community: configData?.metadata?.community,
				enterprise: configData?.metadata?.enterprise,
				support: configData?.metadata?.support || "standard",
			},
		};
	}

	/**
	 * Get default pricing table
	 */
	private getDefaultPricingTable(): { [key: string]: { [key: string]: number } } {
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
	 * Get IPFS data
	 */
	getIPFSData(): IPFSData | undefined {
		return this.ipfs;
	}

	/**
	 * Get IPFS hash
	 */
	getIPFSHash(): string | undefined {
		return this.ipfs?.IpfsHash || this.ipfsHash;
	}

	/**
	 * Get IPFS URL
	 */
	getIPFSUrl(): string | undefined {
		return this.ipfs?.url;
	}

	/**
	 * Get IPFS metadata
	 */
	getIPFSMetadata(): { type: string; owner: string; domain: string; zelfProof: string; subscriptionId: string } | undefined {
		return this.ipfs?.metadata;
	}

	/**
	 * Get zelfProof
	 */
	getZelfProof(): string | undefined {
		return this.zelfProof;
	}

	/**
	 * Get expiration date
	 */
	getExpirationDate(): Date | undefined {
		return this.expiresAt ? new Date(this.expiresAt) : undefined;
	}

	/**
	 * Check if license is expired
	 */
	isExpired(): boolean {
		if (!this.expiresAt) return false;
		return new Date(this.expiresAt) < new Date();
	}

	/**
	 * Get subscription ID
	 */
	getSubscriptionId(): string | undefined {
		return this.subscriptionId;
	}

	/**
	 * Get previous domain (for domain changes)
	 */
	getPreviousDomain(): string | undefined {
		return this.previousDomain;
	}

	/**
	 * Get license type
	 */
	getLicenseType(): "official" | "custom" | "community" | "enterprise" | undefined {
		return this.type || this.domainConfig.type;
	}

	/**
	 * Check if license is active
	 */
	isActive(): boolean {
		return this.domainConfig.status === "active";
	}

	/**
	 * Check if domain supports a feature
	 */
	supportsFeature(featureCode: string): boolean {
		return this.domainConfig.features.some((feature) => feature.code === featureCode && feature.enabled);
	}

	/**
	 * Get domain price for specific tag length and duration
	 */
	getPrice(
		tagName: string,
		duration: string = "1",
		referralTagName: string = ""
	): {
		price: number;
		currency: string;
		reward: number;
		discount: number;
		priceWithoutDiscount: number;
		discountType: string;
	} {
		if (!tagName) {
			return {
				price: 0,
				currency: "USD",
				reward: 0,
				discount: 0,
				priceWithoutDiscount: 0,
				discountType: "percentage",
			};
		}

		const splitTagName = tagName.split(".");
		const cleanReferralTagName = referralTagName.replace(".hold", "");
		const length = splitTagName[0].length;

		if (!this.domainConfig.tagPaymentSettings.pricingTable) {
			return {
				price: 0,
				currency: "USD",
				reward: 0,
				discount: 0,
				priceWithoutDiscount: 0,
				discountType: "percentage",
			};
		}

		if (!["1", "2", "3", "4", "5", "lifetime"].includes(duration)) {
			throw new Error("Invalid duration. Use '1', '2', '3', '4', '5' or 'lifetime'.");
		}

		let price = 24;

		if (length >= 6 && length <= 15) {
			price = this.domainConfig.tagPaymentSettings.pricingTable["6-15"][duration];
		} else if (this.domainConfig.tagPaymentSettings.pricingTable[length]) {
			price = this.domainConfig.tagPaymentSettings.pricingTable[length][duration];
		} else {
			throw new Error("Invalid name length. Length must be between 1 and 27.");
		}

		const priceWithoutDiscount = Number(price);
		let discount = 0;
		let discountType = "percentage";

		const whitelist = this.domainConfig.tagPaymentSettings.whitelist || {};

		if (Object.keys(whitelist).length && cleanReferralTagName && whitelist[cleanReferralTagName]) {
			const amount = whitelist[cleanReferralTagName];

			if (amount.includes("%")) {
				discountType = "percentage";
				discount = parseInt(amount);
				price = price - price * (discount / 100);
			} else {
				discount = parseInt(amount);
				discountType = "amount";
				price = price - discount;
			}
		} else if (cleanReferralTagName) {
			// Default discount 10%
			price = price - price * 0.1;
		}

		return {
			price: Math.max(Math.ceil(price * 100) / 100, 0),
			currency: "USD",
			reward: Math.max(Math.ceil((price / 10) * 100) / 100, 0), // Assuming reward price of 10
			discount,
			priceWithoutDiscount,
			discountType,
		};
	}

	/**
	 * Validate tag name against domain rules
	 */
	validateTagName(tagName: string): { valid: boolean; error?: string } {
		// Check minimum length
		if (tagName.length < this.domainConfig.validation.minLength) {
			return {
				valid: false,
				error: `Tag name must be at least ${this.domainConfig.validation.minLength} characters long`,
			};
		}

		// Check maximum length
		if (tagName.length > this.domainConfig.validation.maxLength) {
			return {
				valid: false,
				error: `Tag name must be no more than ${this.domainConfig.validation.maxLength} characters long`,
			};
		}

		// Check allowed characters
		if (!this.domainConfig.validation.allowedChars.test(tagName)) {
			return {
				valid: false,
				error: `Tag name contains invalid characters. Allowed pattern: ${this.domainConfig.validation.allowedChars}`,
			};
		}

		// Check reserved names
		if (this.domainConfig.validation.reserved.includes(tagName.toLowerCase())) {
			return {
				valid: false,
				error: `Tag name '${tagName}' is reserved`,
			};
		}

		// Check custom rules
		for (const rule of this.domainConfig.validation.customRules) {
			if (typeof rule === "function") {
				const result = rule(tagName);
				if (!result.valid) {
					return result;
				}
			}
		}

		return { valid: true };
	}

	/**
	 * Get storage configuration
	 */
	getStorageConfig(): StorageConfig {
		return this.domainConfig.storage;
	}

	/**
	 * Get payment methods
	 */
	getPaymentMethods(): string[] {
		return this.domainConfig.tagPaymentSettings.methods;
	}

	/**
	 * Get supported currencies
	 */
	getSupportedCurrencies(): string[] {
		return this.domainConfig.tagPaymentSettings.currencies;
	}

	/**
	 * Get domain limits
	 */
	getLimits(): { tags: number; zelfkeys: number } {
		return this.domainConfig.limits;
	}

	/**
	 * Generate hold domain name
	 */
	generateHoldDomain(tagName: string): string {
		return `${tagName}${this.domainConfig.holdSuffix}.${this.domain}`;
	}

	/**
	 * Convert to JSON for API calls
	 */
	toJSON(): LicenseData {
		return {
			domain: this.domain,
			domainConfig: this.domainConfig,
			faceBase64: this.faceBase64,
			masterPassword: this.masterPassword,
			ipfsHash: this.ipfsHash,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
			// New fields
			ipfs: this.ipfs,
			zelfProof: this.zelfProof,
			expiresAt: this.expiresAt,
			subscriptionId: this.subscriptionId,
			previousDomain: this.previousDomain,
			type: this.type,
		};
	}

	/**
	 * Create from JSON data
	 */
	static fromJSON(data: any): License {
		return new License(data);
	}

	/**
	 * Create from API response data
	 * Handles the flat structure returned by the API
	 */
	static fromAPIResponse(data: any): License {
		// Transform API response to LicenseData format
		const licenseData: LicenseData = {
			domain: data.domain,
			domainConfig: {
				name: data.name,
				type: data.type,
				holdSuffix: data.holdSuffix,
				status: data.status,
				owner: data.owner,
				description: data.description,
				limits: data.limits,
				features: data.features,
				validation: data.validation,
				storage: data.storage,
				tagPaymentSettings: data.tagPaymentSettings,
				metadata: data.metadata,
			},
			ipfs: data.ipfs,
			zelfProof: data.zelfProof,
			expiresAt: data.expiresAt,
			subscriptionId: data.subscriptionId,
			previousDomain: data.previousDomain,
			type: data.type,
		};

		return new License(licenseData);
	}

	/**
	 * Create from API response with data wrapper
	 * Handles responses like { data: { ... } }
	 */
	static fromAPIResponseWithWrapper(response: any): License {
		// Extract data from wrapper if it exists
		const data = response.data || response;
		return License.fromAPIResponse(data);
	}

	/**
	 * Create empty license with defaults
	 */
	static createEmpty(domain: string): License {
		return new License({
			domain,
			domainConfig: {
				name: domain,
				type: "custom",
				holdSuffix: ".hold",
				status: "inactive",
				owner: "zelf-team",
				description: `Custom domain: ${domain}`,
				limits: { tags: 10000, zelfkeys: 10000 },
				features: [
					{
						name: "Zelf Name System",
						code: "zns",
						description: "Encryptions, Decryptions, previews of ZelfProofs",
						enabled: true,
					},
					{
						name: "Zelf Keys",
						code: "zelfkeys",
						description: "Zelf Keys: Passwords, Notes, Credit Cards, etc.",
						enabled: true,
					},
				],
				validation: {
					minLength: 3,
					maxLength: 50,
					allowedChars: /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/,
					reserved: ["www", "api", "admin", "support", "help"],
					customRules: [],
				},
				storage: {
					keyPrefix: "tagName",
					ipfsEnabled: true,
					arweaveEnabled: true,
					walrusEnabled: true,
				},
				tagPaymentSettings: {
					methods: ["coinbase", "crypto", "stripe"],
					currencies: ["USD", "BTC", "ETH", "SOL"],
					whitelist: {},
					pricingTable: {},
				},
				metadata: {
					launchDate: new Date().toISOString().split("T")[0],
					version: "1.0.0",
					documentation: "",
					support: "standard",
				},
			},
		});
	}
}
