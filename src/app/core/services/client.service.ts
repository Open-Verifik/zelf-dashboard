import { Injectable } from "@angular/core";
import { HttpWrapperService } from "../../http-wrapper.service";
import { environment } from "environments/environment";

@Injectable({
	providedIn: "root",
})
export class ClientService {
	constructor(private _httpWrapper: HttpWrapperService) {}

	/**
	 * Update client profile
	 */
	async updateProfile(data: any): Promise<any> {
		const url = `${environment.apiUrl}${environment.endpoints.client.update}`;
		return this._httpWrapper.sendRequest("put", url, data);
	}

	/**
	 * Get client profile by email
	 */
	async getProfile(email: string): Promise<any> {
		const url = `${environment.apiUrl}/api/clients?email=${email}`;

		return this._httpWrapper.sendRequest("get", url);
	}
}
