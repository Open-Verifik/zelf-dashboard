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
	type?: "official" | "custom" | "zelfBasic" | "zelfStartUp" | "zelfGold" | "zelfBusiness" | "zelfEnterprise";
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
	type?: "official" | "custom" | "zelfBasic" | "zelfStartUp" | "zelfGold" | "zelfBusiness" | "zelfEnterprise"; // Optional - only set during license purchasing
	holdSuffix: string;
	status: "active" | "inactive" | "maintenance" | "beta";
	owner: string;
	description: string;
	startDate?: string;
	endDate?: string;
	tags: {
		minLength: number;
		maxLength: number;
		allowedChars: RegExp;
		reserved: string[];
		customRules: any[];
		payment: {
			methods: string[];
			currencies: string[];
			discounts: {
				yearly: number;
				lifetime: number;
			};
			rewardPrice: number;
			whitelist: { [key: string]: string };
			pricingTable: { [key: string]: { [key: string]: number } };
		};
		storage: {
			// Moved storage inside tags
			keyPrefix: string;
			ipfsEnabled: boolean;
			arweaveEnabled: boolean;
			walrusEnabled: boolean;
			backupEnabled?: boolean;
		};
	};
	zelfkeys: {
		plans: any[];
		payment: {
			whitelist: { [key: string]: string };
			pricingTable: { [key: string]: { [key: string]: number } };
		};
		storage: {
			// Moved storage inside zelfkeys
			keyPrefix: string;
			ipfsEnabled: boolean;
			arweaveEnabled: boolean;
			walrusEnabled: boolean;
			backupEnabled?: boolean;
		};
	};
	stripe?: {
		productId: string;
		priceId: string;
		latestInvoiceId: string;
		amountPaid: number;
		paidAt: string;
	};
	limits?: {
		tags: number;
		zelfkeys: number;
		zelfProofs?: number;
	};
	metadata: {
		launchDate: string;
		version: string;
		documentation: string;
		community?: string;
		enterprise?: string;
		support: string;
	};
	themeSettings?: ThemeSettings;
}

