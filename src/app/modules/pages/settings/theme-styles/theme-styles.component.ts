import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatOptionModule } from "@angular/material/core";
import { MatTabsModule } from "@angular/material/tabs";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatDividerModule } from "@angular/material/divider";
import { Router } from "@angular/router";
import { TranslocoService, TranslocoModule } from "@jsverse/transloco";
import { ThemeStylesService } from "./theme-styles.service";
import { ThemeSettings } from "../license/license.class";
import { SaveConfirmationService } from "../../../../core/services/save-confirmation.service";

@Component({
	selector: "settings-theme-styles",
	templateUrl: "./theme-styles.component.html",
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatIconModule,
		MatInputModule,
		MatSelectModule,
		MatOptionModule,
		MatButtonModule,
		MatCardModule,
		MatTabsModule,
		MatSlideToggleModule,
		MatDividerModule,
		TranslocoModule,
	],
})
export class SettingsThemeStylesComponent implements OnInit {
	themeForm: UntypedFormGroup;
	isLoading: boolean = false;
	isLoadingColors: boolean = false;
	showAlert: boolean = false;
	alertMessage: string = "";
	alertType: "success" | "error" = "success";

	// Store the actual API data
	currentThemeSettings: any = null;

	// ZNS Wallet color settings
	znsColors = {
		primary: "#3B82F6",
		secondary: "#64748B",
		background: "#FFFFFF",
		backgroundSecondary: "#F8FAFC",
		text: "#1E293B",
		textSecondary: "#64748B",
		textMuted: "#94A3B8",
		header: "#1E293B",
		headerText: "#FFFFFF",
		button: "#3B82F6",
		buttonText: "#FFFFFF",
		buttonHover: "#2563EB",
		buttonSecondary: "#E2E8F0",
		buttonSecondaryText: "#475569",
		border: "#E2E8F0",
		borderHover: "#CBD5E1",
		success: "#10B981",
		successText: "#FFFFFF",
		warning: "#F59E0B",
		warningText: "#FFFFFF",
		error: "#EF4444",
		errorText: "#FFFFFF",
		card: "#FFFFFF",
		cardBorder: "#E2E8F0",
		shadow: "rgba(0, 0, 0, 0.1)",
	};

	// ZelfKeys color settings
	zelfkeysColors = {
		primary: "#8B5CF6",
		secondary: "#64748B",
		background: "#FFFFFF",
		backgroundSecondary: "#F8FAFC",
		text: "#1E293B",
		textSecondary: "#64748B",
		textMuted: "#94A3B8",
		header: "#1E293B",
		headerText: "#FFFFFF",
		button: "#8B5CF6",
		buttonText: "#FFFFFF",
		buttonHover: "#7C3AED",
		buttonSecondary: "#E2E8F0",
		buttonSecondaryText: "#475569",
		border: "#E2E8F0",
		borderHover: "#CBD5E1",
		success: "#10B981",
		successText: "#FFFFFF",
		warning: "#F59E0B",
		warningText: "#FFFFFF",
		error: "#EF4444",
		errorText: "#FFFFFF",
		card: "#FFFFFF",
		cardBorder: "#E2E8F0",
		shadow: "rgba(0, 0, 0, 0.1)",
	};

	// Dark mode variants
	darkModeZnsColors = {
		primary: "#60A5FA",
		secondary: "#94A3B8",
		background: "#0F172A",
		backgroundSecondary: "#1E293B",
		text: "#F1F5F9",
		textSecondary: "#94A3B8",
		textMuted: "#64748B",
		header: "#1E293B",
		headerText: "#F1F5F9",
		button: "#60A5FA",
		buttonText: "#0F172A",
		buttonHover: "#3B82F6",
		buttonSecondary: "#334155",
		buttonSecondaryText: "#F1F5F9",
		border: "#334155",
		borderHover: "#475569",
		success: "#34D399",
		successText: "#0F172A",
		warning: "#FBBF24",
		warningText: "#0F172A",
		error: "#F87171",
		errorText: "#0F172A",
		card: "#1E293B",
		cardBorder: "#334155",
		shadow: "rgba(0, 0, 0, 0.3)",
	};

