/**
 * Extra Plan & Billing strings merged after `/i18n/{lang}.json` loads.
 * Bundled here so `ng serve` does not depend on `/i18n/overlays/*` being copied (avoids 404 + missing keys).
 */
export const PLAN_BILLING_PRICING_OVERLAY: Record<string, unknown> = {
	saving_operations: {
		plan_billing_page: {
			zns_balance: {
				title: "ZNS balance",
				usd_equivalent: "≈ {{usd}} USD",
				wallet_label: "Wallet:",
				missing_wallet: "No Solana wallet linked to this account.",
				refresh: "Refresh",
			},
			zns_pricing: {
				title: "Usage pricing",
				subtitle: "All operations are billed in ZNS at the reference token price.",
				columns: {
					usage: "Usage",
					usd: "USD",
					zns: "ZNS",
				},
				rows: {
					reference: "ZNS reference price",
					encrypt: "Encryption",
					active_user: "Active Zelf ID / month",
					active_user_suffix: "(includes monthly liveness)",
					decrypt_with_liveness: "Decrypt with liveness (after included)",
					decrypt_no_liveness: "Decrypt without liveness",
				},
				footnote:
					"The first {{decryptIncludedPerMonth}} decrypts per month are included when liveness is performed. Active-user metering is tied to a Zelf ID.",
				credits: {
					title: "Estimated monthly ZNS credit",
					subtitle: "Approximate ZNS credited per billing cycle for each plan, rounded up.",
					columns: {
						plan: "Plan",
						price: "Price",
						estimated_zns: "Est. ZNS / month",
					},
				},
			},
		},
	},
};
