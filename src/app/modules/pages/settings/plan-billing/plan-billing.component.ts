import { NgClass } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatOptionModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { FuseAlertComponent } from "@fuse/components/alert";
import { FuseCardComponent } from "@fuse/components/card";
import { SubscriptionPlansService, SubscriptionPlan, Price, SubscribeRequest } from "app/core/services/subscription-plans.service";

@Component({
	selector: "settings-plan-billing",
	templateUrl: "./plan-billing.component.html",
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		FormsModule,
		ReactiveFormsModule,
		FuseAlertComponent,
		FuseCardComponent,
		MatRadioModule,
		NgClass,
		MatIconModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatOptionModule,
		MatButtonModule,
	],
})
export class SettingsPlanBillingComponent implements OnInit {
	planBillingForm: UntypedFormGroup;
	plans: SubscriptionPlan[] = [];
	loading: boolean = false;
	subscribing: boolean = false;
	error: string | null = null;
	hasSubscription: boolean = false;

	/**
	 * Constructor
	 */
	constructor(
		private _formBuilder: UntypedFormBuilder,
		private _subscriptionPlansService: SubscriptionPlansService,
		private _cdr: ChangeDetectorRef
	) {}

	// -----------------------------------------------------------------------------------------------------
	// @ Lifecycle hooks
	// -----------------------------------------------------------------------------------------------------

	/**
	 * On init
	 */
	async ngOnInit(): Promise<void> {
		// Check if user has a subscription
		this.checkSubscriptionStatus();

		// Create the form
		this.planBillingForm = this._formBuilder.group({
			plan: [""],
			cardHolder: ["Brian Hughes"],
			cardNumber: [""],
			cardExpiration: [""],
			cardCVC: [""],
			country: ["usa"],
			zip: [""],
		});

		// Load subscription plans
		await this.loadSubscriptionPlans();
	}

	/**
	 * Load subscription plans from API
	 */
	async loadSubscriptionPlans(): Promise<void> {
		this.loading = true;
		this.error = null;

		try {
			const plans = await this._subscriptionPlansService.getSubscriptionPlans();

			this.plans = plans;

			// Set default plan if available
			if (plans.length > 0) {
				this.planBillingForm.patchValue({ plan: plans[0].id });
			}

			// Manually trigger change detection
			this._cdr.detectChanges();
		} catch (error) {
			this.error = `Failed to load subscription plans: ${error.message || "Unknown error"}`;
		} finally {
			this.loading = false;
			// Trigger change detection after loading is complete
			this._cdr.detectChanges();
		}
	}

	/**
	 * Check if user has a subscription in localStorage
	 */
	checkSubscriptionStatus(): void {
		try {
			const subscription = localStorage.getItem("subscription");
			this.hasSubscription = subscription !== null && subscription !== "null" && subscription !== "";
		} catch (error) {
			this.hasSubscription = false;
		}
	}

	// -----------------------------------------------------------------------------------------------------
	// @ Public methods
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Track by function for ngFor loops
	 *
	 * @param index
	 * @param item
	 */
	trackByFn(index: number, item: SubscriptionPlan): any {
		return item.id || index;
	}

	/**
	 * Format price for display
	 */
	formatPrice(unitAmount: number, currency: string): string {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency.toUpperCase(),
		}).format(unitAmount / 100);
	}

	/**
	 * Get the cheapest price from a plan's prices array
	 */
	getCheapestPrice(plan: SubscriptionPlan): Price | null {
		if (!plan.prices || plan.prices.length === 0) return null;

		// Filter active prices and sort by price
		const validPrices = plan.prices.filter((price) => price.active && price.unit_amount > 0).sort((a, b) => a.unit_amount - b.unit_amount);

		return validPrices.length > 0 ? validPrices[0] : null;
	}

	/**
	 * Get plan display name
	 */
	getPlanDisplayName(zelfPlan: string): string {
		const planNames: { [key: string]: string } = {
			zelfBasic: "BASIC",
			ZelfGold: "GOLD",
			zelfBusiness: "BUSINESS",
			zelfStartUp: "STARTUP",
			zelfEnterprise: "ENTERPRISE",
		};
		return planNames[zelfPlan] || zelfPlan.toUpperCase();
	}

	/**
	 * Select a plan
	 */
	selectPlan(planId: string): void {
		this.planBillingForm.patchValue({ plan: planId });
		this._cdr.detectChanges();
	}

	/**
	 * Check if a plan is selected
	 */
	isPlanSelected(planId: string): boolean {
		return this.planBillingForm.get("plan")?.value === planId;
	}

	/**
	 * Handle subscribe button click
	 */
	async onSubscribe(): Promise<void> {
		const selectedPlanId = this.planBillingForm.get("plan")?.value;

		if (!selectedPlanId) return;

		// Find the selected plan
		const selectedPlan = this.plans.find((plan) => plan.id === selectedPlanId);

		if (!selectedPlan) return;

		// Get the cheapest price for the selected plan
		const cheapestPrice = this.getCheapestPrice(selectedPlan);

		if (!cheapestPrice) return;

		this.subscribing = true;

		this.error = null;

		this._cdr.detectChanges();

		try {
			const subscribeRequest: SubscribeRequest = {
				productId: selectedPlan.id,
				priceId: cheapestPrice.id,
				customerEmail: null, // You can get this from user profile if needed
			};

			const response = await this._subscriptionPlansService.subscribe(subscribeRequest);

			if (response && response.success && response.url) {
				// Redirect to Stripe checkout
				window.location.href = response.url;

				return;
			}

			throw new Error("Failed to create checkout session");
		} catch (error) {
			this.error = `Failed to create checkout session: ${error.message || "Unknown error"}`;
		} finally {
			this.subscribing = false;
			this._cdr.detectChanges();
		}
	}
}
