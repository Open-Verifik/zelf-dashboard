import { Injectable } from "@angular/core";
import { HttpWrapperService } from "../../http-wrapper.service";
import { environment } from "environments/environment";

@Injectable({
	providedIn: "root",
})
export class StaffService {
	private _baseUrl = `${environment.apiUrl}/api/staff`;

	constructor(private _httpWrapper: HttpWrapperService) {}

	/**
	 * Get all staff members
	 */
	async getStaff(): Promise<any> {
		return this._httpWrapper.sendRequest("get", this._baseUrl);
	}

	/**
	 * Invite a new staff member
	 * Requires biometric verification from the owner
	 */
	async inviteStaff(data: {
		staffEmail: string;
		staffPhone: string;
		staffCountryCode?: string;
		staffName: string;
		role: string;
		faceBase64: string;
		masterPassword?: string;
		isResend?: boolean;
	}): Promise<any> {
		return this._httpWrapper.sendRequest("post", this._baseUrl + "/invite", data);
	}

	/**
	 * Accept invitation (Public endpoint)
	 */
	async acceptInvitation(data: { invitationToken: string; faceBase64: string; masterPassword?: string }): Promise<any> {
		return this._httpWrapper.sendRequest("post", this._baseUrl + "/accept-invite", data);
	}

	/**
	 * Update staff role
	 */
	async updateRole(data: { staffEmail: string; newRole: string; faceBase64: string; masterPassword?: string }): Promise<any> {
		return this._httpWrapper.sendRequest("put", this._baseUrl + "/role", data);
	}

	/**
	 * Remove staff member
	 */
	async removeStaff(data: { staffEmail: string; faceBase64: string; masterPassword?: string }): Promise<any> {
		return this._httpWrapper.sendRequest("delete", this._baseUrl, { body: data });
	}

	/**
	 * Update staff profile
	 */
	async updateProfile(data: {
		staffName?: string;
		staffEmail?: string;
		staffPhone?: string;
		staffCountryCode?: string;
		staffPhoto?: string;
	}): Promise<any> {
		return this._httpWrapper.sendRequest("put", this._baseUrl, data);
	}
}
