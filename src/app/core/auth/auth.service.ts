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
	 * Sign in
	 *
	 * @param credentials
	 */
	signIn(credentials: {
		email?: string;
		countryCode?: string;
		phone?: string;
		zelfProof: string;
		faceBase64: string;
		masterPassword: string;
		identificationMethod: string;
	}): Promise<any> {
		// Throw error, if the user is already logged in
		if (this._authenticated) {
			throwError(() => new Error("User is already logged in."));
			return Promise.resolve(false);
		}

		return this._httpWrapper.sendRequest("post", `${environment.apiUrl}${environment.endpoints.auth.signIn}`, credentials);
	}

	/**
	 * Sign out
	 */
	signOut(): Observable<any> {
		// Remove all authentication data from local storage
		localStorage.removeItem("accessToken");
		localStorage.removeItem("zelfProof");
		localStorage.removeItem("zelfAccount");
		localStorage.removeItem("license");

		// Remove session and account-related data
		localStorage.removeItem("sessionToken");
		localStorage.removeItem("subscription");
		localStorage.removeItem("domainNotificationSettings");
		localStorage.removeItem("signedDataPrice");

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

	verifyClientExists(user: { email: string; phone: string }): Observable<any> {
		return this._httpClient.get(`${environment.apiUrl}${environment.endpoints.auth.verifyClientExists}`, { params: user });
	}
}