	darkModeZelfkeysColors = {
		primary: "#A78BFA",
		secondary: "#94A3B8",
		background: "#0F172A",
		backgroundSecondary: "#1E293B",
		text: "#F1F5F9",
		textSecondary: "#94A3B8",
		textMuted: "#64748B",
		header: "#1E293B",
		headerText: "#F1F5F9",
		button: "#A78BFA",
		buttonText: "#0F172A",
		buttonHover: "#8B5CF6",
		buttonSecondary: "#334155",
		buttonSecondaryText: "#F1F5F9",
		border: "#334155",
		borderHover: "#475569",
		success: "#34D399",
		successText: "#0F172A",
		warning: "#FBBF24",
		warningText: "#0F172A",
		error: "#F87171",
		errorText: "#0F172A",
		card: "#1E293B",
		cardBorder: "#334155",
		shadow: "rgba(0, 0, 0, 0.3)",
	};

	constructor(
		private _formBuilder: UntypedFormBuilder,
		private _translocoService: TranslocoService,
		private _cdr: ChangeDetectorRef,
		private _themeService: ThemeStylesService,
		private _router: Router,
		private _saveConfirmationService: SaveConfirmationService
	) {}

	ngOnInit(): void {
		this.createForm();
		this.loadCurrentThemeSettings();
	}

