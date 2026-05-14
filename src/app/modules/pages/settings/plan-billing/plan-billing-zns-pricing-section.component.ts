import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { TranslocoModule } from "@jsverse/transloco";
import { SubscriptionPricingMeta } from "app/core/services/subscription-plans.service";

export interface PlanBillingPricingCreditRow {
	planLabel: string;
	priceLabel: string;
	estimatedZns: number | null;
}

interface UsageRow {
	/** Translation key suffix under saving_operations.plan_billing_page.zns_pricing.rows. */
	labelKey: string;
	usdFormatted: string;
	/** Token equivalent at REWARD_PRICE; null hides the ZNS cell (reference row uses 1 implicitly). */
	tokens: number | null;
	/** Optional translation key suffix appended after the USD/ZNS pair. */
	suffixKey?: string;
}

@Component({
	selector: "plan-billing-zns-pricing-section",
	templateUrl: "./plan-billing-zns-pricing-section.component.html",
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [MatIconModule, TranslocoModule],
})
export class PlanBillingZnsPricingSectionComponent {
	@Input({ required: true }) pricingMeta: SubscriptionPricingMeta | null = null;
	@Input() creditRows: PlanBillingPricingCreditRow[] = [];

	readonly i18nPrefix = "saving_operations.plan_billing_page.zns_pricing";

	get usageRows(): UsageRow[] {
		const m = this.pricingMeta;
		if (!m) return [];

		return [
			{
				labelKey: "rows.reference",
				usdFormatted: m.rewardPriceFormatted,
				tokens: 1,
			},
			{
				labelKey: "rows.encrypt",
				usdFormatted: m.encryptUsdFormatted,
				tokens: m.encryptTokens,
			},
			{
				labelKey: "rows.active_user",
				usdFormatted: m.activeUserMonthlyUsdFormatted,
				tokens: m.activeUserMonthlyTokens,
				suffixKey: "rows.active_user_suffix",
			},
			{
				labelKey: "rows.decrypt_with_liveness",
				usdFormatted: m.decryptWithLivenessUsdFormatted,
				tokens: m.decryptWithLivenessTokens,
			},
			{
				labelKey: "rows.decrypt_no_liveness",
				usdFormatted: m.decryptNoLivenessUsdFormatted,
				tokens: m.decryptNoLivenessTokens,
			},
		];
	}

	/** Params for the footnote (first N decrypts/month, Zelf-ID linkage). */
	get footnoteParams(): Record<string, string | number> {
		const m = this.pricingMeta;
		return m ? { decryptIncludedPerMonth: m.decryptIncludedPerMonth } : {};
	}

	trackUsageRow(_index: number, row: UsageRow): string {
		return row.labelKey;
	}

	trackCreditRow(_index: number, row: PlanBillingPricingCreditRow): string {
		return `${row.planLabel}-${row.priceLabel}`;
	}
}
