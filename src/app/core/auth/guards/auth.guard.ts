import { inject } from "@angular/core";
import { CanActivateChildFn, CanActivateFn, Router } from "@angular/router";
import { AuthService } from "app/core/auth/auth.service";
import { of, switchMap } from "rxjs";

export const AuthGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
	const router: Router = inject(Router);
	const authService = inject(AuthService);

	// First check if all required session data is present
	if (!authService.hasValidSession()) {
		// Redirect to the sign-in page with a redirectUrl param
		const redirectURL = state.url === "/sign-out" ? "" : `redirectURL=${state.url}`;
		const urlTree = router.parseUrl(`sign-in?${redirectURL}`);
		return of(urlTree);
	}

	// Check the authentication status
	return authService.check().pipe(
		switchMap((authenticated) => {
			// If the user is not authenticated...
			if (!authenticated) {
				// Redirect to the sign-in page with a redirectUrl param
				const redirectURL = state.url === "/sign-out" ? "" : `redirectURL=${state.url}`;
				const urlTree = router.parseUrl(`sign-in?${redirectURL}`);

				return of(urlTree);
			}

			// Allow the access
			return of(true);
		})
	);
};
