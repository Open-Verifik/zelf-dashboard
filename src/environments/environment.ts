export const environment = {
	production: false,
	includeNonPaidDomains: true,
	apiUrl: "http://localhost:3050",
	appName: "Zelf Dashboard",
	version: "1.0.0",
	debug: true,
	// Root redirect behavior for hosting variations
	rootRedirect: {
		enabled: true,
		host: "payment.zelf.world", // When window.location.host matches this, redirect root to `path`
		path: "/portfolio/payment",
		fallbackPath: "/analytics",
	},
	// Development specific settings
	enableLogging: true,
	enableMockData: true,
	// Force TypeScript refresh
	// API endpoints
	endpoints: {
		auth: {
			signUp: "/api/clients",
			signIn: "/api/clients/auth",
			verifyClientExists: "/api/clients",
			unlockSession: "/auth/unlock-session",
			signOut: "/auth/sign-out",
			signInWithToken: "/auth/sign-in-with-token",
		},
		user: {
			profile: "/user/profile",
			settings: "/user/settings",
		},
		biometric: {
			verify: "/biometric/verify",
			enroll: "/biometric/enroll",
		},
		license: {
			create: "/api/license",
			search: "/api/license",
			delete: "/api/license",
			myLicense: "/api/license/my-license",
		},
		security: {
			changePassword: "/api/clients/sync/password",
			loadApiKey: "/api/clients/auth",
		},
		client: {
			update: "/api/clients/sync",
		},
		subscriptionPlans: {
			list: "/api/subscription-plans",
			getById: "/api/subscription-plans",
			subscribe: "/api/subscription-plans/subscribe",
			mySubscription: "/api/subscription-plans/my-subscription",
			createPortalSession: "/api/subscription-plans/create-portal-session",
			cancelSubscription: "/api/subscription-plans/cancel-subscription",
			upgradeSubscription: "/api/subscription-plans/upgrade-subscription",
		},
	},
	// Feature flags
	features: {
		biometricVerification: true,
		analytics: true,
		notifications: true,
		darkMode: true,
	},
	// External services
	services: {
		faceApi: {
			modelsPath: "/assets/models",
			confidence: 0.6,
		},
	},
};
