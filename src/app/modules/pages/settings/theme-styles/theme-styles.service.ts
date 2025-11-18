import { Injectable } from "@angular/core";
import { HttpWrapperService } from "../../../../http-wrapper.service";
import { environment } from "../../../../../environments/environment";
import { ThemeSettings } from "../license/license.class";

export interface ThemeResponse {
	data: ThemeSettings;
}

@Injectable({
	providedIn: "root",
})
export class ThemeStylesService {
	private readonly baseUrl = `${environment.apiUrl}/api/license/theme`;

	constructor(private httpWrapper: HttpWrapperService) {}

	/**
	 * Get user's theme settings
	 * @returns Promise of theme response
	 */
	getThemeSettings(): Promise<ThemeResponse> {
		// Check if license exists before making API call
		if (!this.hasLicense()) {
			return Promise.reject(new Error("License is required to access theme settings"));
		}

		return this.httpWrapper.sendRequest("get", this.baseUrl);
	}

	/**
	 * Check if license exists in localStorage
	 *
	 * @returns boolean
	 */
	private hasLicense(): boolean {
		try {
			const licenseStr = localStorage.getItem("license");
			if (!licenseStr) {
				return false;
			}

			const licenseData = JSON.parse(licenseStr);
			const domainCfg = licenseData?.domainConfig || licenseData;
			const domain = domainCfg?.name || domainCfg?.domain || licenseData?.domain;

			return !!(domain && domain.trim() !== "");
		} catch (error) {
			return false;
		}
	}

	/**
	 * Update user's theme settings
	 * @param themeSettings - Theme settings to update
	 * @returns Promise of theme response
	 */
	updateThemeSettings(themeSettings: ThemeSettings): Promise<ThemeResponse> {
		return this.httpWrapper.sendRequest("post", this.baseUrl, themeSettings);
	}

	/**
	 * Validate color format
	 * @param color - Color value to validate
	 * @returns boolean
	 */
	validateColor(color: string): boolean {
		// Hex color validation
		const hexPattern = /^#[0-9A-Fa-f]{6}$/;
		// RGBA color validation
		const rgbaPattern = /^rgba\(\d+,\s*\d+,\s*\d+,\s*[0-1]?\.?\d+\)$/;

		return hexPattern.test(color) || rgbaPattern.test(color);
	}

