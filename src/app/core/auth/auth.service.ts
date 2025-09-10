import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { AuthUtils } from "app/core/auth/auth.utils";
import { UserService } from "app/core/user/user.service";
import { HttpWrapperService } from "app/http-wrapper.service";
import { catchError, Observable, of, switchMap, throwError } from "rxjs";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: "root" })
export class AuthService {
	private _authenticated: boolean = false;
	private _httpClient = inject(HttpClient);
	private _userService = inject(UserService);
	private _httpWrapper = inject(HttpWrapperService);

	// -----------------------------------------------------------------------------------------------------
	// @ Accessors
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Setter & getter for access token
	 */
	set accessToken(token: string) {
		localStorage.setItem("accessToken", token);
	}

	get accessToken(): string {
		return localStorage.getItem("accessToken") ?? "";
	}

	/**
	 * Getter for zelfProof
	 */
	get zelfProof(): string {
		return localStorage.getItem("zelfProof") ?? "";
	}

	/**
	 * Getter for zelfAccount
	 */
	get zelfAccount(): any {
		const account = localStorage.getItem("zelfAccount");
		return account ? JSON.parse(account) : null;
	}

	// -----------------------------------------------------------------------------------------------------
	// @ Public methods
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Forgot password
	 *
	 * @param email
	 */
	forgotPassword(email: string): Observable<any> {
		return this._httpClient.post(`${environment.apiUrl}${environment.endpoints.auth.forgotPassword}`, email);
	}

	/**
	 * Reset password
	 *
	 * @param password
	 */
	resetPassword(password: string): Observable<any> {
		return this._httpClient.post(`${environment.apiUrl}${environment.endpoints.auth.resetPassword}`, password);
	}

	/**
	 * Sign in
	 *
	 * @param credentials
	 */
	signIn(credentials: { email: string; password: string }): Observable<any> {
		// Throw error, if the user is already logged in
		if (this._authenticated) {
			return throwError("User is already logged in.");
		}

		return this._httpClient.post(`${environment.apiUrl}${environment.endpoints.auth.signIn}`, credentials).pipe(
			switchMap((response: any) => {
				// Store the access token in the local storage
				this.accessToken = response.accessToken;

				// Set the authenticated flag to true
				this._authenticated = true;

				// Store the user on the user service
				this._userService.user = response.user;

				// Return a new observable with the response
				return of(response);
			})
		);
	}

	/**
	 * Sign in using the access token
	 * NOTE: This method is disabled because the /auth/sign-in-with-token endpoint doesn't exist
	 * For our custom auth system, we validate tokens locally without server calls
	 */
	// signInUsingToken(): Observable<any> {
	// 	// Sign in using the token
	// 	return this._httpClient
	// 		.post(`${environment.apiUrl}${environment.endpoints.auth.signInWithToken}`, {
	// 			accessToken: this.accessToken,
	// 		})
	// 		.pipe(
	// 			catchError(() =>
	// 				// Return false
	// 				of(false)
	// 			),
	// 			switchMap((response: any) => {
	// 				// Replace the access token with the new one if it's available on
	// 				// the response object.
	// 				//
	// 				// This is an added optional step for better security. Once you sign
	// 				// in using the token, you should generate a new one on the server
	// 				// side and attach it to the response object. Then the following
	// 				// piece of code can replace the token with the refreshed one.
	// 				if (response.accessToken) {
	// 					this.accessToken = response.accessToken;
	// 				}

	// 				// Set the authenticated flag to true
	// 				this._authenticated = true;

	// 				// Store the user on the user service
	// 				this._userService.user = response.user;

	// 				// Return true
	// 				return of(true);
	// 			})
	// 		);
	// }

	/**
	 * Sign out
	 */
	signOut(): Observable<any> {
		// Remove all authentication data from local storage
		localStorage.removeItem("accessToken");
		localStorage.removeItem("zelfProof");
		localStorage.removeItem("zelfAccount");

		// Set the authenticated flag to false
		this._authenticated = false;

		// Return the observable
		return of(true);
	}

	/**
	 * Sign up
	 *
	 * @param user
	 */
	signUp(user: {
		name: string;
		email: string;
		password: string;
		countryCode: string;
		phone: string;
		company: string;
		faceBase64: string;
		masterPassword: string;
	}): Promise<any> {
		return this._httpWrapper.sendRequest("post", `${environment.apiUrl}${environment.endpoints.auth.signUp}`, user);
	}

	/**
	 * Unlock session
	 *
	 * @param credentials
	 */
	unlockSession(credentials: { email: string; password: string }): Observable<any> {
		return this._httpClient.post(`${environment.apiUrl}${environment.endpoints.auth.unlockSession}`, credentials);
	}

	/**
	 * Check if all required authentication data is present
	 */
	hasValidSession(): boolean {
		return !!(this.accessToken && this.zelfProof && this.zelfAccount);
	}

	/**
	 * Check the authentication status
	 */
	check(): Observable<boolean> {
		// Check if the user is logged in
		if (this._authenticated) {
			return of(true);
		}

		// Check if all required session data is present
		if (!this.hasValidSession()) {
			return of(false);
		}

		// Check the access token expire date
		if (AuthUtils.isTokenExpired(this.accessToken)) {
			return of(false);
		}

		// For our custom auth system, if we have all required data and token is valid, we're authenticated
		// No need to call signInUsingToken since we don't have that endpoint
		this._authenticated = true;
		return of(true);
	}

	setSession(session: { zelfProof: string; zelfAccount: string }): void {
		localStorage.setItem("zelfProof", session.zelfProof);

		localStorage.setItem("zelfAccount", JSON.stringify(session.zelfAccount));
	}

	setAccessToken(token: string): void {
		localStorage.setItem("accessToken", token);
	}
}
