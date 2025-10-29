import { Injectable } from "@angular/core";
import { FuseNavigationItem } from "@fuse/components/navigation";
import { FuseMockApiService } from "@fuse/lib/mock-api";
import { defaultNavigation, horizontalNavigation, portfolioNavigation, horizontalPortfolioNavigation } from "app/mock-api/common/navigation/data";
import { cloneDeep } from "lodash-es";

@Injectable({ providedIn: "root" })
export class NavigationMockApi {
	private readonly _defaultNavigation: FuseNavigationItem[] = defaultNavigation;
	private readonly _horizontalNavigation: FuseNavigationItem[] = horizontalNavigation;
	private readonly _portfolioNavigation: FuseNavigationItem[] = portfolioNavigation;
	private readonly _horizontalPortfolioNavigation: FuseNavigationItem[] = horizontalPortfolioNavigation;

	/**
	 * Constructor
	 */
	constructor(private _fuseMockApiService: FuseMockApiService) {
		// Register Mock API handlers
		this.registerHandlers();
	}

	// -----------------------------------------------------------------------------------------------------
	// @ Public methods
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Register Mock API handlers
	 */
	registerHandlers(): void {
		// -----------------------------------------------------------------------------------------------------
		// @ Navigation - GET
		// -----------------------------------------------------------------------------------------------------
		this._fuseMockApiService.onGet("api/common/navigation").reply(() => {
			// Fill horizontal navigation children using the default navigation
			this._horizontalNavigation.forEach((horizontalNavItem) => {
				this._defaultNavigation.forEach((defaultNavItem) => {
					if (defaultNavItem.id === horizontalNavItem.id) {
						horizontalNavItem.children = cloneDeep(defaultNavItem.children);
					}
				});
			});

			// Return the response
			return [
				200,
				{
					default: cloneDeep(this._defaultNavigation),
					horizontal: cloneDeep(this._horizontalNavigation),
					portfolio: cloneDeep(this._portfolioNavigation),
					horizontalPortfolio: cloneDeep(this._horizontalPortfolioNavigation),
				},
			];
		});
	}
}