export interface ThemeSettings {
	zns: {
		enabled: boolean;
		currentMode: "light" | "dark";
		lightMode: {
			colors: {
				primary: string;
				secondary: string;
				background: string;
				backgroundSecondary: string;
				text: string;
				textSecondary: string;
				textMuted: string;
				header: string;
				headerText: string;
				button: string;
				buttonText: string;
				buttonHover: string;
				buttonSecondary: string;
				buttonSecondaryText: string;
				border: string;
				borderHover: string;
				success: string;
				successText: string;
				warning: string;
				warningText: string;
				error: string;
				errorText: string;
				card: string;
				cardBorder: string;
				shadow: string;
			};
		};
		darkMode: {
			colors: {
				primary: string;
				secondary: string;
				background: string;
				backgroundSecondary: string;
				text: string;
				textSecondary: string;
				textMuted: string;
				header: string;
				headerText: string;
				button: string;
				buttonText: string;
				buttonHover: string;
				buttonSecondary: string;
				buttonSecondaryText: string;
				border: string;
				borderHover: string;
				success: string;
				successText: string;
				warning: string;
				warningText: string;
				error: string;
				errorText: string;
				card: string;
				cardBorder: string;
				shadow: string;
			};
		};
	};
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
	public type?: "official" | "custom" | "zelfBasic" | "zelfStartUp" | "zelfGold" | "zelfBusiness" | "zelfEnterprise";

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
			startDate: configData?.startDate || "",
			endDate: configData?.endDate || "",
			tags: {
				minLength: configData?.tags?.minLength || 3,
				maxLength: configData?.tags?.maxLength || 50,
				allowedChars: configData?.tags?.allowedChars || /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/,
				reserved: configData?.tags?.reserved || ["www", "api", "admin", "support", "help"],
				customRules: configData?.tags?.customRules || [],
				payment: {
					methods: configData?.tags?.payment?.methods || ["coinbase", "crypto", "stripe"],
					currencies: configData?.tags?.payment?.currencies || ["USD", "BTC", "ETH", "SOL"],
					discounts: configData?.tags?.payment?.discounts || {
						yearly: 0.1,
						lifetime: 0.2,
					},
					rewardPrice: configData?.tags?.payment?.rewardPrice || 10,
					whitelist: configData?.tags?.payment?.whitelist || {},
					pricingTable: configData?.tags?.payment?.pricingTable || this.getDefaultPricingTable(),
				},
				storage: {
					// Moved storage inside tags
					keyPrefix: configData?.tags?.storage?.keyPrefix || "tagName",
					ipfsEnabled: configData?.tags?.storage?.ipfsEnabled || true,
					arweaveEnabled: configData?.tags?.storage?.arweaveEnabled || true,
					walrusEnabled: configData?.tags?.storage?.walrusEnabled || true,
					backupEnabled: configData?.tags?.storage?.backupEnabled || false,
				},
			},
			zelfkeys: {
				plans: configData?.zelfkeys?.plans || [],
				payment: {
					whitelist: configData?.zelfkeys?.payment?.whitelist || {},
					pricingTable: configData?.zelfkeys?.payment?.pricingTable || {},
				},
				storage: {
					// Moved storage inside zelfkeys
					keyPrefix: configData?.zelfkeys?.storage?.keyPrefix || "tagName",
					ipfsEnabled: configData?.zelfkeys?.storage?.ipfsEnabled || true,
					arweaveEnabled: configData?.zelfkeys?.storage?.arweaveEnabled || true,
					walrusEnabled: configData?.zelfkeys?.storage?.walrusEnabled || true,
					backupEnabled: configData?.zelfkeys?.storage?.backupEnabled || false,
				},
			},
			stripe: {
				productId: configData?.stripe?.productId || "",
				priceId: configData?.stripe?.priceId || "",
				latestInvoiceId: configData?.stripe?.latestInvoiceId || "",
				amountPaid: configData?.stripe?.amountPaid || 0,
				paidAt: configData?.stripe?.paidAt || "",
			},
			limits: {
				tags: configData?.limits?.tags || 100,
				zelfkeys: configData?.limits?.zelfkeys || 100,
				zelfProofs: configData?.limits?.zelfProofs || 100,
			},
			metadata: {
				launchDate: configData?.metadata?.launchDate || new Date().toISOString().split("T")[0],
				version: configData?.metadata?.version || "1.0.0",
				documentation: configData?.metadata?.documentation || "",
				community: configData?.metadata?.community,
				enterprise: configData?.metadata?.enterprise,
				support: configData?.metadata?.support || "standard",
			},
			themeSettings: configData?.themeSettings || License.getDefaultThemeSettings(),
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
	getLicenseType(): "official" | "custom" | "zelfBasic" | "zelfStartUp" | "zelfGold" | "zelfBusiness" | "zelfEnterprise" | undefined {
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
		// For now, we'll assume all features are enabled by default
		// This can be extended later if we add feature management
		return true;
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

		if (!this.domainConfig.tags.payment.pricingTable) {
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
			price = this.domainConfig.tags.payment.pricingTable["6-15"][duration];
		} else if (this.domainConfig.tags.payment.pricingTable[length]) {
			price = this.domainConfig.tags.payment.pricingTable[length][duration];
		} else {
			throw new Error("Invalid name length. Length must be between 1 and 27.");
		}

		const priceWithoutDiscount = Number(price);
		let discount = 0;
		let discountType = "percentage";

		const whitelist = this.domainConfig.tags.payment.whitelist || {};

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
			reward: Math.max(Math.ceil((price / this.domainConfig.tags.payment.rewardPrice) * 100) / 100, 0),
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
		if (tagName.length < this.domainConfig.tags.minLength) {
			return {
				valid: false,
				error: `Tag name must be at least ${this.domainConfig.tags.minLength} characters long`,
			};
		}

		// Check maximum length
		if (tagName.length > this.domainConfig.tags.maxLength) {
			return {
				valid: false,
				error: `Tag name must be no more than ${this.domainConfig.tags.maxLength} characters long`,
			};
		}

		// Check allowed characters
		if (!this.domainConfig.tags.allowedChars.test(tagName)) {
			return {
				valid: false,
				error: `Tag name contains invalid characters. Allowed pattern: ${this.domainConfig.tags.allowedChars}`,
			};
		}

		// Check reserved names
		if (this.domainConfig.tags.reserved.includes(tagName.toLowerCase())) {
			return {
				valid: false,
				error: `Tag name '${tagName}' is reserved`,
			};
		}

		// Check custom rules
		for (const rule of this.domainConfig.tags.customRules) {
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
	 * Get storage configuration for tags
	 */
	getStorageConfig(): StorageConfig {
		return this.domainConfig.tags.storage;
	}

	/**
	 * Get storage configuration for zelfkeys
	 */
	getZelfkeysStorageConfig(): StorageConfig {
		return this.domainConfig.zelfkeys.storage;
	}

	/**
	 * Get payment methods
	 */
	getPaymentMethods(): string[] {
		return this.domainConfig.tags.payment.methods;
	}

	/**
	 * Get supported currencies
	 */
	getSupportedCurrencies(): string[] {
		return this.domainConfig.tags.payment.currencies;
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
				// Note: type is excluded as it's only set during license purchasing
				holdSuffix: data.holdSuffix,
				status: data.status,
				owner: data.owner,
				description: data.description,
				startDate: data.startDate,
				endDate: data.endDate,
				tags: data.tags,
				zelfkeys: data.zelfkeys,
				stripe: data.stripe,
				limits: data.limits,
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
				// Note: type is excluded as it's only set during license purchasing
				holdSuffix: ".hold",
				status: "inactive",
				owner: "zelf-team",
				description: `Custom domain: ${domain}`,
				startDate: "",
				endDate: "",
				tags: {
					minLength: 3,
					maxLength: 50,
					allowedChars: /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/,
					reserved: ["www", "api", "admin", "support", "help"],
					customRules: [],
					payment: {
						methods: ["coinbase", "crypto", "stripe"],
						currencies: ["USD", "BTC", "ETH", "SOL"],
						discounts: {
							yearly: 0.1,
							lifetime: 0.2,
						},
						rewardPrice: 10,
						whitelist: {},
						pricingTable: {},
					},
					storage: {
						// Moved storage inside tags
						keyPrefix: "tagName",
						ipfsEnabled: true,
						arweaveEnabled: true,
						walrusEnabled: true,
						backupEnabled: false,
					},
				},
				zelfkeys: {
					plans: [],
					payment: {
						whitelist: {},
						pricingTable: {},
					},
					storage: {
						// Moved storage inside zelfkeys
						keyPrefix: "tagName",
						ipfsEnabled: true,
						arweaveEnabled: true,
						walrusEnabled: true,
						backupEnabled: false,
					},
				},
				stripe: {
					productId: "",
					priceId: "",
					latestInvoiceId: "",
					amountPaid: 0,
					paidAt: "",
				},
				limits: { tags: 100, zelfkeys: 100, zelfProofs: 100 },
				metadata: {
					launchDate: new Date().toISOString().split("T")[0],
					version: "1.0.0",
					documentation: "",
					support: "standard",
				},
				themeSettings: License.getDefaultThemeSettings(),
			},
		});
	}

	/**
	 * Get default theme settings
	 */
	private static getDefaultThemeSettings(): ThemeSettings {
		return {
			zns: {
				enabled: true,
				currentMode: "light",
				lightMode: {
					colors: {
						primary: "#3B82F6",
						secondary: "#64748B",
						background: "#FFFFFF",
						backgroundSecondary: "#F8FAFC",
						text: "#1E293B",
						textSecondary: "#64748B",
						textMuted: "#94A3B8",
						header: "#1E293B",
						headerText: "#FFFFFF",
						button: "#3B82F6",
						buttonText: "#FFFFFF",
						buttonHover: "#2563EB",
						buttonSecondary: "#E2E8F0",
						buttonSecondaryText: "#475569",
						border: "#E2E8F0",
						borderHover: "#CBD5E1",
						success: "#10B981",
						successText: "#FFFFFF",
						warning: "#F59E0B",
						warningText: "#FFFFFF",
						error: "#EF4444",
						errorText: "#FFFFFF",
						card: "#FFFFFF",
						cardBorder: "#E2E8F0",
						shadow: "rgba(0, 0, 0, 0.1)",
					},
				},
				darkMode: {
					colors: {
						primary: "#60A5FA",
						secondary: "#94A3B8",
						background: "#0F172A",
						backgroundSecondary: "#1E293B",
						text: "#F1F5F9",
						textSecondary: "#94A3B8",
						textMuted: "#64748B",
						header: "#1E293B",
						headerText: "#F1F5F9",
						button: "#60A5FA",
						buttonText: "#0F172A",
						buttonHover: "#3B82F6",
						buttonSecondary: "#334155",
						buttonSecondaryText: "#F1F5F9",
						border: "#334155",
						borderHover: "#475569",
						success: "#34D399",
						successText: "#0F172A",
						warning: "#FBBF24",
						warningText: "#0F172A",
						error: "#F87171",
						errorText: "#0F172A",
						card: "#1E293B",
						cardBorder: "#334155",
						shadow: "rgba(0, 0, 0, 0.3)",
					},
				},
			},
		};
	}
}