	/**
	 * Create the theme form
	 */
	private createForm(): void {
		this.themeForm = this._formBuilder.group({
			// ZNS Settings
			znsEnabled: [true],
			znsCurrentMode: ["light"],
			znsDarkMode: [false],

			// ZNS Light Mode Colors
			znsLightPrimary: [this.znsColors.primary],
			znsLightSecondary: [this.znsColors.secondary],
			znsLightBackground: [this.znsColors.background],
			znsLightBackgroundSecondary: [this.znsColors.backgroundSecondary],
			znsLightText: [this.znsColors.text],
			znsLightTextSecondary: [this.znsColors.textSecondary],
			znsLightTextMuted: [this.znsColors.textMuted],
			znsLightHeader: [this.znsColors.header],
			znsLightHeaderText: [this.znsColors.headerText],
			znsLightButton: [this.znsColors.button],
			znsLightButtonText: [this.znsColors.buttonText],
			znsLightButtonHover: [this.znsColors.buttonHover],
			znsLightButtonSecondary: [this.znsColors.buttonSecondary],
			znsLightButtonSecondaryText: [this.znsColors.buttonSecondaryText],
			znsLightBorder: [this.znsColors.border],
			znsLightBorderHover: [this.znsColors.borderHover],
			znsLightSuccess: [this.znsColors.success],
			znsLightSuccessText: [this.znsColors.successText],
			znsLightWarning: [this.znsColors.warning],
			znsLightWarningText: [this.znsColors.warningText],
			znsLightError: [this.znsColors.error],
			znsLightErrorText: [this.znsColors.errorText],
			znsLightCard: [this.znsColors.card],
			znsLightCardBorder: [this.znsColors.cardBorder],
			znsLightShadow: [this.znsColors.shadow],

			// ZNS Dark Mode Colors
			znsDarkPrimary: [this.darkModeZnsColors.primary],
			znsDarkSecondary: [this.darkModeZnsColors.secondary],
			znsDarkBackground: [this.darkModeZnsColors.background],
			znsDarkBackgroundSecondary: [this.darkModeZnsColors.backgroundSecondary],
			znsDarkText: [this.darkModeZnsColors.text],
			znsDarkTextSecondary: [this.darkModeZnsColors.textSecondary],
			znsDarkTextMuted: [this.darkModeZnsColors.textMuted],
			znsDarkHeader: [this.darkModeZnsColors.header],
			znsDarkHeaderText: [this.darkModeZnsColors.headerText],
			znsDarkButton: [this.darkModeZnsColors.button],
			znsDarkButtonText: [this.darkModeZnsColors.buttonText],
			znsDarkButtonHover: [this.darkModeZnsColors.buttonHover],
			znsDarkButtonSecondary: [this.darkModeZnsColors.buttonSecondary],
			znsDarkButtonSecondaryText: [this.darkModeZnsColors.buttonSecondaryText],
			znsDarkBorder: [this.darkModeZnsColors.border],
			znsDarkBorderHover: [this.darkModeZnsColors.borderHover],
			znsDarkSuccess: [this.darkModeZnsColors.success],
			znsDarkSuccessText: [this.darkModeZnsColors.successText],
			znsDarkWarning: [this.darkModeZnsColors.warning],
			znsDarkWarningText: [this.darkModeZnsColors.warningText],
			znsDarkError: [this.darkModeZnsColors.error],
			znsDarkErrorText: [this.darkModeZnsColors.errorText],
			znsDarkCard: [this.darkModeZnsColors.card],
			znsDarkCardBorder: [this.darkModeZnsColors.cardBorder],
			znsDarkShadow: [this.darkModeZnsColors.shadow],

			// ZelfKeys Settings
			zelfkeysEnabled: [true],
			zelfkeysCurrentMode: ["light"],
			zelfkeysDarkMode: [false],

			// ZelfKeys Light Mode Colors
			zelfkeysLightPrimary: [this.zelfkeysColors.primary],
			zelfkeysLightSecondary: [this.zelfkeysColors.secondary],
			zelfkeysLightBackground: [this.zelfkeysColors.background],
			zelfkeysLightBackgroundSecondary: [this.zelfkeysColors.backgroundSecondary],
			zelfkeysLightText: [this.zelfkeysColors.text],
			zelfkeysLightTextSecondary: [this.zelfkeysColors.textSecondary],
			zelfkeysLightTextMuted: [this.zelfkeysColors.textMuted],
			zelfkeysLightHeader: [this.zelfkeysColors.header],
			zelfkeysLightHeaderText: [this.zelfkeysColors.headerText],
			zelfkeysLightButton: [this.zelfkeysColors.button],
			zelfkeysLightButtonText: [this.zelfkeysColors.buttonText],
			zelfkeysLightButtonHover: [this.zelfkeysColors.buttonHover],
			zelfkeysLightButtonSecondary: [this.zelfkeysColors.buttonSecondary],
			zelfkeysLightButtonSecondaryText: [this.zelfkeysColors.buttonSecondaryText],
			zelfkeysLightBorder: [this.zelfkeysColors.border],
			zelfkeysLightBorderHover: [this.zelfkeysColors.borderHover],
			zelfkeysLightSuccess: [this.zelfkeysColors.success],
			zelfkeysLightSuccessText: [this.zelfkeysColors.successText],
			zelfkeysLightWarning: [this.zelfkeysColors.warning],
			zelfkeysLightWarningText: [this.zelfkeysColors.warningText],
			zelfkeysLightError: [this.zelfkeysColors.error],
			zelfkeysLightErrorText: [this.zelfkeysColors.errorText],
			zelfkeysLightCard: [this.zelfkeysColors.card],
			zelfkeysLightCardBorder: [this.zelfkeysColors.cardBorder],
			zelfkeysLightShadow: [this.zelfkeysColors.shadow],

			// ZelfKeys Dark Mode Colors
			zelfkeysDarkPrimary: [this.darkModeZelfkeysColors.primary],
			zelfkeysDarkSecondary: [this.darkModeZelfkeysColors.secondary],
			zelfkeysDarkBackground: [this.darkModeZelfkeysColors.background],
			zelfkeysDarkBackgroundSecondary: [this.darkModeZelfkeysColors.backgroundSecondary],
			zelfkeysDarkText: [this.darkModeZelfkeysColors.text],
			zelfkeysDarkTextSecondary: [this.darkModeZelfkeysColors.textSecondary],
			zelfkeysDarkTextMuted: [this.darkModeZelfkeysColors.textMuted],
			zelfkeysDarkHeader: [this.darkModeZelfkeysColors.header],
			zelfkeysDarkHeaderText: [this.darkModeZelfkeysColors.headerText],
			zelfkeysDarkButton: [this.darkModeZelfkeysColors.button],
			zelfkeysDarkButtonText: [this.darkModeZelfkeysColors.buttonText],
			zelfkeysDarkButtonHover: [this.darkModeZelfkeysColors.buttonHover],
			zelfkeysDarkButtonSecondary: [this.darkModeZelfkeysColors.buttonSecondary],
			zelfkeysDarkButtonSecondaryText: [this.darkModeZelfkeysColors.buttonSecondaryText],
			zelfkeysDarkBorder: [this.darkModeZelfkeysColors.border],
			zelfkeysDarkBorderHover: [this.darkModeZelfkeysColors.borderHover],
			zelfkeysDarkSuccess: [this.darkModeZelfkeysColors.success],
			zelfkeysDarkSuccessText: [this.darkModeZelfkeysColors.successText],
			zelfkeysDarkWarning: [this.darkModeZelfkeysColors.warning],
			zelfkeysDarkWarningText: [this.darkModeZelfkeysColors.warningText],
			zelfkeysDarkError: [this.darkModeZelfkeysColors.error],
			zelfkeysDarkErrorText: [this.darkModeZelfkeysColors.errorText],
			zelfkeysDarkCard: [this.darkModeZelfkeysColors.card],
			zelfkeysDarkCardBorder: [this.darkModeZelfkeysColors.cardBorder],
			zelfkeysDarkShadow: [this.darkModeZelfkeysColors.shadow],
		});
	}

