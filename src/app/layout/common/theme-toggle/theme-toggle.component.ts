import { Component, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { FuseConfig, FuseConfigService, Scheme } from "@fuse/services/config";
import { Subject, takeUntil } from "rxjs";

@Component({
	selector: "theme-toggle",
	templateUrl: "./theme-toggle.component.html",
	encapsulation: ViewEncapsulation.None,
	imports: [MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule],
})
export class ThemeToggleComponent implements OnInit, OnDestroy {
	config: FuseConfig;
	scheme: Scheme;
	private _unsubscribeAll: Subject<any> = new Subject<any>();

	/**
	 * Constructor
	 */
	constructor(private _fuseConfigService: FuseConfigService) {}

	// -----------------------------------------------------------------------------------------------------
	// @ Lifecycle hooks
	// -----------------------------------------------------------------------------------------------------

	/**
	 * On init
	 */
	ngOnInit(): void {
		// Subscribe to config changes
		this._fuseConfigService.config$.pipe(takeUntil(this._unsubscribeAll)).subscribe((config: FuseConfig) => {
			// Store the config
			this.config = config;
			this.scheme = config.scheme;
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
	 * Set the scheme on the config
	 *
	 * @param scheme
	 */
	setScheme(scheme: Scheme): void {
		this._fuseConfigService.config = { scheme };
	}

	/**
	 * Get the current scheme icon
	 */
	getSchemeIcon(): string {
		switch (this.scheme) {
			case "light":
				return "heroicons_solid:sun";
			case "dark":
				return "heroicons_solid:moon";
			case "auto":
			default:
				return "heroicons_solid:bolt";
		}
	}

	/**
	 * Get the current scheme label
	 */
	getSchemeLabel(): string {
		switch (this.scheme) {
			case "light":
				return "Light";
			case "dark":
				return "Dark";
			case "auto":
			default:
				return "Auto";
		}
	}
}
