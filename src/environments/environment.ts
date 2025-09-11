export const environment = {
	production: false,
	apiUrl: "http://localhost:3003",
	appName: "Zelf Dashboard",
	version: "1.0.0",
	debug: true,
	// Development specific settings
	enableLogging: true,
	enableMockData: true,
	// API endpoints
	endpoints: {
		auth: {
			signUp: "/api/clients",
			signIn: "/api/clients/auth",
			verifyClientExists: "/api/clients",
			unlockSession: "/auth/unlock-session",
			// signInWithToken: "/auth/sign-in-with-token", // Disabled - endpoint doesn't exist
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