	/**
	 * Load current theme settings from backend API
	 */
	private async loadCurrentThemeSettings(): Promise<void> {
		this.isLoading = true;

		try {
			const response = await this._themeService.getThemeSettings();
			const themeSettings = response.data;

			// Store the actual API data
			this.currentThemeSettings = themeSettings;

			const formData = this._themeService.convertThemeSettingsToForm(themeSettings);

			this.updateFormValues(formData);

			this.isLoading = false;

			this._cdr.detectChanges();
		} catch (error) {
			console.error("Error loading theme settings:", error);
			this.showError(this._translocoService.translate("theme_settings.actions.failed_to_load"));
			this.isLoading = false;
			this._cdr.detectChanges();
		}
	}

	/**
	 * Update form values from API data
	 */
	private updateFormValues(formData: any): void {
		Object.keys(formData).forEach((key) => {
			if (this.themeForm.get(key)) {
				this.themeForm.get(key)?.setValue(formData[key]);
			}
		});

		// Set dark mode toggles based on current mode
		const znsCurrentMode = formData.znsCurrentMode || "light";
		this.themeForm.get("znsDarkMode")?.setValue(znsCurrentMode === "dark");

		const zelfkeysCurrentMode = formData.zelfkeysCurrentMode || "light";
		this.themeForm.get("zelfkeysDarkMode")?.setValue(zelfkeysCurrentMode === "dark");
	}

	/**
	 * Toggle dark mode for ZNS
	 */
	toggleZnsDarkMode(): void {
		const isDarkMode = this.themeForm.get("znsDarkMode")?.value;
		const newMode = isDarkMode ? "dark" : "light";

		this.themeForm.get("znsCurrentMode")?.setValue(newMode);

		// Show loading state
		this.isLoadingColors = true;
		this._cdr.detectChanges();

		// Apply colors after a delay
		setTimeout(() => {
			if (isDarkMode) {
				this.applyZnsDarkMode();
			} else {
				this.applyZnsLightMode();
			}

			// Patch the form with updated values
			this.patchZnsFormValues();

			// Hide loading state
			this.isLoadingColors = false;
			this._cdr.detectChanges();
		}, 1000);
	}