	/**
	 * Convert form data to theme settings format
	 * @param formData - Form data from theme-styles component
	 * @returns ThemeSettings
	 */
	convertFormToThemeSettings(formData: any): ThemeSettings {
		return {
			zns: {
				enabled: formData.znsEnabled ?? true,
				currentMode: formData.znsCurrentMode ?? "light",
				lightMode: {
					colors: {
						primary: formData.znsLightPrimary ?? "#007BFF",
						secondary: formData.znsLightSecondary ?? "#1A1A2E",
						background: formData.znsLightBackground ?? "#FFFFFF",
						backgroundSecondary: formData.znsLightBackgroundSecondary ?? "#F8F9FA",
						text: formData.znsLightText ?? "#000000",
						textSecondary: formData.znsLightTextSecondary ?? "#333333",
						textMuted: formData.znsLightTextMuted ?? "#6C757D",
						header: formData.znsLightHeader ?? "#1A1A2E",
						headerText: formData.znsLightHeaderText ?? "#FFFFFF",
						button: formData.znsLightButton ?? "#007BFF",
						buttonText: formData.znsLightButtonText ?? "#FFFFFF",
						buttonHover: formData.znsLightButtonHover ?? "#0056B3",
						buttonSecondary: formData.znsLightButtonSecondary ?? "#E9ECEF",
						buttonSecondaryText: formData.znsLightButtonSecondaryText ?? "#495057",
						border: formData.znsLightBorder ?? "#E9ECEF",
						borderHover: formData.znsLightBorderHover ?? "#DEE2E6",
						success: formData.znsLightSuccess ?? "#28A745",
						successText: formData.znsLightSuccessText ?? "#FFFFFF",
						warning: formData.znsLightWarning ?? "#FF6B35",
						warningText: formData.znsLightWarningText ?? "#FFFFFF",
						error: formData.znsLightError ?? "#DC3545",
						errorText: formData.znsLightErrorText ?? "#FFFFFF",
						card: formData.znsLightCard ?? "#FFFFFF",
						cardBorder: formData.znsLightCardBorder ?? "#E9ECEF",
						shadow: formData.znsLightShadow ?? "rgba(0, 0, 0, 0.1)",
					},
				},
				darkMode: {
					colors: {
						primary: formData.znsDarkPrimary ?? "#4DABF7",
						secondary: formData.znsDarkSecondary ?? "#3A3A5A",
						background: formData.znsDarkBackground ?? "#121212",
						backgroundSecondary: formData.znsDarkBackgroundSecondary ?? "#1E1E1E",
						text: formData.znsDarkText ?? "#E0E0E0",
						textSecondary: formData.znsDarkTextSecondary ?? "#B0B0B0",
						textMuted: formData.znsDarkTextMuted ?? "#808080",
						header: formData.znsDarkHeader ?? "#3A3A5A",
						headerText: formData.znsDarkHeaderText ?? "#E0E0E0",
						button: formData.znsDarkButton ?? "#4DABF7",
						buttonText: formData.znsDarkButtonText ?? "#121212",
						buttonHover: formData.znsDarkButtonHover ?? "#007BFF",
						buttonSecondary: formData.znsDarkButtonSecondary ?? "#343434",
						buttonSecondaryText: formData.znsDarkButtonSecondaryText ?? "#E0E0E0",
						border: formData.znsDarkBorder ?? "#343434",
						borderHover: formData.znsDarkBorderHover ?? "#495057",
						success: formData.znsDarkSuccess ?? "#4CAF50",
						successText: formData.znsDarkSuccessText ?? "#121212",
						warning: formData.znsDarkWarning ?? "#FF8C42",
						warningText: formData.znsDarkWarningText ?? "#121212",
						error: formData.znsDarkError ?? "#F44336",
						errorText: formData.znsDarkErrorText ?? "#121212",
						card: formData.znsDarkCard ?? "#1E1E1E",
						cardBorder: formData.znsDarkCardBorder ?? "#343434",
						shadow: formData.znsDarkShadow ?? "rgba(0, 0, 0, 0.3)",
					},
				},
			},
			zelfkeys: {
				enabled: formData.zelfkeysEnabled ?? true,
				currentMode: formData.zelfkeysCurrentMode ?? "light",
				lightMode: {
					colors: {
						primary: formData.zelfkeysLightPrimary ?? "#007BFF",
						secondary: formData.zelfkeysLightSecondary ?? "#1A1A2E",
						background: formData.zelfkeysLightBackground ?? "#FFFFFF",
						backgroundSecondary: formData.zelfkeysLightBackgroundSecondary ?? "#F8F9FA",
						text: formData.zelfkeysLightText ?? "#000000",
						textSecondary: formData.zelfkeysLightTextSecondary ?? "#333333",
						textMuted: formData.zelfkeysLightTextMuted ?? "#6C757D",
						header: formData.zelfkeysLightHeader ?? "#1A1A2E",
						headerText: formData.zelfkeysLightHeaderText ?? "#FFFFFF",
						button: formData.zelfkeysLightButton ?? "#007BFF",
						buttonText: formData.zelfkeysLightButtonText ?? "#FFFFFF",
						buttonHover: formData.zelfkeysLightButtonHover ?? "#0056B3",
						buttonSecondary: formData.zelfkeysLightButtonSecondary ?? "#E9ECEF",
						buttonSecondaryText: formData.zelfkeysLightButtonSecondaryText ?? "#495057",
						border: formData.zelfkeysLightBorder ?? "#E9ECEF",
						borderHover: formData.zelfkeysLightBorderHover ?? "#DEE2E6",
						success: formData.zelfkeysLightSuccess ?? "#28A745",
						successText: formData.zelfkeysLightSuccessText ?? "#FFFFFF",
						warning: formData.zelfkeysLightWarning ?? "#FF6B35",
						warningText: formData.zelfkeysLightWarningText ?? "#FFFFFF",
						error: formData.zelfkeysLightError ?? "#DC3545",
						errorText: formData.zelfkeysLightErrorText ?? "#FFFFFF",
						card: formData.zelfkeysLightCard ?? "#FFFFFF",
						cardBorder: formData.zelfkeysLightCardBorder ?? "#E9ECEF",
						shadow: formData.zelfkeysLightShadow ?? "rgba(0, 0, 0, 0.1)",
					},
				},
				darkMode: {
					colors: {
						primary: formData.zelfkeysDarkPrimary ?? "#4DABF7",
						secondary: formData.zelfkeysDarkSecondary ?? "#3A3A5A",
						background: formData.zelfkeysDarkBackground ?? "#121212",
						backgroundSecondary: formData.zelfkeysDarkBackgroundSecondary ?? "#1E1E1E",
						text: formData.zelfkeysDarkText ?? "#E0E0E0",
						textSecondary: formData.zelfkeysDarkTextSecondary ?? "#B0B0B0",
						textMuted: formData.zelfkeysDarkTextMuted ?? "#808080",
						header: formData.zelfkeysDarkHeader ?? "#3A3A5A",
						headerText: formData.zelfkeysDarkHeaderText ?? "#E0E0E0",
						button: formData.zelfkeysDarkButton ?? "#4DABF7",
						buttonText: formData.zelfkeysDarkButtonText ?? "#121212",
						buttonHover: formData.zelfkeysDarkButtonHover ?? "#007BFF",
						buttonSecondary: formData.zelfkeysDarkButtonSecondary ?? "#343434",
						buttonSecondaryText: formData.zelfkeysDarkButtonSecondaryText ?? "#E0E0E0",
						border: formData.zelfkeysDarkBorder ?? "#343434",
						borderHover: formData.zelfkeysDarkBorderHover ?? "#495057",
						success: formData.zelfkeysDarkSuccess ?? "#4CAF50",
						successText: formData.zelfkeysDarkSuccessText ?? "#121212",
						warning: formData.zelfkeysDarkWarning ?? "#FF8C42",
						warningText: formData.zelfkeysDarkWarningText ?? "#121212",
						error: formData.zelfkeysDarkError ?? "#F44336",
						errorText: formData.zelfkeysDarkErrorText ?? "#121212",
						card: formData.zelfkeysDarkCard ?? "#1E1E1E",
						cardBorder: formData.zelfkeysDarkCardBorder ?? "#343434",
						shadow: formData.zelfkeysDarkShadow ?? "rgba(0, 0, 0, 0.3)",
					},
				},
			},
		};
	}

