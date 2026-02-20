import { Injectable } from "@angular/core";
import { FuseNavigationItem } from "@fuse/components/navigation";
import { FuseMockApiService } from "@fuse/lib/mock-api";
import { defaultNavigation, horizontalNavigation, portfolioNavigation, horizontalPortfolioNavigation } from "app/mock-api/common/navigation/data";
import { cloneDeep } from "lodash-es";
import { AuthService } from "app/core/auth/auth.service";

@Injectable({ providedIn: "root" })
export class NavigationMockApi {
	private readonly _defaultNavigation: FuseNavigationItem[] = defaultNavigation;
	private readonly _horizontalNavigation: FuseNavigationItem[] = horizontalNavigation;
	private readonly _portfolioNavigation: FuseNavigationItem[] = portfolioNavigation;
	private readonly _horizontalPortfolioNavigation: FuseNavigationItem[] = horizontalPortfolioNavigation;

	private readonly _lawyerAllowedIds = ["zelf-legacy"];

	/**
	 * Constructor
	 */
	constructor(private _fuseMockApiService: FuseMockApiService, private _authService: AuthService) {
		// Register Mock API handlers
		this.registerHandlers();
	}

	/**
	 * Filter navigation items for lawyer accounts
	 */
	private _filterForLawyer(items: FuseNavigationItem[]): FuseNavigationItem[] {
		return items.filter((item) => this._lawyerAllowedIds.includes(item.id));
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

			// Filter for lawyer accounts
			const isLawyer = this._authService.isLawyer;
			const defaultNav = isLawyer ? this._filterForLawyer(this._defaultNavigation) : this._defaultNavigation;
			const horizontalNav = isLawyer ? this._filterForLawyer(this._horizontalNavigation) : this._horizontalNavigation;

			// Return the response
			return [
				200,
				{
					default: cloneDeep(defaultNav),
					horizontal: cloneDeep(horizontalNav),
					portfolio: isLawyer ? [] : cloneDeep(this._portfolioNavigation),
					horizontalPortfolio: isLawyer ? [] : cloneDeep(this._horizontalPortfolioNavigation),
				},
			];
		});
	}
}
