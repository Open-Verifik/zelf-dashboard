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
import { TranslocoService, TranslocoModule } from "@jsverse/transloco";

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
	showAlert: boolean = false;
	alertMessage: string = "";
	alertType: "success" | "error" = "success";

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
		private _cdr: ChangeDetectorRef
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
			znsDarkMode: [false],
			znsPrimary: [this.znsColors.primary],
			znsSecondary: [this.znsColors.secondary],
			znsBackground: [this.znsColors.background],
			znsBackgroundSecondary: [this.znsColors.backgroundSecondary],
			znsText: [this.znsColors.text],
			znsTextSecondary: [this.znsColors.textSecondary],
			znsTextMuted: [this.znsColors.textMuted],
			znsHeader: [this.znsColors.header],
			znsHeaderText: [this.znsColors.headerText],
			znsButton: [this.znsColors.button],
			znsButtonText: [this.znsColors.buttonText],
			znsButtonHover: [this.znsColors.buttonHover],
			znsButtonSecondary: [this.znsColors.buttonSecondary],
			znsButtonSecondaryText: [this.znsColors.buttonSecondaryText],
			znsBorder: [this.znsColors.border],
			znsBorderHover: [this.znsColors.borderHover],
			znsSuccess: [this.znsColors.success],
			znsSuccessText: [this.znsColors.successText],
			znsWarning: [this.znsColors.warning],
			znsWarningText: [this.znsColors.warningText],
			znsError: [this.znsColors.error],
			znsErrorText: [this.znsColors.errorText],
			znsCard: [this.znsColors.card],
			znsCardBorder: [this.znsColors.cardBorder],
			znsShadow: [this.znsColors.shadow],

			// ZelfKeys Settings
			zelfkeysEnabled: [true],
			zelfkeysDarkMode: [false],
			zelfkeysPrimary: [this.zelfkeysColors.primary],
			zelfkeysSecondary: [this.zelfkeysColors.secondary],
			zelfkeysBackground: [this.zelfkeysColors.background],
			zelfkeysBackgroundSecondary: [this.zelfkeysColors.backgroundSecondary],
			zelfkeysText: [this.zelfkeysColors.text],
			zelfkeysTextSecondary: [this.zelfkeysColors.textSecondary],
			zelfkeysTextMuted: [this.zelfkeysColors.textMuted],
			zelfkeysHeader: [this.zelfkeysColors.header],
			zelfkeysHeaderText: [this.zelfkeysColors.headerText],
			zelfkeysButton: [this.zelfkeysColors.button],
			zelfkeysButtonText: [this.zelfkeysColors.buttonText],
			zelfkeysButtonHover: [this.zelfkeysColors.buttonHover],
			zelfkeysButtonSecondary: [this.zelfkeysColors.buttonSecondary],
			zelfkeysButtonSecondaryText: [this.zelfkeysColors.buttonSecondaryText],
			zelfkeysBorder: [this.zelfkeysColors.border],
			zelfkeysBorderHover: [this.zelfkeysColors.borderHover],
			zelfkeysSuccess: [this.zelfkeysColors.success],
			zelfkeysSuccessText: [this.zelfkeysColors.successText],
			zelfkeysWarning: [this.zelfkeysColors.warning],
			zelfkeysWarningText: [this.zelfkeysColors.warningText],
			zelfkeysError: [this.zelfkeysColors.error],
			zelfkeysErrorText: [this.zelfkeysColors.errorText],
			zelfkeysCard: [this.zelfkeysColors.card],
			zelfkeysCardBorder: [this.zelfkeysColors.cardBorder],
			zelfkeysShadow: [this.zelfkeysColors.shadow],
		});
	}

	/**
	 * Load current theme settings from localStorage
	 */
	private loadCurrentThemeSettings(): void {
		const znsTheme = localStorage.getItem("zns-theme");
		const zelfkeysTheme = localStorage.getItem("zelfkeys-theme");

		if (znsTheme) {
			try {
				const parsed = JSON.parse(znsTheme);
				this.updateZnsFormValues(parsed);
			} catch (error) {
				console.error("Error parsing ZNS theme:", error);
			}
		}

		if (zelfkeysTheme) {
			try {
				const parsed = JSON.parse(zelfkeysTheme);
				this.updateZelfkeysFormValues(parsed);
			} catch (error) {
				console.error("Error parsing ZelfKeys theme:", error);
			}
		}
	}

	/**
	 * Update ZNS form values
	 */
	private updateZnsFormValues(theme: any): void {
		Object.keys(theme).forEach((key) => {
			const formKey = `zns${key.charAt(0).toUpperCase()}${key.slice(1)}`;
			if (this.themeForm.get(formKey)) {
				this.themeForm.get(formKey)?.setValue(theme[key]);
			}
		});
	}

	/**
	 * Update ZelfKeys form values
	 */
	private updateZelfkeysFormValues(theme: any): void {
		Object.keys(theme).forEach((key) => {
			const formKey = `zelfkeys${key.charAt(0).toUpperCase()}${key.slice(1)}`;
			if (this.themeForm.get(formKey)) {
				this.themeForm.get(formKey)?.setValue(theme[key]);
			}
		});
	}

	/**
	 * Toggle dark mode for ZNS
	 */
	toggleZnsDarkMode(): void {
		const isDarkMode = this.themeForm.get("znsDarkMode")?.value;
		if (isDarkMode) {
			this.applyZnsDarkMode();
		} else {
			this.applyZnsLightMode();
		}
	}

	/**
	 * Toggle dark mode for ZelfKeys
	 */
	toggleZelfkeysDarkMode(): void {
		const isDarkMode = this.themeForm.get("zelfkeysDarkMode")?.value;
		if (isDarkMode) {
			this.applyZelfkeysDarkMode();
		} else {
			this.applyZelfkeysLightMode();
		}
	}

	/**
	 * Apply ZNS dark mode colors
	 */
	private applyZnsDarkMode(): void {
		Object.keys(this.darkModeZnsColors).forEach((key) => {
			const formKey = `zns${key.charAt(0).toUpperCase()}${key.slice(1)}`;
			this.themeForm.get(formKey)?.setValue(this.darkModeZnsColors[key as keyof typeof this.darkModeZnsColors]);
		});
	}

	/**
	 * Apply ZNS light mode colors
	 */
	private applyZnsLightMode(): void {
		Object.keys(this.znsColors).forEach((key) => {
			const formKey = `zns${key.charAt(0).toUpperCase()}${key.slice(1)}`;
			this.themeForm.get(formKey)?.setValue(this.znsColors[key as keyof typeof this.znsColors]);
		});
	}

	/**
	 * Apply ZelfKeys dark mode colors
	 */
	private applyZelfkeysDarkMode(): void {
		Object.keys(this.darkModeZelfkeysColors).forEach((key) => {
			const formKey = `zelfkeys${key.charAt(0).toUpperCase()}${key.slice(1)}`;
			this.themeForm.get(formKey)?.setValue(this.darkModeZelfkeysColors[key as keyof typeof this.darkModeZelfkeysColors]);
		});
	}

	/**
	 * Apply ZelfKeys light mode colors
	 */
	private applyZelfkeysLightMode(): void {
		Object.keys(this.zelfkeysColors).forEach((key) => {
			const formKey = `zelfkeys${key.charAt(0).toUpperCase()}${key.slice(1)}`;
			this.themeForm.get(formKey)?.setValue(this.zelfkeysColors[key as keyof typeof this.zelfkeysColors]);
		});
	}

	/**
	 * Reset ZNS to default colors
	 */
	resetZnsColors(): void {
		this.themeForm.get("znsDarkMode")?.setValue(false);
		this.applyZnsLightMode();
	}

	/**
	 * Reset ZelfKeys to default colors
	 */
	resetZelfkeysColors(): void {
		this.themeForm.get("zelfkeysDarkMode")?.setValue(false);
		this.applyZelfkeysLightMode();
	}

	/**
	 * Save theme settings
	 */
	saveThemeSettings(): void {
		if (this.themeForm.invalid) {
			this.showError("Please fill in all required fields correctly");
			return;
		}

		this.isLoading = true;

		try {
			// Extract ZNS colors
			const znsTheme = this.extractZnsTheme();
			localStorage.setItem("zns-theme", JSON.stringify(znsTheme));

			// Extract ZelfKeys colors
			const zelfkeysTheme = this.extractZelfkeysTheme();
			localStorage.setItem("zelfkeys-theme", JSON.stringify(zelfkeysTheme));

			this.showSuccess("Theme settings saved successfully!");
		} catch (error) {
			console.error("Error saving theme settings:", error);
			this.showError("Failed to save theme settings");
		} finally {
			this.isLoading = false;
			this._cdr.detectChanges();
		}
	}

	/**
	 * Extract ZNS theme from form
	 */
	private extractZnsTheme(): any {
		const theme: any = {};
		Object.keys(this.znsColors).forEach((key) => {
			const formKey = `zns${key.charAt(0).toUpperCase()}${key.slice(1)}`;
			const value = this.themeForm.get(formKey)?.value;
			if (value !== undefined) {
				theme[key] = value;
			}
		});
		return theme;
	}

	/**
	 * Extract ZelfKeys theme from form
	 */
	private extractZelfkeysTheme(): any {
		const theme: any = {};
		Object.keys(this.zelfkeysColors).forEach((key) => {
			const formKey = `zelfkeys${key.charAt(0).toUpperCase()}${key.slice(1)}`;
			const value = this.themeForm.get(formKey)?.value;
			if (value !== undefined) {
				theme[key] = value;
			}
		});
		return theme;
	}

	/**
	 * Preview ZNS theme
	 */
	previewZnsTheme(): void {
		const theme = this.extractZnsTheme();
		// Apply CSS custom properties for preview
		this.applyCssVariables("zns", theme);
	}

	/**
	 * Preview ZelfKeys theme
	 */
	previewZelfkeysTheme(): void {
		const theme = this.extractZelfkeysTheme();
		// Apply CSS custom properties for preview
		this.applyCssVariables("zelfkeys", theme);
	}

	/**
	 * Apply CSS variables for preview
	 */
	private applyCssVariables(prefix: string, theme: any): void {
		const root = document.documentElement;
		Object.keys(theme).forEach((key) => {
			const cssVar = `--${prefix}-${key}`;
			root.style.setProperty(cssVar, theme[key]);
		});
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
}

