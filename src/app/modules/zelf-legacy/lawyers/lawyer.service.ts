import { Injectable } from "@angular/core";
import { HttpWrapperService } from "../../../http-wrapper.service";
import { environment } from "environments/environment";

@Injectable({
	providedIn: "root",
})
export class LawyerService {
	private _baseUrl = `${environment.apiUrl}/api/lawyers`;

	constructor(private _httpWrapper: HttpWrapperService) {}

	async search(params: {
		q?: string;
		domain?: string;
		city?: string;
		country?: string;
		maxRate?: number;
		license?: string;
		professionalId?: string;
		walletAddress?: string;
		zelfName?: string;
	}): Promise<any> {
		return this._httpWrapper.sendRequest("get", this._baseUrl + "/search", params);
	}

	async getByZelfName(zelfName: string): Promise<any> {
		return this._httpWrapper.sendRequest("get", `${this._baseUrl}/by-zelf-name/${zelfName}`);
	}

	async getAll(params?: { domain?: string; includeInvitations?: boolean }): Promise<any> {
		return this._httpWrapper.sendRequest("get", this._baseUrl + "/all", params);
	}

	async getInvitations(params?: { domain?: string }): Promise<any> {
		return this._httpWrapper.sendRequest("get", this._baseUrl + "/invitations", params);
	}

	async getLawyers(params?: { domain?: string; status?: string }): Promise<any> {
		return this._httpWrapper.sendRequest("get", this._baseUrl, params);
	}

	async getMyProfile(): Promise<any> {
		return this._httpWrapper.sendRequest("get", this._baseUrl + "/me");
	}

	async updateProfile(data: any): Promise<any> {
		return this._httpWrapper.sendRequest("put", this._baseUrl + "/profile", data);
	}

	async inviteLawyer(data: {
		lawyerEmail: string;
		lawyerPhone?: string;
		lawyerCountryCode?: string;
		lawyerName: string;
		domain?: string;
		faceBase64: string;
		masterPassword?: string;
	}): Promise<any> {
		return this._httpWrapper.sendRequest("post", this._baseUrl + "/invite", data);
	}

	async getPreferred(domain: string = "zelf"): Promise<any> {
		return this._httpWrapper.sendRequest("get", this._baseUrl + "/preferred", { domain });
	}

	async setPreferred(data: { domain?: string; preferredLawyerZelfNames: string[]; defaultLawyerZelfName?: string }): Promise<any> {
		return this._httpWrapper.sendRequest("put", this._baseUrl + "/preferred", data);
	}

	async removeLawyer(data: { lawyerEmail: string; faceBase64: string; masterPassword?: string }): Promise<any> {
		return this._httpWrapper.sendRequest("delete", this._baseUrl, { body: data });
	}

	async getReputation(walletAddress: string): Promise<any> {
		return this._httpWrapper.sendRequest("get", this._baseUrl + "/reputation", { walletAddress });
	}

	async submitReview(data: {
		lawyerWalletAddress: string;
		rating: number;
		tags?: string[];
		comment?: string;
		paymentTxHash?: string;
	}): Promise<any> {
		return this._httpWrapper.sendRequest("post", this._baseUrl + "/submit-review", data);
	}
}
