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
		return this.httpWrapper.sendRequest("get", this.baseUrl);
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
				enabled: formData.znsEnabled || true,
				currentMode: formData.znsCurrentMode || "light",
				lightMode: {
					colors: {
						primary: formData.znsLightPrimary || "#3B82F6",
						secondary: formData.znsLightSecondary || "#64748B",
						background: formData.znsLightBackground || "#FFFFFF",
						backgroundSecondary: formData.znsLightBackgroundSecondary || "#F8FAFC",
						text: formData.znsLightText || "#1E293B",
						textSecondary: formData.znsLightTextSecondary || "#64748B",
						textMuted: formData.znsLightTextMuted || "#94A3B8",
						header: formData.znsLightHeader || "#1E293B",
						headerText: formData.znsLightHeaderText || "#FFFFFF",
						button: formData.znsLightButton || "#3B82F6",
						buttonText: formData.znsLightButtonText || "#FFFFFF",
						buttonHover: formData.znsLightButtonHover || "#2563EB",
						buttonSecondary: formData.znsLightButtonSecondary || "#E2E8F0",
						buttonSecondaryText: formData.znsLightButtonSecondaryText || "#475569",
						border: formData.znsLightBorder || "#E2E8F0",
						borderHover: formData.znsLightBorderHover || "#CBD5E1",
						success: formData.znsLightSuccess || "#10B981",
						successText: formData.znsLightSuccessText || "#FFFFFF",
						warning: formData.znsLightWarning || "#F59E0B",
						warningText: formData.znsLightWarningText || "#FFFFFF",
						error: formData.znsLightError || "#EF4444",
						errorText: formData.znsLightErrorText || "#FFFFFF",
						card: formData.znsLightCard || "#FFFFFF",
						cardBorder: formData.znsLightCardBorder || "#E2E8F0",
						shadow: formData.znsLightShadow || "rgba(0, 0, 0, 0.1)",
					},
				},
				darkMode: {
					colors: {
						primary: formData.znsDarkPrimary || "#60A5FA",
						secondary: formData.znsDarkSecondary || "#94A3B8",
						background: formData.znsDarkBackground || "#0F172A",
						backgroundSecondary: formData.znsDarkBackgroundSecondary || "#1E293B",
						text: formData.znsDarkText || "#F1F5F9",
						textSecondary: formData.znsDarkTextSecondary || "#94A3B8",
						textMuted: formData.znsDarkTextMuted || "#64748B",
						header: formData.znsDarkHeader || "#1E293B",
						headerText: formData.znsDarkHeaderText || "#F1F5F9",
						button: formData.znsDarkButton || "#60A5FA",
						buttonText: formData.znsDarkButtonText || "#0F172A",
						buttonHover: formData.znsDarkButtonHover || "#3B82F6",
						buttonSecondary: formData.znsDarkButtonSecondary || "#334155",
						buttonSecondaryText: formData.znsDarkButtonSecondaryText || "#F1F5F9",
						border: formData.znsDarkBorder || "#334155",
						borderHover: formData.znsDarkBorderHover || "#475569",
						success: formData.znsDarkSuccess || "#34D399",
						successText: formData.znsDarkSuccessText || "#0F172A",
						warning: formData.znsDarkWarning || "#FBBF24",
						warningText: formData.znsDarkWarningText || "#0F172A",
						error: formData.znsDarkError || "#F87171",
						errorText: formData.znsDarkErrorText || "#0F172A",
						card: formData.znsDarkCard || "#1E293B",
						cardBorder: formData.znsDarkCardBorder || "#334155",
						shadow: formData.znsDarkShadow || "rgba(0, 0, 0, 0.3)",
					},
				},
			},
			zelfkeys: {
				enabled: formData.zelfkeysEnabled || true,
				currentMode: formData.zelfkeysCurrentMode || "light",
				lightMode: {
					colors: {
						primary: formData.zelfkeysLightPrimary || "#8B5CF6",
						secondary: formData.zelfkeysLightSecondary || "#64748B",
						background: formData.zelfkeysLightBackground || "#FFFFFF",
						backgroundSecondary: formData.zelfkeysLightBackgroundSecondary || "#F8FAFC",
						text: formData.zelfkeysLightText || "#1E293B",
						textSecondary: formData.zelfkeysLightTextSecondary || "#64748B",
						textMuted: formData.zelfkeysLightTextMuted || "#94A3B8",
						header: formData.zelfkeysLightHeader || "#1E293B",
						headerText: formData.zelfkeysLightHeaderText || "#FFFFFF",
						button: formData.zelfkeysLightButton || "#8B5CF6",
						buttonText: formData.zelfkeysLightButtonText || "#FFFFFF",
						buttonHover: formData.zelfkeysLightButtonHover || "#7C3AED",
						buttonSecondary: formData.zelfkeysLightButtonSecondary || "#E2E8F0",
						buttonSecondaryText: formData.zelfkeysLightButtonSecondaryText || "#475569",
						border: formData.zelfkeysLightBorder || "#E2E8F0",
						borderHover: formData.zelfkeysLightBorderHover || "#CBD5E1",
						success: formData.zelfkeysLightSuccess || "#10B981",
						successText: formData.zelfkeysLightSuccessText || "#FFFFFF",
						warning: formData.zelfkeysLightWarning || "#F59E0B",
						warningText: formData.zelfkeysLightWarningText || "#FFFFFF",
						error: formData.zelfkeysLightError || "#EF4444",
						errorText: formData.zelfkeysLightErrorText || "#FFFFFF",
						card: formData.zelfkeysLightCard || "#FFFFFF",
						cardBorder: formData.zelfkeysLightCardBorder || "#E2E8F0",
						shadow: formData.zelfkeysLightShadow || "rgba(0, 0, 0, 0.1)",
					},
				},
				darkMode: {
					colors: {
						primary: formData.zelfkeysDarkPrimary || "#A78BFA",
						secondary: formData.zelfkeysDarkSecondary || "#94A3B8",
						background: formData.zelfkeysDarkBackground || "#0F172A",
						backgroundSecondary: formData.zelfkeysDarkBackgroundSecondary || "#1E293B",
						text: formData.zelfkeysDarkText || "#F1F5F9",
						textSecondary: formData.zelfkeysDarkTextSecondary || "#94A3B8",
						textMuted: formData.zelfkeysDarkTextMuted || "#64748B",
						header: formData.zelfkeysDarkHeader || "#1E293B",
						headerText: formData.zelfkeysDarkHeaderText || "#F1F5F9",
						button: formData.zelfkeysDarkButton || "#A78BFA",
						buttonText: formData.zelfkeysDarkButtonText || "#0F172A",
						buttonHover: formData.zelfkeysDarkButtonHover || "#8B5CF6",
						buttonSecondary: formData.zelfkeysDarkButtonSecondary || "#334155",
						buttonSecondaryText: formData.zelfkeysDarkButtonSecondaryText || "#F1F5F9",
						border: formData.zelfkeysDarkBorder || "#334155",
						borderHover: formData.zelfkeysDarkBorderHover || "#475569",
						success: formData.zelfkeysDarkSuccess || "#34D399",
						successText: formData.zelfkeysDarkSuccessText || "#0F172A",
						warning: formData.zelfkeysDarkWarning || "#FBBF24",
						warningText: formData.zelfkeysDarkWarningText || "#0F172A",
						error: formData.zelfkeysDarkError || "#F87171",
						errorText: formData.zelfkeysDarkErrorText || "#0F172A",
						card: formData.zelfkeysDarkCard || "#1E293B",
						cardBorder: formData.zelfkeysDarkCardBorder || "#334155",
						shadow: formData.zelfkeysDarkShadow || "rgba(0, 0, 0, 0.3)",
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
		const formData = {
			// ZNS Settings
			znsEnabled: themeSettings.zns.enabled,
			znsCurrentMode: themeSettings.zns.currentMode,

			// ZNS Light Mode Colors
			znsLightPrimary: themeSettings.zns.lightMode.colors.primary,
			znsLightSecondary: themeSettings.zns.lightMode.colors.secondary,
			znsLightBackground: themeSettings.zns.lightMode.colors.background,
			znsLightBackgroundSecondary: themeSettings.zns.lightMode.colors.backgroundSecondary,
			znsLightText: themeSettings.zns.lightMode.colors.text,
			znsLightTextSecondary: themeSettings.zns.lightMode.colors.textSecondary,
			znsLightTextMuted: themeSettings.zns.lightMode.colors.textMuted,
			znsLightHeader: themeSettings.zns.lightMode.colors.header,
			znsLightHeaderText: themeSettings.zns.lightMode.colors.headerText,
			znsLightButton: themeSettings.zns.lightMode.colors.button,
			znsLightButtonText: themeSettings.zns.lightMode.colors.buttonText,
			znsLightButtonHover: themeSettings.zns.lightMode.colors.buttonHover,
			znsLightButtonSecondary: themeSettings.zns.lightMode.colors.buttonSecondary,
			znsLightButtonSecondaryText: themeSettings.zns.lightMode.colors.buttonSecondaryText,
			znsLightBorder: themeSettings.zns.lightMode.colors.border,
			znsLightBorderHover: themeSettings.zns.lightMode.colors.borderHover,
			znsLightSuccess: themeSettings.zns.lightMode.colors.success,
			znsLightSuccessText: themeSettings.zns.lightMode.colors.successText,
			znsLightWarning: themeSettings.zns.lightMode.colors.warning,
			znsLightWarningText: themeSettings.zns.lightMode.colors.warningText,
			znsLightError: themeSettings.zns.lightMode.colors.error,
			znsLightErrorText: themeSettings.zns.lightMode.colors.errorText,
			znsLightCard: themeSettings.zns.lightMode.colors.card,
			znsLightCardBorder: themeSettings.zns.lightMode.colors.cardBorder,
			znsLightShadow: themeSettings.zns.lightMode.colors.shadow,

			// ZNS Dark Mode Colors
			znsDarkPrimary: themeSettings.zns.darkMode.colors.primary,
			znsDarkSecondary: themeSettings.zns.darkMode.colors.secondary,
			znsDarkBackground: themeSettings.zns.darkMode.colors.background,
			znsDarkBackgroundSecondary: themeSettings.zns.darkMode.colors.backgroundSecondary,
			znsDarkText: themeSettings.zns.darkMode.colors.text,
			znsDarkTextSecondary: themeSettings.zns.darkMode.colors.textSecondary,
			znsDarkTextMuted: themeSettings.zns.darkMode.colors.textMuted,
			znsDarkHeader: themeSettings.zns.darkMode.colors.header,
			znsDarkHeaderText: themeSettings.zns.darkMode.colors.headerText,
			znsDarkButton: themeSettings.zns.darkMode.colors.button,
			znsDarkButtonText: themeSettings.zns.darkMode.colors.buttonText,
			znsDarkButtonHover: themeSettings.zns.darkMode.colors.buttonHover,
			znsDarkButtonSecondary: themeSettings.zns.darkMode.colors.buttonSecondary,
			znsDarkButtonSecondaryText: themeSettings.zns.darkMode.colors.buttonSecondaryText,
			znsDarkBorder: themeSettings.zns.darkMode.colors.border,
			znsDarkBorderHover: themeSettings.zns.darkMode.colors.borderHover,
			znsDarkSuccess: themeSettings.zns.darkMode.colors.success,
			znsDarkSuccessText: themeSettings.zns.darkMode.colors.successText,
			znsDarkWarning: themeSettings.zns.darkMode.colors.warning,
			znsDarkWarningText: themeSettings.zns.darkMode.colors.warningText,
			znsDarkError: themeSettings.zns.darkMode.colors.error,
			znsDarkErrorText: themeSettings.zns.darkMode.colors.errorText,
			znsDarkCard: themeSettings.zns.darkMode.colors.card,
			znsDarkCardBorder: themeSettings.zns.darkMode.colors.cardBorder,
			znsDarkShadow: themeSettings.zns.darkMode.colors.shadow,

			// ZelfKeys Settings
			zelfkeysEnabled: themeSettings.zelfkeys.enabled,
			zelfkeysCurrentMode: themeSettings.zelfkeys.currentMode,

			// ZelfKeys Light Mode Colors
			zelfkeysLightPrimary: themeSettings.zelfkeys.lightMode.colors.primary,
			zelfkeysLightSecondary: themeSettings.zelfkeys.lightMode.colors.secondary,
			zelfkeysLightBackground: themeSettings.zelfkeys.lightMode.colors.background,
			zelfkeysLightBackgroundSecondary: themeSettings.zelfkeys.lightMode.colors.backgroundSecondary,
			zelfkeysLightText: themeSettings.zelfkeys.lightMode.colors.text,
			zelfkeysLightTextSecondary: themeSettings.zelfkeys.lightMode.colors.textSecondary,
			zelfkeysLightTextMuted: themeSettings.zelfkeys.lightMode.colors.textMuted,
			zelfkeysLightHeader: themeSettings.zelfkeys.lightMode.colors.header,
			zelfkeysLightHeaderText: themeSettings.zelfkeys.lightMode.colors.headerText,
			zelfkeysLightButton: themeSettings.zelfkeys.lightMode.colors.button,
			zelfkeysLightButtonText: themeSettings.zelfkeys.lightMode.colors.buttonText,
			zelfkeysLightButtonHover: themeSettings.zelfkeys.lightMode.colors.buttonHover,
			zelfkeysLightButtonSecondary: themeSettings.zelfkeys.lightMode.colors.buttonSecondary,
			zelfkeysLightButtonSecondaryText: themeSettings.zelfkeys.lightMode.colors.buttonSecondaryText,
			zelfkeysLightBorder: themeSettings.zelfkeys.lightMode.colors.border,
			zelfkeysLightBorderHover: themeSettings.zelfkeys.lightMode.colors.borderHover,
			zelfkeysLightSuccess: themeSettings.zelfkeys.lightMode.colors.success,
			zelfkeysLightSuccessText: themeSettings.zelfkeys.lightMode.colors.successText,
			zelfkeysLightWarning: themeSettings.zelfkeys.lightMode.colors.warning,
			zelfkeysLightWarningText: themeSettings.zelfkeys.lightMode.colors.warningText,
			zelfkeysLightError: themeSettings.zelfkeys.lightMode.colors.error,
			zelfkeysLightErrorText: themeSettings.zelfkeys.lightMode.colors.errorText,
			zelfkeysLightCard: themeSettings.zelfkeys.lightMode.colors.card,
			zelfkeysLightCardBorder: themeSettings.zelfkeys.lightMode.colors.cardBorder,
			zelfkeysLightShadow: themeSettings.zelfkeys.lightMode.colors.shadow,

			// ZelfKeys Dark Mode Colors
			zelfkeysDarkPrimary: themeSettings.zelfkeys.darkMode.colors.primary,
			zelfkeysDarkSecondary: themeSettings.zelfkeys.darkMode.colors.secondary,
			zelfkeysDarkBackground: themeSettings.zelfkeys.darkMode.colors.background,
			zelfkeysDarkBackgroundSecondary: themeSettings.zelfkeys.darkMode.colors.backgroundSecondary,
			zelfkeysDarkText: themeSettings.zelfkeys.darkMode.colors.text,
			zelfkeysDarkTextSecondary: themeSettings.zelfkeys.darkMode.colors.textSecondary,
			zelfkeysDarkTextMuted: themeSettings.zelfkeys.darkMode.colors.textMuted,
			zelfkeysDarkHeader: themeSettings.zelfkeys.darkMode.colors.header,
			zelfkeysDarkHeaderText: themeSettings.zelfkeys.darkMode.colors.headerText,
			zelfkeysDarkButton: themeSettings.zelfkeys.darkMode.colors.button,
			zelfkeysDarkButtonText: themeSettings.zelfkeys.darkMode.colors.buttonText,
			zelfkeysDarkButtonHover: themeSettings.zelfkeys.darkMode.colors.buttonHover,
			zelfkeysDarkButtonSecondary: themeSettings.zelfkeys.darkMode.colors.buttonSecondary,
			zelfkeysDarkButtonSecondaryText: themeSettings.zelfkeys.darkMode.colors.buttonSecondaryText,
			zelfkeysDarkBorder: themeSettings.zelfkeys.darkMode.colors.border,
			zelfkeysDarkBorderHover: themeSettings.zelfkeys.darkMode.colors.borderHover,
			zelfkeysDarkSuccess: themeSettings.zelfkeys.darkMode.colors.success,
			zelfkeysDarkSuccessText: themeSettings.zelfkeys.darkMode.colors.successText,
			zelfkeysDarkWarning: themeSettings.zelfkeys.darkMode.colors.warning,
			zelfkeysDarkWarningText: themeSettings.zelfkeys.darkMode.colors.warningText,
			zelfkeysDarkError: themeSettings.zelfkeys.darkMode.colors.error,
			zelfkeysDarkErrorText: themeSettings.zelfkeys.darkMode.colors.errorText,
			zelfkeysDarkCard: themeSettings.zelfkeys.darkMode.colors.card,
			zelfkeysDarkCardBorder: themeSettings.zelfkeys.darkMode.colors.cardBorder,
			zelfkeysDarkShadow: themeSettings.zelfkeys.darkMode.colors.shadow,
		};

		return formData;
	}
}
