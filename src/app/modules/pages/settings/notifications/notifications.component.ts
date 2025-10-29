import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy, ViewEncapsulation } from "@angular/core";
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { MatDividerModule } from "@angular/material/divider";
import { MatChipsModule } from "@angular/material/chips";
import { MatBadgeModule } from "@angular/material/badge";
import { CommonModule } from "@angular/common";
import { TranslocoModule } from "@jsverse/transloco";
// Simple interface for notification settings
export interface DomainNotificationSettings {
	// Domain Registration Events
	domainRegistration: boolean;
	domainRegistrationFailed: boolean;
	domainTransfer: boolean;
	domainTransferFailed: boolean;

	// Domain Expiration Events
	domainExpirationWarning: boolean;
	domainExpirationCritical: boolean;
	domainExpired: boolean;
	domainRenewal: boolean;
	domainRenewalFailed: boolean;

	// Subscription Events
	subscriptionCreated: boolean;
	subscriptionRenewed: boolean;
	subscriptionExpired: boolean;
	subscriptionCancelled: boolean;
	subscriptionFailed: boolean;
	subscriptionUpgraded: boolean;
	subscriptionDowngraded: boolean;

	// IPFS Events
	ipfsUploadSuccess: boolean;
	ipfsUploadFailed: boolean;
	ipfsSyncSuccess: boolean;
	ipfsSyncFailed: boolean;

	// Error Events
	systemErrors: boolean;
	paymentErrors: boolean;
	networkErrors: boolean;
	validationErrors: boolean;

	// Customer Interaction Events
	customerInquiry: boolean;
	customerSupport: boolean;
	customerFeedback: boolean;

	// Notification Channels
	emailNotifications: boolean;
	inAppNotifications: boolean;
	pushNotifications: boolean;
	smsNotifications: boolean;
}

@Component({
	selector: "settings-notifications",
	templateUrl: "./notifications.component.html",
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MatSlideToggleModule,
		MatButtonModule,
		MatIconModule,
		MatCardModule,
		MatDividerModule,
		MatChipsModule,
		MatBadgeModule,
		TranslocoModule,
	],
})
export class SettingsNotificationsComponent implements OnInit {
	notificationsForm: UntypedFormGroup;
	isLoading: boolean = false;
	isSaving: boolean = false;

	// Notification categories for better organization
	notificationCategories = [
		{
			id: "domain-registration",
			title: "Domain Registration",
			description: "Notifications about domain registration and transfer events",
			icon: "heroicons_outline:globe-alt",
			color: "primary",
			settings: [
				{ key: "domainRegistration", label: "Domain Registration Success", description: "When a domain is successfully registered" },
				{ key: "domainRegistrationFailed", label: "Domain Registration Failed", description: "When domain registration fails" },
				{ key: "domainTransfer", label: "Domain Transfer Success", description: "When a domain is successfully transferred" },
				{ key: "domainTransferFailed", label: "Domain Transfer Failed", description: "When domain transfer fails" },
			],
		},
		{
			id: "domain-expiration",
			title: "Domain Expiration",
			description: "Notifications about domain expiration and renewal events",
			icon: "heroicons_outline:clock",
			color: "warn",
			settings: [
				{ key: "domainExpirationWarning", label: "Expiration Warning (30 days)", description: "When domain expires in 30 days" },
				{ key: "domainExpirationCritical", label: "Expiration Critical (7 days)", description: "When domain expires in 7 days" },
				{ key: "domainExpired", label: "Domain Expired", description: "When domain has expired" },
				{ key: "domainRenewal", label: "Domain Renewal Success", description: "When domain is successfully renewed" },
				{ key: "domainRenewalFailed", label: "Domain Renewal Failed", description: "When domain renewal fails" },
			],
		},
		{
			id: "subscription",
			title: "Subscription Management",
			description: "Notifications about subscription plan changes and billing",
			icon: "heroicons_outline:credit-card",
			color: "accent",
			settings: [
				{ key: "subscriptionCreated", label: "Subscription Created", description: "When a new subscription is created" },
				{ key: "subscriptionRenewed", label: "Subscription Renewed", description: "When subscription is renewed" },
				{ key: "subscriptionExpired", label: "Subscription Expired", description: "When subscription expires" },
				{ key: "subscriptionCancelled", label: "Subscription Cancelled", description: "When subscription is cancelled" },
				{ key: "subscriptionFailed", label: "Subscription Payment Failed", description: "When subscription payment fails" },
				{ key: "subscriptionUpgraded", label: "Subscription Upgraded", description: "When subscription is upgraded" },
				{ key: "subscriptionDowngraded", label: "Subscription Downgraded", description: "When subscription is downgraded" },
			],
		},
		{
			id: "ipfs",
			title: "IPFS Storage",
			description: "Notifications about IPFS upload and sync events",
			icon: "heroicons_outline:cloud-arrow-up",
			color: "primary",
			settings: [
				{ key: "ipfsUploadSuccess", label: "IPFS Upload Success", description: "When files are successfully uploaded to IPFS" },
				{ key: "ipfsUploadFailed", label: "IPFS Upload Failed", description: "When IPFS upload fails" },
				{ key: "ipfsSyncSuccess", label: "IPFS Sync Success", description: "When IPFS sync completes successfully" },
				{ key: "ipfsSyncFailed", label: "IPFS Sync Failed", description: "When IPFS sync fails" },
			],
		},
		{
			id: "errors",
			title: "System Errors",
			description: "Notifications about system errors and issues",
			icon: "heroicons_outline:exclamation-triangle",
			color: "warn",
			settings: [
				{ key: "systemErrors", label: "System Errors", description: "When system errors occur" },
				{ key: "paymentErrors", label: "Payment Errors", description: "When payment processing errors occur" },
				{ key: "networkErrors", label: "Network Errors", description: "When network connectivity issues occur" },
				{ key: "validationErrors", label: "Validation Errors", description: "When data validation errors occur" },
			],
		},
		{
			id: "customer-interaction",
			title: "Customer Interaction",
			description: "Notifications about customer inquiries and support",
			icon: "heroicons_outline:chat-bubble-left-right",
			color: "accent",
			settings: [
				{ key: "customerInquiry", label: "Customer Inquiries", description: "When customers submit inquiries" },
				{ key: "customerSupport", label: "Support Requests", description: "When customers request support" },
				{ key: "customerFeedback", label: "Customer Feedback", description: "When customers provide feedback" },
			],
		},
	];