	/**
	 * Toggle dark mode for ZelfKeys
	 */
	toggleZelfkeysDarkMode(): void {
		const isDarkMode = this.themeForm.get("zelfkeysDarkMode")?.value;
		const newMode = isDarkMode ? "dark" : "light";

		this.themeForm.get("zelfkeysCurrentMode")?.setValue(newMode);

		// Show loading state
		this.isLoadingColors = true;
		this._cdr.detectChanges();

		// Apply colors after a delay
		setTimeout(() => {
			if (isDarkMode) {
				this.applyZelfkeysDarkMode();
			} else {
				this.applyZelfkeysLightMode();
			}

			// Patch the form with updated values
			this.patchZelfkeysFormValues();

			// Hide loading state
			this.isLoadingColors = false;
			this._cdr.detectChanges();
		}, 1000);
	}

	/**
	 * Apply ZNS dark mode colors
	 */
	private applyZnsDarkMode(): void {
		Object.keys(this.darkModeZnsColors).forEach((key) => {
			const formKey = `znsDark${key.charAt(0).toUpperCase()}${key.slice(1)}`;
			this.themeForm.get(formKey)?.setValue(this.darkModeZnsColors[key as keyof typeof this.darkModeZnsColors]);
		});

		// Force change detection
		this._cdr.detectChanges();
	}

	/**
	 * Patch ZNS form values to update color pickers and inputs
	 */
	private patchZnsFormValues(): void {
		const currentMode = this.themeForm.get("znsCurrentMode")?.value;
		const isDarkMode = currentMode === "dark";

		// Use actual API data if available, otherwise fall back to defaults
		const znsData = this.currentThemeSettings?.zns;
		const lightColors = znsData?.lightMode?.colors || this.znsColors;
		const darkColors = znsData?.darkMode?.colors || this.darkModeZnsColors;

		if (isDarkMode) {
			// Patch with dark mode colors from API
			this.themeForm.patchValue({
				znsLightPrimary: darkColors.primary,
				znsLightSecondary: darkColors.secondary,
				znsLightBackground: darkColors.background,
				znsLightBackgroundSecondary: darkColors.backgroundSecondary,
				znsLightText: darkColors.text,
				znsLightTextSecondary: darkColors.textSecondary,
				znsLightTextMuted: darkColors.textMuted,
				znsLightHeader: darkColors.header,
				znsLightHeaderText: darkColors.headerText,
				znsLightButton: darkColors.button,
				znsLightButtonText: darkColors.buttonText,
				znsLightButtonHover: darkColors.buttonHover,
				znsLightButtonSecondary: darkColors.buttonSecondary,
				znsLightButtonSecondaryText: darkColors.buttonSecondaryText,
				znsLightBorder: darkColors.border,
				znsLightBorderHover: darkColors.borderHover,
				znsLightSuccess: darkColors.success,
				znsLightSuccessText: darkColors.successText,
				znsLightWarning: darkColors.warning,
				znsLightWarningText: darkColors.warningText,
				znsLightError: darkColors.error,
				znsLightErrorText: darkColors.errorText,
				znsLightCard: darkColors.card,
				znsLightCardBorder: darkColors.cardBorder,
				znsLightShadow: darkColors.shadow,
			});
		} else {
			// Patch with light mode colors from API
			this.themeForm.patchValue({
				znsLightPrimary: lightColors.primary,
				znsLightSecondary: lightColors.secondary,
				znsLightBackground: lightColors.background,
				znsLightBackgroundSecondary: lightColors.backgroundSecondary,
				znsLightText: lightColors.text,
				znsLightTextSecondary: lightColors.textSecondary,
				znsLightTextMuted: lightColors.textMuted,
				znsLightHeader: lightColors.header,
				znsLightHeaderText: lightColors.headerText,
				znsLightButton: lightColors.button,
				znsLightButtonText: lightColors.buttonText,
				znsLightButtonHover: lightColors.buttonHover,
				znsLightButtonSecondary: lightColors.buttonSecondary,
				znsLightButtonSecondaryText: lightColors.buttonSecondaryText,
				znsLightBorder: lightColors.border,
				znsLightBorderHover: lightColors.borderHover,
				znsLightSuccess: lightColors.success,
				znsLightSuccessText: lightColors.successText,
				znsLightWarning: lightColors.warning,
				znsLightWarningText: lightColors.warningText,
				znsLightError: lightColors.error,
				znsLightErrorText: lightColors.errorText,
				znsLightCard: lightColors.card,
				znsLightCardBorder: lightColors.cardBorder,
				znsLightShadow: lightColors.shadow,
			});
		}

		this._cdr.detectChanges();
	}

