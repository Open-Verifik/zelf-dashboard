import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { HttpWrapperService } from "app/http-wrapper.service";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

export interface SubscriptionPlan {
	id: string;
	object: string;
	active: boolean;
	attributes: any[];
	created: number;
	default_price: string;
	description: string;
	images: string[];
	livemode: boolean;
	marketing_features: any[];
	metadata: {
		planType: string;
		zelfPlan: string;
	};
	name: string;
	package_dimensions: any;
	shippable: any;
	statement_descriptor: any;
	tax_code: string;
	type: string;
	unit_label: any;
	updated: number;
	url: any;
	prices: Price[];
}

export interface Price {
	id: string;
	object: string;
	active: boolean;
	billing_scheme: string;
	created: number;
	currency: string;
	custom_unit_amount: any;
	livemode: boolean;
	lookup_key: any;
	metadata: any;
	nickname: any;
	product: string;
	recurring: {
		aggregate_usage: any;
		interval: string;
		interval_count: number;
		meter: any;
		trial_period_days: any;
		usage_type: string;
	};
	tax_behavior: string;
	tiers_mode: any;
	transform_quantity: any;
	type: string;
	unit_amount: number;
	unit_amount_decimal: string;
}

export interface SubscribeRequest {
	productId: string;
	priceId: string;
	customerEmail?: string;
}

export interface SubscribeResponse {
	sessionId: string;
	url: string;
	success: boolean;
}

export interface StripePortalResponse {
	url: string;
	success: boolean;
}

export interface CancelSubscriptionResponse {
	success: boolean;
	message: string;
}

@Injectable({
	providedIn: "root",
})
export class SubscriptionPlansService {
	private _httpClient = inject(HttpClient);
	private _httpWrapper = inject(HttpWrapperService);

	/**
	 * Get all subscription plans
	 */
	async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
		try {
			// Add timeout to prevent hanging
			const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout after 10 seconds")), 10000));

			const requestPromise = this._httpWrapper.sendRequest("get", `${environment.apiUrl}${environment.endpoints.subscriptionPlans.list}`);

			const response = await Promise.race([requestPromise, timeoutPromise]);
			return response.data || [];
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Get a specific subscription plan by product ID
	 */
	async getSubscriptionPlan(productId: string): Promise<SubscriptionPlan> {
		try {
			const response = await this._httpWrapper.sendRequest(
				"get",
				`${environment.apiUrl}${environment.endpoints.subscriptionPlans.getById}/${productId}`
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Create a Stripe checkout session for subscription
	 */
	async subscribe(request: SubscribeRequest): Promise<SubscribeResponse> {
		try {
			const response = await this._httpWrapper.sendRequest(
				"post",
				`${environment.apiUrl}${environment.endpoints.subscriptionPlans.subscribe}`,
				request
			);

			// Handle both direct response and nested data response
			if (response.data) {
				return response.data;
			} else {
				return response;
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Get my plan from API
	 */
	async getMySubscription(): Promise<any> {
		try {
			const response = await this._httpWrapper.sendRequest(
				"get",
				`${environment.apiUrl}${environment.endpoints.subscriptionPlans.mySubscription}`
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Create Stripe customer portal session
	 */
	async createStripePortalSession(): Promise<StripePortalResponse> {
		try {
			const response = await this._httpWrapper.sendRequest(
				"post",
				`${environment.apiUrl}${environment.endpoints.subscriptionPlans.createPortalSession}`
			);
			return response.data || response;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Cancel subscription
	 */
	async cancelSubscription(subscriptionId: string): Promise<CancelSubscriptionResponse> {
		try {
			const response = await this._httpWrapper.sendRequest(
				"post",
				`${environment.apiUrl}${environment.endpoints.subscriptionPlans.cancelSubscription}`,
				{ subscriptionId }
			);
			return response.data || response;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Upgrade subscription to a new plan
	 */
	async upgradeSubscription(subscriptionId: string, newPriceId: string): Promise<SubscribeResponse> {
		try {
			const response = await this._httpWrapper.sendRequest(
				"post",
				`${environment.apiUrl}${environment.endpoints.subscriptionPlans.upgradeSubscription}`,
				{ subscriptionId, newPriceId }
			);
			return response.data || response;
		} catch (error) {
			throw error;
		}
	}
}
