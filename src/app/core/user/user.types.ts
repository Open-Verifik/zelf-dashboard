import { DateTime } from "luxon";

export interface User {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	status?: string;
}

export interface ZelfAccountMetadata {
	name: string;
	accountType: string;
	accountEmail: string;
	accountPhone: string;
	accountCompany: string;
	accountZelfProof: string;
	accountCountryCode: string;
	accountSubscriptionId: string;
}

export interface ZelfAccount {
	id: string;
	ipfs_pin_hash: string;
	size: number;
	user_id: string;
	date_pinned: string;
	date_unpinned: string | null;
	publicData: ZelfAccountMetadata;
	regions: Array<{
		regionId: string;
		currentReplicationCount: number;
		desiredReplicationCount: number;
	}>;
	mime_type: string;
	number_of_files: number;
	url: string;
}

export class ZelfUser {
	public readonly id: string;
	public readonly email: string;
	public readonly phone: string;
	public readonly company: string;
	public readonly countryCode: string;
	public readonly subscriptionId: string;
	public readonly zelfProof: string;
	public readonly type: string;
	public readonly name: string;
	public readonly createdAt: string;
	public readonly ipfsHash: string;
	public readonly userId: string;

	constructor(zelfAccount: ZelfAccount) {
		const metadata = zelfAccount.publicData;

		this.id = zelfAccount.id;
		this.email = metadata.accountEmail || "";
		this.phone = metadata.accountPhone || "";
		this.company = metadata.accountCompany || "";
		this.countryCode = metadata.accountCountryCode || "";
		this.subscriptionId = metadata.accountSubscriptionId || "free";
		this.zelfProof = metadata.accountZelfProof || "";
		this.type = metadata.accountType || "client_account";
		this.name = metadata.name || this.extractNameFromEmail(this.email);
		this.createdAt = zelfAccount.date_pinned;
		this.ipfsHash = zelfAccount.ipfs_pin_hash;
		this.userId = zelfAccount.user_id;
	}

	/**
	 * Extract name from email (e.g., "miguel.smith@example.com" -> "Miguel Smith")
	 */
	private extractNameFromEmail(email: string): string {
		if (!email) return "User";

		const localPart = email.split("@")[0];
		const nameParts = localPart.split(".");
		return nameParts.map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(" ");
	}

	/**
	 * Get display name (name or extracted from email)
	 */
	get displayName(): string {
		return this.name || this.extractNameFromEmail(this.email);
	}

	/**
	 * Get formatted phone number with country code
	 */
	get formattedPhone(): string {
		if (!this.phone) return "";
		// The country code already includes the flag emoji and format, so just combine them
		return `${this.countryCode} ${this.phone}`;
	}

	/**
	 * Get subscription type display name
	 */
	get subscriptionDisplayName(): string {
		switch (this.subscriptionId.toLowerCase()) {
			case "free":
				return "Free";
			case "premium":
				return "Premium";
			case "enterprise":
				return "Enterprise";
			default:
				return "Unknown";
		}
	}

	/**
	 * Check if user has premium subscription
	 */
	get isPremium(): boolean {
		return this.subscriptionId.toLowerCase() === "premium" || this.subscriptionId.toLowerCase() === "enterprise";
	}

	/**
	 * Get account creation date formatted
	 */
	get formattedCreatedAt(): string {
		if (!this.createdAt) return "";
		return DateTime.fromISO(this.createdAt).toLocaleString(DateTime.DATE_FULL);
	}

	/**
	 * Get account status
	 */
	get status(): "Active" | "Inactive" {
		// For now, all accounts are considered active
		// This could be enhanced with actual status checking
		return "Active";
	}
}