	/**
	 * Apply ZNS light mode colors
	 */
	private applyZnsLightMode(): void {
		Object.keys(this.znsColors).forEach((key) => {
			const formKey = `znsLight${key.charAt(0).toUpperCase()}${key.slice(1)}`;
			this.themeForm.get(formKey)?.setValue(this.znsColors[key as keyof typeof this.znsColors]);
		});

		// Force change detection
		this._cdr.detectChanges();
	}

	/**
	 * Apply ZelfKeys dark mode colors
	 */
	private applyZelfkeysDarkMode(): void {
		Object.keys(this.darkModeZelfkeysColors).forEach((key) => {
			const formKey = `zelfkeysDark${key.charAt(0).toUpperCase()}${key.slice(1)}`;
			this.themeForm.get(formKey)?.setValue(this.darkModeZelfkeysColors[key as keyof typeof this.darkModeZelfkeysColors]);
		});

		// Force change detection
		this._cdr.detectChanges();
	}

	/**
	 * Patch ZelfKeys form values to update color pickers and inputs
	 */
	private patchZelfkeysFormValues(): void {
		const currentMode = this.themeForm.get("zelfkeysCurrentMode")?.value;
		const isDarkMode = currentMode === "dark";

		// Use actual API data if available, otherwise fall back to defaults
		const zelfkeysData = this.currentThemeSettings?.zelfkeys;
		const lightColors = zelfkeysData?.lightMode?.colors || this.zelfkeysColors;
		const darkColors = zelfkeysData?.darkMode?.colors || this.darkModeZelfkeysColors;

		if (isDarkMode) {
			// Patch with dark mode colors from API
			this.themeForm.patchValue({
				zelfkeysLightPrimary: darkColors.primary,
				zelfkeysLightSecondary: darkColors.secondary,
				zelfkeysLightBackground: darkColors.background,
				zelfkeysLightBackgroundSecondary: darkColors.backgroundSecondary,
				zelfkeysLightText: darkColors.text,
				zelfkeysLightTextSecondary: darkColors.textSecondary,
				zelfkeysLightTextMuted: darkColors.textMuted,
				zelfkeysLightHeader: darkColors.header,
				zelfkeysLightHeaderText: darkColors.headerText,
				zelfkeysLightButton: darkColors.button,
				zelfkeysLightButtonText: darkColors.buttonText,
				zelfkeysLightButtonHover: darkColors.buttonHover,
				zelfkeysLightButtonSecondary: darkColors.buttonSecondary,
				zelfkeysLightButtonSecondaryText: darkColors.buttonSecondaryText,
				zelfkeysLightBorder: darkColors.border,
				zelfkeysLightBorderHover: darkColors.borderHover,
				zelfkeysLightSuccess: darkColors.success,
				zelfkeysLightSuccessText: darkColors.successText,
				zelfkeysLightWarning: darkColors.warning,
				zelfkeysLightWarningText: darkColors.warningText,
				zelfkeysLightError: darkColors.error,
				zelfkeysLightErrorText: darkColors.errorText,
				zelfkeysLightCard: darkColors.card,
				zelfkeysLightCardBorder: darkColors.cardBorder,
				zelfkeysLightShadow: darkColors.shadow,
			});
		} else {
			// Patch with light mode colors from API
			this.themeForm.patchValue({
				zelfkeysLightPrimary: lightColors.primary,
				zelfkeysLightSecondary: lightColors.secondary,
				zelfkeysLightBackground: lightColors.background,
				zelfkeysLightBackgroundSecondary: lightColors.backgroundSecondary,
				zelfkeysLightText: lightColors.text,
				zelfkeysLightTextSecondary: lightColors.textSecondary,
				zelfkeysLightTextMuted: lightColors.textMuted,
				zelfkeysLightHeader: lightColors.header,
				zelfkeysLightHeaderText: lightColors.headerText,
				zelfkeysLightButton: lightColors.button,
				zelfkeysLightButtonText: lightColors.buttonText,
				zelfkeysLightButtonHover: lightColors.buttonHover,
				zelfkeysLightButtonSecondary: lightColors.buttonSecondary,
				zelfkeysLightButtonSecondaryText: lightColors.buttonSecondaryText,
				zelfkeysLightBorder: lightColors.border,
				zelfkeysLightBorderHover: lightColors.borderHover,
				zelfkeysLightSuccess: lightColors.success,
				zelfkeysLightSuccessText: lightColors.successText,
				zelfkeysLightWarning: lightColors.warning,
				zelfkeysLightWarningText: lightColors.warningText,
				zelfkeysLightError: lightColors.error,
				zelfkeysLightErrorText: lightColors.errorText,
				zelfkeysLightCard: lightColors.card,
				zelfkeysLightCardBorder: lightColors.cardBorder,
				zelfkeysLightShadow: lightColors.shadow,
			});
		}

		this._cdr.detectChanges();
	}

