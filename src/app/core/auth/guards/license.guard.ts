import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, Router, type CanActivateFn } from "@angular/router";
import { of } from "rxjs";

/**
 * Check if license exists in localStorage
 *
 * @returns boolean
 */
function hasLicense(): boolean {
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

export const LicenseGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
	const router = inject(Router);

	if (!hasLicense()) {
		// Redirect to license page
		const urlTree = router.parseUrl("/settings/license");
		return of(urlTree);
	}

	return of(true);
};
