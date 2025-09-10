import { Component, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { FuseFullscreenComponent } from "@fuse/components/fullscreen";
import { FuseLoadingBarComponent } from "@fuse/components/loading-bar";
import { FuseHorizontalNavigationComponent, FuseNavigationService, FuseVerticalNavigationComponent } from "@fuse/components/navigation";
import { FuseConfigService } from "@fuse/services/config";
import { FuseMediaWatcherService } from "@fuse/services/media-watcher";
import { NavigationService } from "app/core/navigation/navigation.service";
import { Navigation } from "app/core/navigation/navigation.types";
import { LanguagesComponent } from "app/layout/common/languages/languages.component";
import { MessagesComponent } from "app/layout/common/messages/messages.component";
import { NotificationsComponent } from "app/layout/common/notifications/notifications.component";
import { SearchComponent } from "app/layout/common/search/search.component";
import { ShortcutsComponent } from "app/layout/common/shortcuts/shortcuts.component";
import { ThemeToggleComponent } from "app/layout/common/theme-toggle/theme-toggle.component";
import { UserComponent } from "app/layout/common/user/user.component";
import { Subject, takeUntil } from "rxjs";

@Component({
	selector: "centered-layout",
	templateUrl: "./centered.component.html",
	encapsulation: ViewEncapsulation.None,
	imports: [
		FuseLoadingBarComponent,
		FuseVerticalNavigationComponent,
		FuseHorizontalNavigationComponent,
		MatButtonModule,
		MatIconModule,
		LanguagesComponent,
		FuseFullscreenComponent,
		SearchComponent,
		ShortcutsComponent,
		MessagesComponent,
		NotificationsComponent,
		ThemeToggleComponent,
		UserComponent,
		RouterOutlet,
	],
})
export class CenteredLayoutComponent implements OnInit, OnDestroy {
	navigation: Navigation;
	isScreenSmall: boolean;
	currentScheme: string = "light";
	private _unsubscribeAll: Subject<any> = new Subject<any>();

	/**
	 * Constructor
	 */
	constructor(
		private _activatedRoute: ActivatedRoute,
		private _router: Router,
		private _navigationService: NavigationService,
		private _fuseMediaWatcherService: FuseMediaWatcherService,
		private _fuseNavigationService: FuseNavigationService,
		private _fuseConfigService: FuseConfigService
	) {}

	// -----------------------------------------------------------------------------------------------------
	// @ Accessors
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Getter for current year
	 */
	get currentYear(): number {
		return new Date().getFullYear();
	}

	// -----------------------------------------------------------------------------------------------------
	// @ Lifecycle hooks
	// -----------------------------------------------------------------------------------------------------

	/**
	 * On init
	 */
	ngOnInit(): void {
		// Subscribe to navigation data
		this._navigationService.navigation$.pipe(takeUntil(this._unsubscribeAll)).subscribe((navigation: Navigation) => {
			this.navigation = navigation;
		});

		// Subscribe to media changes
		this._fuseMediaWatcherService.onMediaChange$.pipe(takeUntil(this._unsubscribeAll)).subscribe(({ matchingAliases }) => {
			// Check if the screen is small
			this.isScreenSmall = !matchingAliases.includes("md");
		});

		// Subscribe to config changes to track theme
		this._fuseConfigService.config$.pipe(takeUntil(this._unsubscribeAll)).subscribe((config) => {
			this.currentScheme = config.scheme;
		});
	}

	/**
	 * On destroy
	 */
	ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next(null);
		this._unsubscribeAll.complete();
	}

	// -----------------------------------------------------------------------------------------------------
	// @ Public methods
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Toggle navigation
	 *
	 * @param name
	 */
	toggleNavigation(name: string): void {
		// Get the navigation
		const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);

		if (navigation) {
			// Toggle the opened status
			navigation.toggle();
		}
	}

	/**
	 * Get the appropriate logo source based on current theme
	 */
	getLogoSrc(): string {
		// Check if we're in dark mode
		const isDarkMode =
			this.currentScheme === "dark" || (this.currentScheme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);

		return isDarkMode ? "images/logo/logo-text-on-dark.svg" : "images/logo/logo-text.svg";
	}
}