	/**
	 * Apply ZelfKeys light mode colors
	 */
	private applyZelfkeysLightMode(): void {
		Object.keys(this.zelfkeysColors).forEach((key) => {
			const formKey = `zelfkeysLight${key.charAt(0).toUpperCase()}${key.slice(1)}`;
			this.themeForm.get(formKey)?.setValue(this.zelfkeysColors[key as keyof typeof this.zelfkeysColors]);
		});

		// Force change detection
		this._cdr.detectChanges();
	}

	/**
	 * Reset ZNS to default colors
	 */
	resetZnsColors(): void {
		this.themeForm.get("znsDarkMode")?.setValue(false);
		this.themeForm.get("znsCurrentMode")?.setValue("light");

		// Show loading state
		this.isLoadingColors = true;
		this._cdr.detectChanges();

		// Apply colors after a delay
		setTimeout(() => {
			this.applyZnsLightMode();

			// Patch the form with updated values
			this.patchZnsFormValues();

			// Hide loading state
			this.isLoadingColors = false;
			this._cdr.detectChanges();
		}, 1000);
	}

	/**
	 * Reset ZelfKeys to default colors
	 */
	resetZelfkeysColors(): void {
		this.themeForm.get("zelfkeysDarkMode")?.setValue(false);
		this.themeForm.get("zelfkeysCurrentMode")?.setValue("light");

		// Show loading state
		this.isLoadingColors = true;
		this._cdr.detectChanges();

		// Apply colors after a delay
		setTimeout(() => {
			this.applyZelfkeysLightMode();

			// Patch the form with updated values
			this.patchZelfkeysFormValues();

			// Hide loading state
			this.isLoadingColors = false;
			this._cdr.detectChanges();
		}, 1000);
	}

