import { inject } from "@angular/core";
import { Router, type CanActivateFn } from "@angular/router";
import { of } from "rxjs";
import { AuthService } from "app/core/auth/auth.service";

export const NotLawyerGuard: CanActivateFn = () => {
	const authService = inject(AuthService);
	const router = inject(Router);

	if (authService.isLawyer) {
		return of(router.parseUrl("/zelf-legacy/lawyers"));
	}

	return of(true);
};
