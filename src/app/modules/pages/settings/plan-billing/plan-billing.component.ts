import { CommonModule, NgClass } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatOptionModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { TranslocoModule, TranslocoService } from "@jsverse/transloco";
import { Price, SubscribeRequest, SubscriptionPlan, SubscriptionPlansService } from "app/core/services/subscription-plans.service";

@Component({
    selector: "settings-plan-billing",
    templateUrl: "./plan-billing.component.html",
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatRadioModule,
        NgClass,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        MatButtonModule,
        TranslocoModule,
    ],
})
export class SettingsPlanBillingComponent implements OnInit {
    planBillingForm: UntypedFormGroup;
    plans: SubscriptionPlan[] = [];
    loading: boolean = false;
    subscribing: boolean = false;
    error: string | null = null;
    hasSubscription: boolean = false;
    mySubscription: any = null;
    showPlanComparison: boolean = false;
    selectedUpgradePlan: SubscriptionPlan | null = null;
    showBillingHistory: boolean = false;
    billingHistory: any[] = [];
    initialLoading: boolean = true;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _subscriptionPlansService: SubscriptionPlansService,
        private _cdr: ChangeDetectorRef,
        private _translocoService: TranslocoService,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
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

        try {
            // Check for session_id (return from Stripe checkout)
            const sessionId = this._activatedRoute.snapshot.queryParamMap.get("session_id");

            if (sessionId) await this.handleSessionVerification(sessionId);

            // Load subscription data (always reload to get fresh state)
            await this.loadMyPlan();

            // Then load subscription plans
            await this.loadSubscriptionPlans();
        } catch (err) {
            console.error("Error initializing plan billing:", err);
        } finally {
            this.initialLoading = false;
            this._cdr.detectChanges();
        }
    }

    /**
     * Handle session verification
     */
    async handleSessionVerification(sessionId: string): Promise<void> {
        this.initialLoading = true;
        this._cdr.detectChanges();

        // Wait 3 seconds to allow webhook to process (if it beats us)
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Verify session if needed
        try {
            await this._subscriptionPlansService.verifySession(sessionId);
        } catch (err) {
            console.error("Session verification failed", err);
            this.error = "Failed to verify subscription. Please contact support.";
        }
    }

    /**
     * Load my plan from API
     */
    async loadMyPlan(): Promise<void> {
        try {
            this.mySubscription = await this._subscriptionPlansService.getMySubscription();
            this.hasSubscription = this.mySubscription && this.mySubscription.subscription && this.mySubscription.subscription.status === "active";
            this._cdr.detectChanges();
        } catch (error) {
            console.error("Failed to load subscription:", error);
            this.hasSubscription = false;
        }
    }

    /**
     * Load subscription plans from API
     */
    async loadSubscriptionPlans(): Promise<void> {
        this.loading = true;
        this.error = null;

        try {
            const plans = await this._subscriptionPlansService.getSubscriptionPlans();

            // Sort plans by price (cheapest to expensive)
            this.plans = plans.sort((a, b) => {
                const priceA = this.getCheapestPrice(a)?.unit_amount || 0;
                const priceB = this.getCheapestPrice(b)?.unit_amount || 0;
                return priceA - priceB;
            });

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
    subscribingPlanId: string | null = null;

    /**
     * Handle subscribe button click
     */
    async onSubscribe(planId: string): Promise<void> {
        if (!planId) return;

        // Find the selected plan
        const selectedPlan = this.plans.find((plan) => plan.id === planId);

        if (!selectedPlan) return;

        // Get the cheapest price for the selected plan
        const cheapestPrice = this.getCheapestPrice(selectedPlan);

        if (!cheapestPrice) return;

        this.subscribing = true;
        this.subscribingPlanId = planId;

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
            this.subscribingPlanId = null;
            this._cdr.detectChanges();
        }
    }

    /**
     * Get current plan details
     */
    getCurrentPlan(): any {
        if (!this.mySubscription || !this.mySubscription.product) return null;
        return this.mySubscription.product;
    }

    /**
     * Get current subscription details
     */
    getCurrentSubscription(): any {
        if (!this.mySubscription || !this.mySubscription.subscription) return null;
        return this.mySubscription.subscription;
    }

    /**
     * Format date for display
     */
    formatDate(timestamp: number): string {
        return new Date(timestamp * 1000).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    /**
     * Get subscription status color
     */
    getStatusColor(status: string): string {
        switch (status) {
            case "active":
                return "text-green-600";
            case "canceled":
                return "text-red-600";
            case "past_due":
                return "text-yellow-600";
            case "unpaid":
                return "text-red-600";
            default:
                return "text-gray-600";
        }
    }

    /**
     * Get subscription status badge color
     */
    getStatusBadgeColor(status: string): string {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800";
            case "canceled":
                return "bg-red-100 text-red-800";
            case "past_due":
                return "bg-yellow-100 text-yellow-800";
            case "unpaid":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    }

    /**
     * Show plan comparison for upgrade
     */
    showUpgradeComparison(plan: SubscriptionPlan): void {
        this.selectedUpgradePlan = plan;
        this.showPlanComparison = true;
        this._cdr.detectChanges();
    }

    /**
     * Hide plan comparison
     */
    hidePlanComparison(): void {
        this.showPlanComparison = false;
        this.selectedUpgradePlan = null;
        this._cdr.detectChanges();
    }

    /**
     * Get available upgrade plans (plans with higher price than current)
     */
    getUpgradePlans(): SubscriptionPlan[] {
        if (!this.mySubscription || !this.mySubscription.subscription) return this.plans;

        const currentPrice = this.mySubscription.subscription.plan.amount;
        return this.plans.filter((plan) => {
            const cheapestPrice = this.getCheapestPrice(plan);
            return cheapestPrice && cheapestPrice.unit_amount > currentPrice;
        });
    }

    /**
     * Open Stripe customer portal for subscription management
     */
    async openStripePortal(): Promise<void> {
        try {
            const response = await this._subscriptionPlansService.createStripePortalSession();

            if (response && response.success && response.url) {
                // Redirect to Stripe customer portal
                window.location.href = response.url;
                return;
            }

            throw new Error("Failed to create portal session");
        } catch (error) {
            this.error = `Failed to open billing portal: ${error.message || "Unknown error"}`;
            this._cdr.detectChanges();
        }
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(): Promise<void> {
        if (!confirm("Are you sure you want to cancel your subscription? This action cannot be undone.")) {
            return;
        }

        try {
            const subscription = this.getCurrentSubscription();
            if (!subscription) {
                throw new Error("No active subscription found");
            }

            const response = await this._subscriptionPlansService.cancelSubscription(subscription.id);

            if (response && response.success) {
                // Reload subscription data
                await this.loadMyPlan();
                alert("Subscription cancelled successfully.");
            } else {
                throw new Error(response?.message || "Failed to cancel subscription");
            }
        } catch (error) {
            this.error = `Failed to cancel subscription: ${error.message || "Unknown error"}`;
            this._cdr.detectChanges();
        }
    }

    /**
     * Upgrade to a specific plan
     */
    async upgradeToPlan(plan: SubscriptionPlan): Promise<void> {
        try {
            const subscription = this.getCurrentSubscription();
            if (!subscription) {
                throw new Error("No active subscription found");
            }

            const cheapestPrice = this.getCheapestPrice(plan);
            if (!cheapestPrice) {
                throw new Error("No valid price found for this plan");
            }

            const response = await this._subscriptionPlansService.upgradeSubscription(subscription.id, cheapestPrice.id);

            if (response && response.success && response.url) {
                // Redirect to Stripe checkout for upgrade
                window.location.href = response.url;
                return;
            }

            throw new Error("Failed to create upgrade session");
        } catch (error) {
            this.error = `Failed to upgrade plan: ${error.message || "Unknown error"}`;
            this._cdr.detectChanges();
        }
    }

    /**
     * Toggle billing history visibility
     */
    toggleBillingHistory(): void {
        this.showBillingHistory = !this.showBillingHistory;
        if (this.showBillingHistory && this.billingHistory.length === 0) {
            this.loadBillingHistory();
        }
        this._cdr.detectChanges();
    }

    /**
     * Load billing history (mock data for now)
     */
    async loadBillingHistory(): Promise<void> {
        try {
            // Mock billing history data - replace with actual API call
            this.billingHistory = [
                {
                    id: "in_1SIBhPFO6i3ofqGHMzmmHGNA",
                    amount: 99900,
                    currency: "usd",
                    status: "paid",
                    date: 1760461667,
                    description: "Zelf Business - Monthly subscription",
                },
            ];
            this._cdr.detectChanges();
        } catch (error) {
            console.error("Failed to load billing history:", error);
        }
    }

    /**
     * Get plan usage information
     */
    getPlanUsage(): any {
        if (!this.mySubscription || !this.mySubscription.domainConfig) return null;

        const config = this.mySubscription.domainConfig;
        return {
            activeUsers: this.getActiveUserLimit(),
            encryptions: this.getEncryptionLimit(),
            storage: config.storage || {},
            features: config.features || [],
        };
    }

    /**
     * Get active user limit based on plan
     */
    getActiveUserLimit(): number {
        const plan = this.getCurrentPlan();
        if (!plan) return 0;

        switch (plan.metadata.zelfPlan) {
            case "zelfBasic":
                return 50;
            case "zelfStartUp":
                return 500;
            case "zelfBusiness":
                return 1250;
            case "zelfGold":
                return 3000;
            case "zelfEnterprise":
                return 10000;
            default:
                return 0;
        }
    }

    /**
     * Get encryption limit based on plan
     */
    getEncryptionLimit(): number | string {
        const plan = this.getCurrentPlan();
        if (!plan) return 0;

        return plan.metadata.zelfPlan === "zelfBasic" ? 50 : "Unlimited";
    }
}
