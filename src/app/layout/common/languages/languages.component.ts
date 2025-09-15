import { NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { FuseNavigationService, FuseVerticalNavigationComponent } from "@fuse/components/navigation";
import { AvailableLangs, TranslocoService } from "@jsverse/transloco";
import { take } from "rxjs";

@Component({
	selector: "languages",
	templateUrl: "./languages.component.html",
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	exportAs: "languages",
	imports: [MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule, NgTemplateOutlet],
})
export class LanguagesComponent implements OnInit, OnDestroy {
	availableLangs: AvailableLangs;
	activeLang: string;
	flagCodes: any;

	/**
	 * Constructor
	 */
	constructor(
		private _changeDetectorRef: ChangeDetectorRef,
		private _fuseNavigationService: FuseNavigationService,
		private _translocoService: TranslocoService
	) {}

	// -----------------------------------------------------------------------------------------------------
	// @ Lifecycle hooks
	// -----------------------------------------------------------------------------------------------------

	/**
	 * On init
	 */
	ngOnInit(): void {
		// Get the available languages from transloco
		this.availableLangs = this._translocoService.getAvailableLangs();

		// Load saved language from localStorage
		const savedLang = this._getSavedLanguage();
		if (savedLang) {
			this._translocoService.setActiveLang(savedLang);
		}

		// Subscribe to language changes
		this._translocoService.langChanges$.subscribe((activeLang) => {
			// Get the active lang
			this.activeLang = activeLang;

			// Save the selected language to localStorage
			this._saveLanguage(activeLang);

			// Update the navigation
			this._updateNavigation(activeLang);
		});

		// Set the country iso codes for languages for flags
		this.flagCodes = {
			en: "us",
			es: "es",
			fr: "fr",
			zh: "cn",
			ja: "jp",
			ko: "kr",
		};
	}

	/**
	 * On destroy
	 */
	ngOnDestroy(): void {}

	// -----------------------------------------------------------------------------------------------------
	// @ Public methods
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Set the active lang
	 *
	 * @param lang
	 */
	setActiveLang(lang: string): void {
		// Set the active lang
		this._translocoService.setActiveLang(lang);
	}

	/**
	 * Track by function for ngFor loops
	 *
	 * @param index
	 * @param item
	 */
	trackByFn(index: number, item: any): any {
		return item.id || index;
	}

	// -----------------------------------------------------------------------------------------------------
	// @ Private methods
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Save the selected language to localStorage
	 *
	 * @param lang
	 * @private
	 */
	private _saveLanguage(lang: string): void {
		try {
			localStorage.setItem("selectedLanguage", lang);
		} catch (error) {
			console.warn("Could not save language to localStorage:", error);
		}
	}

	/**
	 * Get the saved language from localStorage
	 *
	 * @private
	 */
	private _getSavedLanguage(): string | null {
		try {
			return localStorage.getItem("selectedLanguage");
		} catch (error) {
			console.warn("Could not load language from localStorage:", error);
			return null;
		}
	}

	/**
	 * Update the navigation
	 *
	 * @param lang
	 * @private
	 */
	private _updateNavigation(lang: string): void {
		// For the demonstration purposes, we will only update the Dashboard names
		// from the navigation but you can do a full swap and change the entire
		// navigation data.
		//
		// You can import the data from a file or request it from your backend,
		// it's up to you.

		// Get the component -> navigation data -> item
		const navComponent = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>("mainNavigation");

		// Return if the navigation component does not exist
		if (!navComponent) {
			return null;
		}

		// Get the flat navigation data
		const navigation = navComponent.navigation;

		// Get the Project dashboard item and update its title
		const projectDashboardItem = this._fuseNavigationService.getItem("dashboards.project", navigation);
		if (projectDashboardItem) {
			this._translocoService
				.selectTranslate("Project")
				.pipe(take(1))
				.subscribe((translation) => {
					// Set the title
					projectDashboardItem.title = translation;

					// Refresh the navigation component
					navComponent.refresh();
				});
		}

		// Get the Analytics dashboard item and update its title
		const analyticsDashboardItem = this._fuseNavigationService.getItem("dashboards.analytics", navigation);
		if (analyticsDashboardItem) {
			this._translocoService
				.selectTranslate("Analytics")
				.pipe(take(1))
				.subscribe((translation) => {
					// Set the title
					analyticsDashboardItem.title = translation;

					// Refresh the navigation component
					navComponent.refresh();
				});
		}
	}
}
