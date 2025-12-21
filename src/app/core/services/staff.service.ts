import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "environments/environment";

@Injectable({
	providedIn: "root",
})
export class StaffService {
	private _baseUrl = `${environment.apiUrl}/api/staff`;

	constructor(private _httpClient: HttpClient) {}

	/**
	 * Get all staff members
	 */
	getStaff(): Observable<any> {
		return this._httpClient.get(this._baseUrl);
	}

	/**
	 * Invite a new staff member
	 * Requires biometric verification from the owner
	 */
	inviteStaff(data: {
		staffEmail: string;
		staffPhone: string;
		staffName: string;
		role: string;
		faceBase64: string;
		masterPassword?: string;
		isResend?: boolean;
	}): Observable<any> {
		return this._httpClient.post(this._baseUrl + "/invite", data);
	}

	/**
	 * Accept invitation (Public endpoint)
	 */
	acceptInvitation(data: { invitationToken: string; faceBase64: string; masterPassword?: string }): Observable<any> {
		return this._httpClient.post(this._baseUrl + "/accept-invite", data);
	}

	/**
	 * Update staff role
	 */
	updateRole(data: { staffEmail: string; newRole: string; faceBase64: string; masterPassword?: string }): Observable<any> {
		return this._httpClient.put(this._baseUrl + "/role", data);
	}

	/**
	 * Remove staff member
	 */
	removeStaff(data: { staffEmail: string; faceBase64: string; masterPassword?: string }): Observable<any> {
		return this._httpClient.delete(this._baseUrl, { body: data });
	}
}