	// Notification channels
	notificationChannels = [
		{
			key: "emailNotifications",
			label: "Email Notifications",
			description: "Receive notifications via email",
			icon: "heroicons_outline:envelope",
			enabled: true,
		},
		{
			key: "inAppNotifications",
			label: "In-App Notifications",
			description: "Receive notifications within the dashboard",
			icon: "heroicons_outline:bell",
			enabled: true,
		},
		{
			key: "pushNotifications",
			label: "Push Notifications",
			description: "Receive browser push notifications",
			icon: "heroicons_outline:device-phone-mobile",
			enabled: false,
		},
		{
			key: "smsNotifications",
			label: "SMS Notifications",
			description: "Receive notifications via SMS (premium feature)",
			icon: "heroicons_outline:chat-bubble-left-right",
			enabled: false,
		},
	];

	/**
	 * Constructor
	 */
	constructor(
		private _formBuilder: UntypedFormBuilder,
		private _changeDetectorRef: ChangeDetectorRef
	) {}

	// -----------------------------------------------------------------------------------------------------
	// @ Lifecycle hooks
	// -----------------------------------------------------------------------------------------------------

	/**
	 * On init
	 */
	ngOnInit(): void {
		this.createForm();
		this.loadNotificationSettings();
	}

	// -----------------------------------------------------------------------------------------------------
	// @ Public methods
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Create the notifications form
	 */
	createForm(): void {
		// Create form controls for all notification settings
		const formControls: any = {};

		// Add controls for each category
		this.notificationCategories.forEach((category) => {
			category.settings.forEach((setting) => {
				formControls[setting.key] = [true]; // Default to enabled
			});
		});

		// Add controls for notification channels
		this.notificationChannels.forEach((channel) => {
			formControls[channel.key] = [channel.enabled];
		});

		this.notificationsForm = this._formBuilder.group(formControls);
	}

	/**
	 * Load notification settings from localStorage
	 */
	loadNotificationSettings(): void {
		this.isLoading = true;

		// Load from localStorage or use defaults
		const savedSettings = localStorage.getItem("domainNotificationSettings");
		if (savedSettings) {
			try {
				const settings = JSON.parse(savedSettings);
				this.notificationsForm.patchValue(settings);
			} catch (error) {
				console.error("Error parsing saved settings:", error);
			}
		}

		this.isLoading = false;
		this._changeDetectorRef.markForCheck();
	}

	/**
	 * Save notification settings to localStorage
	 */
	saveSettings(): void {
		if (this.notificationsForm.invalid) {
			return;
		}

		this.isSaving = true;
		const settings = this.notificationsForm.value;

		// Save to localStorage
		localStorage.setItem("domainNotificationSettings", JSON.stringify(settings));

		// Simulate save delay
		setTimeout(() => {
			this.isSaving = false;
			this._changeDetectorRef.markForCheck();
			// TODO: Show success message
		}, 1000);
	}

	/**
	 * Reset to default settings
	 */
	resetToDefaults(): void {
		this.createForm();
		this._changeDetectorRef.markForCheck();
	}

	/**
	 * Enable all notifications for a category
	 */
	enableCategory(categoryId: string): void {
		const category = this.notificationCategories.find((cat) => cat.id === categoryId);
		if (category) {
			category.settings.forEach((setting) => {
				this.notificationsForm.get(setting.key)?.setValue(true);
			});
		}
	}

	/**
	 * Disable all notifications for a category
	 */
	disableCategory(categoryId: string): void {
		const category = this.notificationCategories.find((cat) => cat.id === categoryId);
		if (category) {
			category.settings.forEach((setting) => {
				this.notificationsForm.get(setting.key)?.setValue(false);
			});
		}
	}

	/**
	 * Check if all settings in a category are enabled
	 */
	isCategoryFullyEnabled(categoryId: string): boolean {
		const category = this.notificationCategories.find((cat) => cat.id === categoryId);
		if (!category) return false;

		return category.settings.every((setting) => this.notificationsForm.get(setting.key)?.value === true);
	}

	/**
	 * Check if any settings in a category are enabled
	 */
	isCategoryPartiallyEnabled(categoryId: string): boolean {
		const category = this.notificationCategories.find((cat) => cat.id === categoryId);
		if (!category) return false;

		return category.settings.some((setting) => this.notificationsForm.get(setting.key)?.value === true);
	}
}
