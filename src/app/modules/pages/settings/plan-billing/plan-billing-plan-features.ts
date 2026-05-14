/** Rows for plan tier feature lists (Transloco keys under saving_operations.plan_billing_page.features.). */
export interface PlanFeatureRow {
    /** Optional bold numeric/string prefix before translated suffix */
    prefixBold?: string;
    /** Transloco key segment after features. */
    translationKey: string;
    /** Row uses unlimited + encryptions pattern */
    mode?: "default" | "unlimited_encryptions" | "single";
}

const PLAN_FEATURE_ROWS: Record<string, PlanFeatureRow[]> = {
    zelfBasic: [
        { prefixBold: "50", translationKey: "active_users", mode: "default" },
        { prefixBold: "50", translationKey: "encryptions_mo", mode: "default" },
    ],
    zelfStartUp: [
        { prefixBold: "500", translationKey: "active_users", mode: "default" },
        { translationKey: "unlimited", mode: "unlimited_encryptions" },
    ],
    zelfBusiness: [
        { prefixBold: "1,250", translationKey: "active_users", mode: "default" },
        { translationKey: "priority_support", mode: "single" },
    ],
    zelfGold: [
        { prefixBold: "3,000", translationKey: "active_users", mode: "default" },
        { translationKey: "advanced_analytics", mode: "single" },
    ],
    zelfEnterprise: [
        { prefixBold: "10,000", translationKey: "users", mode: "default" },
        { translationKey: "dedicated_infra", mode: "single" },
    ],
};

export function getPlanFeatureRows(zelfPlan: string): PlanFeatureRow[] {
    const key = zelfPlan === "ZelfGold" ? "zelfGold" : zelfPlan;
    return PLAN_FEATURE_ROWS[key] ?? [];
}

/** Startup tier gets primary CTA emphasis (Privy-style “popular” plan). */
export function isHighlightedPlanTier(zelfPlan: string): boolean {
    return zelfPlan === "zelfStartUp";
}
