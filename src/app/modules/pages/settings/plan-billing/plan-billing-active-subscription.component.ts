import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { TranslocoModule } from "@jsverse/transloco";

@Component({
	selector: "plan-billing-active-subscription",
	templateUrl: "./plan-billing-active-subscription.component.html",
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [MatButtonModule, MatIconModule, TranslocoModule],
})
export class PlanBillingActiveSubscriptionComponent {
	@Input({ required: true }) subscriptionStatus!: string;
	@Input({ required: true }) planName!: string;
	/** Optional. Empty/missing values hide the description paragraph (Stripe catalog copy is no longer surfaced). */
	@Input() planDescription: string = "";
	@Input({ required: true }) formattedPrice!: string;
	@Input({ required: true }) intervalWord!: string;
	@Input({ required: true }) nextBillingFormatted!: string;
	@Input({ required: true }) periodStartFormatted!: string;
	@Input({ required: true }) periodEndFormatted!: string;
	@Input({ required: true }) subscriptionId!: string;

	@Output() readonly manageBilling = new EventEmitter<void>();

	onManageBilling(): void {
		this.manageBilling.emit();
	}
}