	/**
	 * Save theme settings with biometric verification
	 */
	saveThemeSettings(): void {
		if (this.themeForm.invalid) {
			this.showError(this._translocoService.translate("theme_settings.actions.fill_required"));
			return;
		}

		// Convert form data to theme settings format
		const themeSettings = this._themeService.convertFormToThemeSettings(this.themeForm.value);

		// Validate theme settings
		if (!this.validateThemeSettings(themeSettings)) {
			this.showError(this._translocoService.translate("theme_settings.actions.invalid_settings"));
			return;
		}

		// Set save data in service
		this._saveConfirmationService.setSaveData({
			domain: null, // Not needed for theme operations
			domainConfig: null, // Not needed for theme operations
			redirectUrl: "/settings/theme-styles",
			operation: {
				title: this._translocoService.translate("saving_operations.theme_settings.title"),
				description: this._translocoService.translate("saving_operations.theme_settings.description"),
				action: this._translocoService.translate("saving_operations.theme_settings.action"),
				itemName: this._translocoService.translate("saving_operations.theme_settings.itemName"),
			},
			themeData: {
				themeSettings: themeSettings,
				operation: "updateThemeSettings",
				faceBase64: "", // Will be set during biometric verification
				masterPassword: "", // Will be set during biometric verification
			},
		});

		// Navigate to save confirmation page
		this._router.navigate(["/save-confirmation"], {
			queryParams: { redirect: "/settings/theme-styles" },
		});
	}

	/**
	 * Validate theme settings
	 */
	private validateThemeSettings(themeSettings: ThemeSettings): boolean {
		// Validate ZNS light mode colors
		for (const [key, value] of Object.entries(themeSettings.zns.lightMode.colors)) {
			if (!this._themeService.validateColor(value)) {
				console.error(`Invalid ZNS light mode color for ${key}:`, value);
				return false;
			}
		}

		// Validate ZNS dark mode colors
		for (const [key, value] of Object.entries(themeSettings.zns.darkMode.colors)) {
			if (!this._themeService.validateColor(value)) {
				console.error(`Invalid ZNS dark mode color for ${key}:`, value);
				return false;
			}
		}

		// Validate ZelfKeys light mode colors
		for (const [key, value] of Object.entries(themeSettings.zelfkeys.lightMode.colors)) {
			if (!this._themeService.validateColor(value)) {
				console.error(`Invalid ZelfKeys light mode color for ${key}:`, value);
				return false;
			}
		}

		// Validate ZelfKeys dark mode colors
		for (const [key, value] of Object.entries(themeSettings.zelfkeys.darkMode.colors)) {
			if (!this._themeService.validateColor(value)) {
				console.error(`Invalid ZelfKeys dark mode color for ${key}:`, value);
				return false;
			}
		}

		return true;
	}

	/**
	 * Show success message
	 */
	private showSuccess(message: string): void {
		this.alertMessage = message;
		this.alertType = "success";
		this.showAlert = true;
		setTimeout(() => {
			this.showAlert = false;
		}, 5000);
	}

	/**
	 * Show error message
	 */
	private showError(message: string): void {
		this.alertMessage = message;
		this.alertType = "error";
		this.showAlert = true;
		setTimeout(() => {
			this.showAlert = false;
		}, 5000);
	}

	/**
	 * Handle color picker change
	 */
	onColorChange(fieldName: string, event: Event): void {
		const target = event.target as HTMLInputElement;
		const colorValue = target.value;
		this.themeForm.get(fieldName)?.setValue(colorValue);
	}

	/**
	 * Handle text input change
	 */
	onTextChange(fieldName: string, event: Event): void {
		const target = event.target as HTMLInputElement;
		const textValue = target.value;

		// Validate hex color format
		if (this._themeService.validateColor(textValue)) {
			this.themeForm.get(fieldName)?.setValue(textValue);
		}
	}
}
