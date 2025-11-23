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
	 * Get default ZNS light mode colors
	 * @returns Default ZNS light mode color object
	 */
	getDefaultZnsLightColors(): Record<string, string> {
		return {
			primary: "#181818",
			secondary: "#ff5721",
			background: "#ffffff",
			backgroundSecondary: "#f9f9fc",
			text: "#181818",
			textSecondary: "#96939e",
			textMuted: "#73777f",
			header: "#181818",
			headerText: "#ffffff",
			button: "#181818",
			buttonText: "#ffffff",
			buttonHover: "#303030",
			buttonSecondary: "#E9ECEF",
			buttonSecondaryText: "#495057",
			buttonSecondaryHover: "#E9ECEF",
			border: "#e3e3e3",
			borderHover: "#c3c6cf",
			success: "#1ea446",
			successText: "#e7f8ed",
			warning: "#de6800",
			warningText: "#ffeee9",
			error: "#dc362e",
			errorText: "#ffeee9",
			card: "#ffffff",
			cardBorder: "#eeedf1",
			shadow: "rgba(0, 0, 0, 0.1)",
		};
	}

	/**
	 * Get default ZNS dark mode colors
	 * @returns Default ZNS dark mode color object
	 */
	getDefaultZnsDarkColors(): Record<string, string> {
		return {
			primary: "#E8E8E8",
			secondary: "#ff5721",
			background: "#181818",
			backgroundSecondary: "#1F1F1F",
			text: "#E8E8E8",
			textSecondary: "#96939e",
			textMuted: "#73777f",
			header: "#181818",
			headerText: "#E8E8E8",
			button: "#E8E8E8",
			buttonText: "#181818",
			buttonHover: "#CFCFCF",
			buttonSecondary: "#2A2A2A",
			buttonSecondaryText: "#E8E8E8",
			buttonSecondaryHover: "#3A3A3A",
			border: "#3A3A3A",
			borderHover: "#4A4A4A",
			success: "#1ea446",
			successText: "#E8E8E8",
			warning: "#de6800",
			warningText: "#E8E8E8",
			error: "#dc362e",
			errorText: "#E8E8E8",
			card: "#1F1F1F",
			cardBorder: "#3A3A3A",
			shadow: "rgba(0, 0, 0, 0.3)",
		};
	}

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
	 * Now accepts nested structure that matches ThemeSettings interface
	 * @param formData - Form data from theme-styles component (nested structure)
	 * @returns ThemeSettings
	 */
	convertFormToThemeSettings(formData: any): ThemeSettings {
		// Form structure now matches ThemeSettings, so we can return it directly
		// with minimal validation/defaults
		return {
			zns: {
				enabled: formData.zns?.enabled ?? true,
				currentMode: formData.zns?.currentMode ?? "light",
				lightMode: {
					colors: formData.zns?.lightMode?.colors || {},
				},
				darkMode: {
					colors: formData.zns?.darkMode?.colors || {},
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
		const formData = {
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

		return formData;
	}
}
