import { Injectable } from "@angular/core";
import { HttpWrapperService } from "../../../../http-wrapper.service";
import { environment } from "../../../../../environments/environment";

export interface LicenseResponse {
	data: {
		myLicense: any;
		zelfAccount: any;
	};
}

@Injectable({
	providedIn: "root",
})
export class LicenseService {
	private readonly baseUrl = `${environment.apiUrl}/api/license`;

	constructor(private httpWrapper: HttpWrapperService) {}

	/**
	 * Get user's own license
	 * @returns Promise of license response
	 */
	getMyLicense(withJSON: boolean = false): Promise<LicenseResponse> {
		return this.httpWrapper.sendRequest("get", `${this.baseUrl}/my-license`, { withJSON });
	}

	/**
	 * Create or update license
	 * @param licenseData License data to create/update
	 * @returns Promise of license response
	 */
	createOrUpdateLicense(licenseData: any): Promise<any> {
		return this.httpWrapper.sendRequest("post", this.baseUrl, licenseData);
	}

	/**
	 * Search for license by domain
	 * @param domain Domain to search for
	 * @returns Promise of license response
	 */
	searchLicense(domain: string): Promise<any> {
		return this.httpWrapper.sendRequest("get", this.baseUrl, { domain });
	}

	/**
	 * Delete license by IPFS hash
	 * @param ipfsHash IPFS hash of the license to delete
	 * @returns Promise of delete response
	 */
	deleteLicense(ipfsHash: string): Promise<any> {
		return this.httpWrapper.sendRequest("delete", `${this.baseUrl}/${ipfsHash}`);
	}
}