	/**
	 * Convert theme settings to form data format
	 * @param themeSettings - Theme settings from API
	 * @returns Form data object
	 */
	convertThemeSettingsToForm(themeSettings: ThemeSettings): any {
		// Guard against empty or partial objects coming from API
		const zns = {
			enabled: themeSettings?.zns?.enabled ?? true,
			currentMode: themeSettings?.zns?.currentMode ?? "light",
			lightMode: {
				colors: {
					primary: themeSettings?.zns?.lightMode?.colors?.primary ?? "#3B82F6",
					secondary: themeSettings?.zns?.lightMode?.colors?.secondary ?? "#64748B",
					background: themeSettings?.zns?.lightMode?.colors?.background ?? "#FFFFFF",
					backgroundSecondary: themeSettings?.zns?.lightMode?.colors?.backgroundSecondary ?? "#F8FAFC",
					text: themeSettings?.zns?.lightMode?.colors?.text ?? "#1E293B",
					textSecondary: themeSettings?.zns?.lightMode?.colors?.textSecondary ?? "#64748B",
					textMuted: themeSettings?.zns?.lightMode?.colors?.textMuted ?? "#94A3B8",
					header: themeSettings?.zns?.lightMode?.colors?.header ?? "#1E293B",
					headerText: themeSettings?.zns?.lightMode?.colors?.headerText ?? "#FFFFFF",
					button: themeSettings?.zns?.lightMode?.colors?.button ?? "#3B82F6",
					buttonText: themeSettings?.zns?.lightMode?.colors?.buttonText ?? "#FFFFFF",
					buttonHover: themeSettings?.zns?.lightMode?.colors?.buttonHover ?? "#2563EB",
					buttonSecondary: themeSettings?.zns?.lightMode?.colors?.buttonSecondary ?? "#E2E8F0",
					buttonSecondaryText: themeSettings?.zns?.lightMode?.colors?.buttonSecondaryText ?? "#475569",
					border: themeSettings?.zns?.lightMode?.colors?.border ?? "#E2E8F0",
					borderHover: themeSettings?.zns?.lightMode?.colors?.borderHover ?? "#CBD5E1",
					success: themeSettings?.zns?.lightMode?.colors?.success ?? "#10B981",
					successText: themeSettings?.zns?.lightMode?.colors?.successText ?? "#FFFFFF",
					warning: themeSettings?.zns?.lightMode?.colors?.warning ?? "#F59E0B",
					warningText: themeSettings?.zns?.lightMode?.colors?.warningText ?? "#FFFFFF",
					error: themeSettings?.zns?.lightMode?.colors?.error ?? "#EF4444",
					errorText: themeSettings?.zns?.lightMode?.colors?.errorText ?? "#FFFFFF",
					card: themeSettings?.zns?.lightMode?.colors?.card ?? "#FFFFFF",
					cardBorder: themeSettings?.zns?.lightMode?.colors?.cardBorder ?? "#E2E8F0",
					shadow: themeSettings?.zns?.lightMode?.colors?.shadow ?? "rgba(0, 0, 0, 0.1)",
				},
			},
			darkMode: {
				colors: {
					primary: themeSettings?.zns?.darkMode?.colors?.primary ?? "#60A5FA",
					secondary: themeSettings?.zns?.darkMode?.colors?.secondary ?? "#94A3B8",
					background: themeSettings?.zns?.darkMode?.colors?.background ?? "#0F172A",
					backgroundSecondary: themeSettings?.zns?.darkMode?.colors?.backgroundSecondary ?? "#1E293B",
					text: themeSettings?.zns?.darkMode?.colors?.text ?? "#F1F5F9",
					textSecondary: themeSettings?.zns?.darkMode?.colors?.textSecondary ?? "#94A3B8",
					textMuted: themeSettings?.zns?.darkMode?.colors?.textMuted ?? "#64748B",
					header: themeSettings?.zns?.darkMode?.colors?.header ?? "#1E293B",
					headerText: themeSettings?.zns?.darkMode?.colors?.headerText ?? "#F1F5F9",
					button: themeSettings?.zns?.darkMode?.colors?.button ?? "#60A5FA",
					buttonText: themeSettings?.zns?.darkMode?.colors?.buttonText ?? "#0F172A",
					buttonHover: themeSettings?.zns?.darkMode?.colors?.buttonHover ?? "#3B82F6",
					buttonSecondary: themeSettings?.zns?.darkMode?.colors?.buttonSecondary ?? "#334155",
					buttonSecondaryText: themeSettings?.zns?.darkMode?.colors?.buttonSecondaryText ?? "#F1F5F9",
					border: themeSettings?.zns?.darkMode?.colors?.border ?? "#334155",
					borderHover: themeSettings?.zns?.darkMode?.colors?.borderHover ?? "#475569",
					success: themeSettings?.zns?.darkMode?.colors?.success ?? "#34D399",
					successText: themeSettings?.zns?.darkMode?.colors?.successText ?? "#0F172A",
					warning: themeSettings?.zns?.darkMode?.colors?.warning ?? "#FBBF24",
					warningText: themeSettings?.zns?.darkMode?.colors?.warningText ?? "#0F172A",
					error: themeSettings?.zns?.darkMode?.colors?.error ?? "#F87171",
					errorText: themeSettings?.zns?.darkMode?.colors?.errorText ?? "#0F172A",
					card: themeSettings?.zns?.darkMode?.colors?.card ?? "#1E293B",
					cardBorder: themeSettings?.zns?.darkMode?.colors?.cardBorder ?? "#334155",
					shadow: themeSettings?.zns?.darkMode?.colors?.shadow ?? "rgba(0, 0, 0, 0.3)",
				},
			},
		};

		const zelfkeys = {
			enabled: themeSettings?.zelfkeys?.enabled ?? true,
			currentMode: themeSettings?.zelfkeys?.currentMode ?? "light",
			lightMode: {
				colors: {
					primary: themeSettings?.zelfkeys?.lightMode?.colors?.primary ?? "#8B5CF6",
					secondary: themeSettings?.zelfkeys?.lightMode?.colors?.secondary ?? "#64748B",
					background: themeSettings?.zelfkeys?.lightMode?.colors?.background ?? "#FFFFFF",
					backgroundSecondary: themeSettings?.zelfkeys?.lightMode?.colors?.backgroundSecondary ?? "#F8FAFC",
					text: themeSettings?.zelfkeys?.lightMode?.colors?.text ?? "#1E293B",
					textSecondary: themeSettings?.zelfkeys?.lightMode?.colors?.textSecondary ?? "#64748B",
					textMuted: themeSettings?.zelfkeys?.lightMode?.colors?.textMuted ?? "#94A3B8",
					header: themeSettings?.zelfkeys?.lightMode?.colors?.header ?? "#1E293B",
					headerText: themeSettings?.zelfkeys?.lightMode?.colors?.headerText ?? "#FFFFFF",
					button: themeSettings?.zelfkeys?.lightMode?.colors?.button ?? "#8B5CF6",
					buttonText: themeSettings?.zelfkeys?.lightMode?.colors?.buttonText ?? "#FFFFFF",
					buttonHover: themeSettings?.zelfkeys?.lightMode?.colors?.buttonHover ?? "#7C3AED",
					buttonSecondary: themeSettings?.zelfkeys?.lightMode?.colors?.buttonSecondary ?? "#E2E8F0",
					buttonSecondaryText: themeSettings?.zelfkeys?.lightMode?.colors?.buttonSecondaryText ?? "#475569",
					border: themeSettings?.zelfkeys?.lightMode?.colors?.border ?? "#E2E8F0",
					borderHover: themeSettings?.zelfkeys?.lightMode?.colors?.borderHover ?? "#CBD5E1",
					success: themeSettings?.zelfkeys?.lightMode?.colors?.success ?? "#10B981",
					successText: themeSettings?.zelfkeys?.lightMode?.colors?.successText ?? "#FFFFFF",
					warning: themeSettings?.zelfkeys?.lightMode?.colors?.warning ?? "#F59E0B",
					warningText: themeSettings?.zelfkeys?.lightMode?.colors?.warningText ?? "#FFFFFF",
					error: themeSettings?.zelfkeys?.lightMode?.colors?.error ?? "#EF4444",
					errorText: themeSettings?.zelfkeys?.lightMode?.colors?.errorText ?? "#FFFFFF",
					card: themeSettings?.zelfkeys?.lightMode?.colors?.card ?? "#FFFFFF",
					cardBorder: themeSettings?.zelfkeys?.lightMode?.colors?.cardBorder ?? "#E2E8F0",
					shadow: themeSettings?.zelfkeys?.lightMode?.colors?.shadow ?? "rgba(0, 0, 0, 0.1)",
				},
			},
			darkMode: {
				colors: {
					primary: themeSettings?.zelfkeys?.darkMode?.colors?.primary ?? "#A78BFA",
					secondary: themeSettings?.zelfkeys?.darkMode?.colors?.secondary ?? "#94A3B8",
					background: themeSettings?.zelfkeys?.darkMode?.colors?.background ?? "#0F172A",
					backgroundSecondary: themeSettings?.zelfkeys?.darkMode?.colors?.backgroundSecondary ?? "#1E293B",
					text: themeSettings?.zelfkeys?.darkMode?.colors?.text ?? "#F1F5F9",
					textSecondary: themeSettings?.zelfkeys?.darkMode?.colors?.textSecondary ?? "#94A3B8",
					textMuted: themeSettings?.zelfkeys?.darkMode?.colors?.textMuted ?? "#64748B",
					header: themeSettings?.zelfkeys?.darkMode?.colors?.header ?? "#1E293B",
					headerText: themeSettings?.zelfkeys?.darkMode?.colors?.headerText ?? "#F1F5F9",
					button: themeSettings?.zelfkeys?.darkMode?.colors?.button ?? "#A78BFA",
					buttonText: themeSettings?.zelfkeys?.darkMode?.colors?.buttonText ?? "#0F172A",
					buttonHover: themeSettings?.zelfkeys?.darkMode?.colors?.buttonHover ?? "#8B5CF6",
					buttonSecondary: themeSettings?.zelfkeys?.darkMode?.colors?.buttonSecondary ?? "#334155",
					buttonSecondaryText: themeSettings?.zelfkeys?.darkMode?.colors?.buttonSecondaryText ?? "#F1F5F9",
					border: themeSettings?.zelfkeys?.darkMode?.colors?.border ?? "#334155",
					borderHover: themeSettings?.zelfkeys?.darkMode?.colors?.borderHover ?? "#475569",
					success: themeSettings?.zelfkeys?.darkMode?.colors?.success ?? "#34D399",
					successText: themeSettings?.zelfkeys?.darkMode?.colors?.successText ?? "#0F172A",
					warning: themeSettings?.zelfkeys?.darkMode?.colors?.warning ?? "#FBBF24",
					warningText: themeSettings?.zelfkeys?.darkMode?.colors?.warningText ?? "#0F172A",
					error: themeSettings?.zelfkeys?.darkMode?.colors?.error ?? "#F87171",
					errorText: themeSettings?.zelfkeys?.darkMode?.colors?.errorText ?? "#0F172A",
					card: themeSettings?.zelfkeys?.darkMode?.colors?.card ?? "#1E293B",
					cardBorder: themeSettings?.zelfkeys?.darkMode?.colors?.cardBorder ?? "#334155",
					shadow: themeSettings?.zelfkeys?.darkMode?.colors?.shadow ?? "rgba(0, 0, 0, 0.3)",
				},
			},
		};

		const formData = {
			// ZNS Settings
			znsEnabled: zns.enabled,
			znsCurrentMode: zns.currentMode,

			// ZNS Light Mode Colors
			znsLightPrimary: zns.lightMode.colors.primary,
			znsLightSecondary: zns.lightMode.colors.secondary,
			znsLightBackground: zns.lightMode.colors.background,
			znsLightBackgroundSecondary: zns.lightMode.colors.backgroundSecondary,
			znsLightText: zns.lightMode.colors.text,
			znsLightTextSecondary: zns.lightMode.colors.textSecondary,
			znsLightTextMuted: zns.lightMode.colors.textMuted,
			znsLightHeader: zns.lightMode.colors.header,
			znsLightHeaderText: zns.lightMode.colors.headerText,
			znsLightButton: zns.lightMode.colors.button,
			znsLightButtonText: zns.lightMode.colors.buttonText,
			znsLightButtonHover: zns.lightMode.colors.buttonHover,
			znsLightButtonSecondary: zns.lightMode.colors.buttonSecondary,
			znsLightButtonSecondaryText: zns.lightMode.colors.buttonSecondaryText,
			znsLightBorder: zns.lightMode.colors.border,
			znsLightBorderHover: zns.lightMode.colors.borderHover,
			znsLightSuccess: zns.lightMode.colors.success,
			znsLightSuccessText: zns.lightMode.colors.successText,
			znsLightWarning: zns.lightMode.colors.warning,
			znsLightWarningText: zns.lightMode.colors.warningText,
			znsLightError: zns.lightMode.colors.error,
			znsLightErrorText: zns.lightMode.colors.errorText,
			znsLightCard: zns.lightMode.colors.card,
			znsLightCardBorder: zns.lightMode.colors.cardBorder,
			znsLightShadow: zns.lightMode.colors.shadow,

			// ZNS Dark Mode Colors
			znsDarkPrimary: zns.darkMode.colors.primary,
			znsDarkSecondary: zns.darkMode.colors.secondary,
			znsDarkBackground: zns.darkMode.colors.background,
			znsDarkBackgroundSecondary: zns.darkMode.colors.backgroundSecondary,
			znsDarkText: zns.darkMode.colors.text,
			znsDarkTextSecondary: zns.darkMode.colors.textSecondary,
			znsDarkTextMuted: zns.darkMode.colors.textMuted,
			znsDarkHeader: zns.darkMode.colors.header,
			znsDarkHeaderText: zns.darkMode.colors.headerText,
			znsDarkButton: zns.darkMode.colors.button,
			znsDarkButtonText: zns.darkMode.colors.buttonText,
			znsDarkButtonHover: zns.darkMode.colors.buttonHover,
			znsDarkButtonSecondary: zns.darkMode.colors.buttonSecondary,
			znsDarkButtonSecondaryText: zns.darkMode.colors.buttonSecondaryText,
			znsDarkBorder: zns.darkMode.colors.border,
			znsDarkBorderHover: zns.darkMode.colors.borderHover,
			znsDarkSuccess: zns.darkMode.colors.success,
			znsDarkSuccessText: zns.darkMode.colors.successText,
			znsDarkWarning: zns.darkMode.colors.warning,
			znsDarkWarningText: zns.darkMode.colors.warningText,
			znsDarkError: zns.darkMode.colors.error,
			znsDarkErrorText: zns.darkMode.colors.errorText,
			znsDarkCard: zns.darkMode.colors.card,
			znsDarkCardBorder: zns.darkMode.colors.cardBorder,
			znsDarkShadow: zns.darkMode.colors.shadow,

			// ZelfKeys Settings
			zelfkeysEnabled: zelfkeys.enabled,
			zelfkeysCurrentMode: zelfkeys.currentMode,

			// ZelfKeys Light Mode Colors
			zelfkeysLightPrimary: zelfkeys.lightMode.colors.primary,
			zelfkeysLightSecondary: zelfkeys.lightMode.colors.secondary,
			zelfkeysLightBackground: zelfkeys.lightMode.colors.background,
			zelfkeysLightBackgroundSecondary: zelfkeys.lightMode.colors.backgroundSecondary,
			zelfkeysLightText: zelfkeys.lightMode.colors.text,
			zelfkeysLightTextSecondary: zelfkeys.lightMode.colors.textSecondary,
			zelfkeysLightTextMuted: zelfkeys.lightMode.colors.textMuted,
			zelfkeysLightHeader: zelfkeys.lightMode.colors.header,
			zelfkeysLightHeaderText: zelfkeys.lightMode.colors.headerText,
			zelfkeysLightButton: zelfkeys.lightMode.colors.button,
			zelfkeysLightButtonText: zelfkeys.lightMode.colors.buttonText,
			zelfkeysLightButtonHover: zelfkeys.lightMode.colors.buttonHover,
			zelfkeysLightButtonSecondary: zelfkeys.lightMode.colors.buttonSecondary,
			zelfkeysLightButtonSecondaryText: zelfkeys.lightMode.colors.buttonSecondaryText,
			zelfkeysLightBorder: zelfkeys.lightMode.colors.border,
			zelfkeysLightBorderHover: zelfkeys.lightMode.colors.borderHover,
			zelfkeysLightSuccess: zelfkeys.lightMode.colors.success,
			zelfkeysLightSuccessText: zelfkeys.lightMode.colors.successText,
			zelfkeysLightWarning: zelfkeys.lightMode.colors.warning,
			zelfkeysLightWarningText: zelfkeys.lightMode.colors.warningText,
			zelfkeysLightError: zelfkeys.lightMode.colors.error,
			zelfkeysLightErrorText: zelfkeys.lightMode.colors.errorText,
			zelfkeysLightCard: zelfkeys.lightMode.colors.card,
			zelfkeysLightCardBorder: zelfkeys.lightMode.colors.cardBorder,
			zelfkeysLightShadow: zelfkeys.lightMode.colors.shadow,

			// ZelfKeys Dark Mode Colors
			zelfkeysDarkPrimary: zelfkeys.darkMode.colors.primary,
			zelfkeysDarkSecondary: zelfkeys.darkMode.colors.secondary,
			zelfkeysDarkBackground: zelfkeys.darkMode.colors.background,
			zelfkeysDarkBackgroundSecondary: zelfkeys.darkMode.colors.backgroundSecondary,
			zelfkeysDarkText: zelfkeys.darkMode.colors.text,
			zelfkeysDarkTextSecondary: zelfkeys.darkMode.colors.textSecondary,
			zelfkeysDarkTextMuted: zelfkeys.darkMode.colors.textMuted,
			zelfkeysDarkHeader: zelfkeys.darkMode.colors.header,
			zelfkeysDarkHeaderText: zelfkeys.darkMode.colors.headerText,
			zelfkeysDarkButton: zelfkeys.darkMode.colors.button,
			zelfkeysDarkButtonText: zelfkeys.darkMode.colors.buttonText,
			zelfkeysDarkButtonHover: zelfkeys.darkMode.colors.buttonHover,
			zelfkeysDarkButtonSecondary: zelfkeys.darkMode.colors.buttonSecondary,
			zelfkeysDarkButtonSecondaryText: zelfkeys.darkMode.colors.buttonSecondaryText,
			zelfkeysDarkBorder: zelfkeys.darkMode.colors.border,
			zelfkeysDarkBorderHover: zelfkeys.darkMode.colors.borderHover,
			zelfkeysDarkSuccess: zelfkeys.darkMode.colors.success,
			zelfkeysDarkSuccessText: zelfkeys.darkMode.colors.successText,
			zelfkeysDarkWarning: zelfkeys.darkMode.colors.warning,
			zelfkeysDarkWarningText: zelfkeys.darkMode.colors.warningText,
			zelfkeysDarkError: zelfkeys.darkMode.colors.error,
			zelfkeysDarkErrorText: zelfkeys.darkMode.colors.errorText,
			zelfkeysDarkCard: zelfkeys.darkMode.colors.card,
			zelfkeysDarkCardBorder: zelfkeys.darkMode.colors.cardBorder,
			zelfkeysDarkShadow: zelfkeys.darkMode.colors.shadow,
		};

		return formData;
	}
}
