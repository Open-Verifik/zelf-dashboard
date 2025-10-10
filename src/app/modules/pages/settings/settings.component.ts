import { NgClass } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { Router, ActivatedRoute, NavigationEnd, RouterModule } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDrawer, MatSidenavModule } from "@angular/material/sidenav";
import { FuseMediaWatcherService } from "@fuse/services/media-watcher";
import { Subject, takeUntil, filter } from "rxjs";

@Component({
	selector: "settings",
	templateUrl: "./settings.component.html",
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [MatSidenavModule, MatButtonModule, MatIconModule, NgClass, RouterModule],
})
export class SettingsComponent implements OnInit, OnDestroy {
	@ViewChild("drawer") drawer: MatDrawer;
	drawerMode: "over" | "side" = "side";
	drawerOpened: boolean = true;
	panels: any[] = [];
	selectedPanel: string = "license";
	private _unsubscribeAll: Subject<any> = new Subject<any>();

	/**
	 * Constructor
	 */
	constructor(
		private _changeDetectorRef: ChangeDetectorRef,
		private _fuseMediaWatcherService: FuseMediaWatcherService,
		private _router: Router,
		private _activatedRoute: ActivatedRoute
	) {}

	// -----------------------------------------------------------------------------------------------------
	// @ Lifecycle hooks
	// -----------------------------------------------------------------------------------------------------

	/**
	 * On init
	 */
	ngOnInit(): void {
		// Setup available panels
		this.panels = [
			{
				id: "license",
				icon: "heroicons_outline:user-circle",
				title: "License",
				description: "Manage your license",
			},
			{
				id: "theme-styles",
				icon: "heroicons_outline:paint-brush",
				title: "Theme & Styles",
				description: "Customize colors for Zelf Name Service and ZelfKeys",
			},
			{
				id: "security",
				icon: "heroicons_outline:lock-closed",
				title: "Security",
				description: "Manage your password and 2-step verification preferences",
			},
			{
				id: "plan-billing",
				icon: "heroicons_outline:credit-card",
				title: "Plan & Billing",
				description: "Manage your subscription plan, payment method and billing information",
			},
			{
				id: "notifications",
				icon: "heroicons_outline:bell",
				title: "Notifications",
				description: "Manage when you'll be notified on which channels",
			},
			{
				id: "team",
				icon: "heroicons_outline:user-group",
				title: "Team",
				description: "Manage your existing team and change roles/permissions",
			},
		];

		// Subscribe to router events to update selected panel
		this._router.events
			.pipe(
				filter((event) => event instanceof NavigationEnd),
				takeUntil(this._unsubscribeAll)
			)
			.subscribe((event: NavigationEnd) => {
				// Extract the panel from the URL
				const urlSegments = event.url.split("/");
				const panel = urlSegments[urlSegments.length - 1];

				// Update selected panel if it's a valid panel
				if (this.panels.find((p) => p.id === panel)) {
					this.selectedPanel = panel;
					this._changeDetectorRef.markForCheck();
				}
			});

		// Subscribe to media changes
		this._fuseMediaWatcherService.onMediaChange$.pipe(takeUntil(this._unsubscribeAll)).subscribe(({ matchingAliases }) => {
			// Set the drawerMode and drawerOpened
			if (matchingAliases.includes("lg")) {
				this.drawerMode = "side";
				this.drawerOpened = true;
			} else {
				this.drawerMode = "over";
				this.drawerOpened = false;
			}

			// Mark for check
			this._changeDetectorRef.markForCheck();
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
	 * Navigate to the panel
	 *
	 * @param panel
	 */
	goToPanel(panel: string): void {
		// Navigate to the panel route
		this._router.navigate([panel], { relativeTo: this._activatedRoute });

		// Close the drawer on 'over' mode
		if (this.drawerMode === "over") {
			this.drawer.close();
		}
	}

	/**
	 * Get the details of the panel
	 *
	 * @param id
	 */
	getPanelInfo(id: string): any {
		return this.panels.find((panel) => panel.id === id);
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
}
