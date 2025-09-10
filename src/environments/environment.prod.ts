export const environment = {
	production: true,
	apiUrl: "https://api.zelf.com/api",
	appName: "Zelf Dashboard",
	version: "1.0.0",
	debug: false,
	// Production specific settings
	enableLogging: false,
	enableMockData: false,
	// API endpoints
	endpoints: {
		auth: {
			signUp: "/auth/sign-up",
			signIn: "/auth/sign-in",
			signOut: "/auth/sign-out",
			forgotPassword: "/auth/forgot-password",
			resetPassword: "/auth/reset-password",
			unlockSession: "/auth/unlock-session",
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
			confidence: 0.7,
		},
	},
};
