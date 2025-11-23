import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatOptionModule } from "@angular/material/core";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatDividerModule } from "@angular/material/divider";
import { Router, ActivatedRoute } from "@angular/router";
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
		MatSlideToggleModule,
		MatDividerModule,
		TranslocoModule,
	],
})
export class SettingsThemeStylesComponent implements OnInit {
	alertMessage: string = "";
	alertType: "success" | "error" = "success";
	currentThemeSettings: any = null;
	isLoading: boolean = false;
	isLoadingColors: boolean = false;
	showAlert: boolean = false;
	themeForm: UntypedFormGroup;

	constructor(
		private _activatedRoute: ActivatedRoute,
		private _changeDetectorRef: ChangeDetectorRef,
		private _formBuilder: UntypedFormBuilder,
		private _router: Router,
		private _saveConfirmationService: SaveConfirmationService,
		private _themeService: ThemeStylesService,
		private _translocoService: TranslocoService
	) {
		this.isLoadingColors = true;
	}

	ngOnInit(): void {
		if (!this.hasLicense()) {
			this.showError("License is required to access theme settings. Please configure your license first.");

			this._router.navigate(["../license"], { relativeTo: this._activatedRoute.parent });

			return;
		}

		this._createForm();
		this._loadCurrentThemeSettings();
	}

	private _createForm(): void {
		const lightColors = this._themeService.getDefaultZnsLightColors();
		const darkColors = this._themeService.getDefaultZnsDarkColors();

		this.themeForm = this._formBuilder.group({
			zns: this._formBuilder.group({
				enabled: [true],
				currentMode: ["light"],
				lightMode: this._formBuilder.group({
					colors: this._formBuilder.group({
						primary: [lightColors.primary],
						secondary: [lightColors.secondary],
						background: [lightColors.background],
						backgroundSecondary: [lightColors.backgroundSecondary],
						text: [lightColors.text],
						textSecondary: [lightColors.textSecondary],
						textMuted: [lightColors.textMuted],
						header: [lightColors.header],
						headerText: [lightColors.headerText],
						button: [lightColors.button],
						buttonText: [lightColors.buttonText],
						buttonHover: [lightColors.buttonHover],
						buttonSecondary: [lightColors.buttonSecondary],
						buttonSecondaryText: [lightColors.buttonSecondaryText],
						buttonSecondaryHover: [lightColors.buttonSecondaryHover],
						border: [lightColors.border],
						borderHover: [lightColors.borderHover],
						success: [lightColors.success],
						successText: [lightColors.successText],
						warning: [lightColors.warning],
						warningText: [lightColors.warningText],
						error: [lightColors.error],
						errorText: [lightColors.errorText],
						card: [lightColors.card],
						cardBorder: [lightColors.cardBorder],
						shadow: [lightColors.shadow],
					}),
				}),
				darkMode: this._formBuilder.group({
					colors: this._formBuilder.group({
						primary: [darkColors.primary],
						secondary: [darkColors.secondary],
						background: [darkColors.background],
						backgroundSecondary: [darkColors.backgroundSecondary],
						text: [darkColors.text],
						textSecondary: [darkColors.textSecondary],
						textMuted: [darkColors.textMuted],
						header: [darkColors.header],
						headerText: [darkColors.headerText],
						button: [darkColors.button],
						buttonText: [darkColors.buttonText],
						buttonHover: [darkColors.buttonHover],
						buttonSecondary: [darkColors.buttonSecondary],
						buttonSecondaryText: [darkColors.buttonSecondaryText],
						buttonSecondaryHover: [darkColors.buttonSecondaryHover],
						border: [darkColors.border],
						borderHover: [darkColors.borderHover],
						success: [darkColors.success],
						successText: [darkColors.successText],
						warning: [darkColors.warning],
						warningText: [darkColors.warningText],
						error: [darkColors.error],
						errorText: [darkColors.errorText],
						card: [darkColors.card],
						cardBorder: [darkColors.cardBorder],
						shadow: [darkColors.shadow],
					}),
				}),
			}),
		});
	}

	/**
	 * Load current theme settings from backend API
	 * Falls back to defaults if API call fails
	 */
	private async _loadCurrentThemeSettings(): Promise<void> {
		this.isLoadingColors = true;
		this._changeDetectorRef.detectChanges();

		try {
			const response = await this._themeService.getThemeSettings();
			const themeSettings = response.data;

			this.themeForm.patchValue(themeSettings);
		} catch (error) {
			console.error("Error loading theme settings:", error);

			this.showError(this._translocoService.translate("theme_settings.actions.failed_to_load"));

			// Load defaults on failure
			this._loadDefaultValues();
		} finally {
			this.isLoadingColors = false;
			this._changeDetectorRef.detectChanges();
		}
	}

