import { Injectable } from "@angular/core";
import { HttpWrapperService } from "../../../../http-wrapper.service";
import { environment } from "../../../../../environments/environment";

export interface LicenseResponse {
	data: {
		myLicense: any;
		zelfAccount: any;
	};
}

const MY_LICENSE_TTL_MS = 5 * 60 * 1000;

@Injectable({
	providedIn: "root",
})
export class LicenseService {
	private readonly baseUrl = `${environment.apiUrl}/api/license`;
	private readonly _myLicenseCache = new Map<string, { expiresAt: number; value: LicenseResponse }>();
	private readonly _myLicenseInflight = new Map<string, Promise<LicenseResponse>>();

	constructor(private httpWrapper: HttpWrapperService) {}

	/**
	 * Get user's own license
	 * @returns Promise of license response
	 */
	getMyLicense(withJSON: boolean = false): Promise<LicenseResponse> {
		const key = withJSON ? "json" : "plain";
		const cached = this._myLicenseCache.get(key);

		if (cached && cached.expiresAt > Date.now()) {
			return Promise.resolve(cached.value);
		}

		const inflight = this._myLicenseInflight.get(key);

		if (inflight) return inflight;

		const request = this.httpWrapper
			.sendRequest("get", `${this.baseUrl}/my-license`, { withJSON })
			.then((response: LicenseResponse) => {
				this._myLicenseCache.set(key, { expiresAt: Date.now() + MY_LICENSE_TTL_MS, value: response });
				this._myLicenseInflight.delete(key);
				return response;
			})
			.catch((error: unknown) => {
				this._myLicenseInflight.delete(key);
				throw error;
			});

		this._myLicenseInflight.set(key, request);

		return request;
	}

	/**
	 * Create or update license
	 * @param licenseData License data to create/update
	 * @returns Promise of license response
	 */
	createOrUpdateLicense(licenseData: any): Promise<any> {
		return this.httpWrapper.sendRequest("post", this.baseUrl, licenseData).then((response: any) => {
			this._clearMyLicenseCache();
			return response;
		});
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
		return this.httpWrapper.sendRequest("delete", `${this.baseUrl}/${ipfsHash}`).then((response: any) => {
			this._clearMyLicenseCache();
			return response;
		});
	}

	private _clearMyLicenseCache(): void {
		this._myLicenseCache.clear();
		this._myLicenseInflight.clear();
	}
}
