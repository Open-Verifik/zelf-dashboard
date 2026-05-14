import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { TranslocoModule } from "@jsverse/transloco";
import { SubscriptionPricingMeta } from "app/core/services/subscription-plans.service";

@Component({
    selector: "plan-billing-zns-balance",
    templateUrl: "./plan-billing-zns-balance.component.html",
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, MatButtonModule, MatIconModule, TranslocoModule],
})
export class PlanBillingZnsBalanceComponent {
    /** Current ZNS balance for the user's Solana address (null while loading). */
    @Input() znsBalance: number | null = null;
    @Input() loading: boolean = false;
    @Input() solanaAddress: string | null = null;
    /** Reuses backend's `rewardPrice` (USD per ZNS) to compute approximate fiat value. */
    @Input() pricingMeta: SubscriptionPricingMeta | null = null;

    @Output() readonly refresh = new EventEmitter<void>();

    readonly i18nPrefix = "saving_operations.plan_billing_page.zns_balance";

    /** USD-equivalent of `znsBalance` rounded to 2 decimals; null when inputs missing. */
    get usdEquivalent(): number | null {
        if (this.znsBalance == null || !this.pricingMeta?.rewardPrice) return null;
        const usd = this.znsBalance * this.pricingMeta.rewardPrice;
        return Math.round(usd * 100) / 100;
    }

    /** Compact preview of solanaAddress for display (first 4 + … + last 4). */
    get truncatedAddress(): string {
        if (!this.solanaAddress) return "";
        if (this.solanaAddress.length <= 12) return this.solanaAddress;
        return `${this.solanaAddress.slice(0, 4)}…${this.solanaAddress.slice(-4)}`;
    }

    onRefresh(): void {
        if (this.loading) return;
        this.refresh.emit();
    }
}
