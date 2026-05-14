import { NgClass } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { TranslocoModule } from "@jsverse/transloco";
import { Price, SubscriptionPlan } from "app/core/services/subscription-plans.service";
import { PlanFeatureRow } from "./plan-billing-plan-features";

@Component({
    selector: "plan-billing-plan-card",
    templateUrl: "./plan-billing-plan-card.component.html",
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass, MatButtonModule, MatIconModule, TranslocoModule],
})
export class PlanBillingPlanCardComponent {
    @Input({ required: true }) plan!: SubscriptionPlan;
    @Input() price: Price | null = null;
    /** Pre-formatted currency string when `price` is set */
    @Input() formattedPrice: string | null = null;
    @Input({ required: true }) displayName!: string;
    @Input({ required: true }) featureRows!: PlanFeatureRow[];
    @Input({ required: true }) hasSubscription!: boolean;
    @Input({ required: true }) subscribing!: boolean;
    @Input({ required: true }) subscribingPlanId!: string | null;
    @Input({ required: true }) highlighted!: boolean;

    @Output() readonly subscribe = new EventEmitter<string>();
    @Output() readonly upgrade = new EventEmitter<SubscriptionPlan>();

    readonly featureKeyPrefix = "saving_operations.plan_billing_page.features.";

    onSubscribe(): void {
        this.subscribe.emit(this.plan.id);
    }

    onUpgrade(): void {
        this.upgrade.emit(this.plan);
    }

    isThisPlanSubscribing(): boolean {
        return this.subscribing && this.subscribingPlanId === this.plan.id;
    }

    featureKey(row: PlanFeatureRow): string {
        return this.featureKeyPrefix + row.translationKey;
    }

    /** Stable track key — avoid `??` inside `@for` track (Angular can emit broken temporaries). */
    trackFeatureRow(index: number, row: PlanFeatureRow): string {
        const prefix = row.prefixBold != null ? row.prefixBold : "";
        const mode = row.mode != null ? row.mode : "";
        return `${index}-${row.translationKey}-${prefix}-${mode}`;
    }
}