	/**
	 * Load default theme values into the form
	 */
	private _loadDefaultValues(): void {
		// Patch ZNS colors
		const znsLightColorsGroup = this.themeForm.get("zns.lightMode.colors") as UntypedFormGroup;
		const znsDarkColorsGroup = this.themeForm.get("zns.darkMode.colors") as UntypedFormGroup;
		znsLightColorsGroup.patchValue(this._themeService.getDefaultZnsLightColors());
		znsDarkColorsGroup.patchValue(this._themeService.getDefaultZnsDarkColors());

		this.themeForm.get("zns.enabled")?.setValue(true);
		this.themeForm.get("zns.currentMode")?.setValue("light");
	}

	/**
	 * Get current colors form group based on current mode
	 * @returns Colors form group for current mode
	 */
	getColorsFormGroup(): UntypedFormGroup {
		const currentMode = this.themeForm.get("zns.currentMode")?.value || "light";
		const modePath = currentMode === "dark" ? "zns.darkMode.colors" : "zns.lightMode.colors";
		return this.themeForm.get(modePath) as UntypedFormGroup;
	}

	/**
	 * Toggle dark mode
	 */
	toggleDarkMode(): void {
		const isDarkMode = this.themeForm.get("zns.currentMode")?.value === "dark";
		const newMode = !isDarkMode ? "dark" : "light";

		this.themeForm.get("zns.currentMode")?.setValue(newMode);
		this._changeDetectorRef.detectChanges();
	}

	/**
	 * Reset to default colors
	 */
	resetColors(): void {
		this.themeForm.get("zns.currentMode")?.setValue("light");
		const lightColorsGroup = this.themeForm.get("zns.lightMode.colors") as UntypedFormGroup;
		const darkColorsGroup = this.themeForm.get("zns.darkMode.colors") as UntypedFormGroup;
		lightColorsGroup.patchValue(this._themeService.getDefaultZnsLightColors());
		darkColorsGroup.patchValue(this._themeService.getDefaultZnsDarkColors());
		this._changeDetectorRef.detectChanges();
	}

	/**
	 * Save theme settings with biometric verification
	 */
	saveThemeSettings(): void {
		if (this.themeForm.invalid) {
			this.showError(this._translocoService.translate("theme_settings.actions.fill_required"));
			return;
		}

		// Form structure now matches ThemeSettings, so we can pass it directly
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
		// Validate light mode colors
		for (const [key, value] of Object.entries(themeSettings.zns.lightMode.colors)) {
			if (!this._themeService.validateColor(value)) {
				console.error(`Invalid light mode color for ${key}:`, value);
				return false;
			}
		}

		// Validate dark mode colors
		for (const [key, value] of Object.entries(themeSettings.zns.darkMode.colors)) {
			if (!this._themeService.validateColor(value)) {
				console.error(`Invalid dark mode color for ${key}:`, value);
				return false;
			}
		}

		return true;
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
	onColorChange(formGroup: UntypedFormGroup, fieldName: string, event: Event): void {
		const target = event.target as HTMLInputElement;
		const colorValue = target.value;
		formGroup.get(fieldName)?.setValue(colorValue);
	}

	/**
	 * Handle text input change
	 */
	onTextChange(formGroup: UntypedFormGroup, fieldName: string, event: Event): void {
		const target = event.target as HTMLInputElement;
		const textValue = target.value;

		if (this._themeService.validateColor(textValue)) {
			formGroup.get(fieldName)?.setValue(textValue);
		}
	}

	/**
	 * Get translation key prefix
	 */
	getTranslationPrefix(): string {
		return "theme_settings.zns_wallet";
	}

	/**
	 * Check if current mode is dark
	 */
	isDarkMode(): boolean {
		return this.themeForm.get("zns.currentMode")?.value === "dark";
	}

	/**
	 * Check if license exists in localStorage
	 *
	 * @returns boolean
	 */
	private hasLicense(): boolean {
		try {
			const licenseStr = localStorage.getItem("license");

			if (!licenseStr) return false;

			const licenseData = JSON.parse(licenseStr);
			const domainCfg = licenseData?.domainConfig || licenseData;
			const domain = domainCfg?.name || domainCfg?.domain || licenseData?.domain;

			return !!(domain && domain.trim() !== "");
		} catch (error) {
			return false;
		}
	}
}
