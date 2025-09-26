import { Injectable } from "@angular/core";
import { HttpWrapperService } from "../../http-wrapper.service";
import { environment } from "../../../environments/environment";

export interface TagSearchParams {
	tagName?: string;
	domain?: string;
	key?: string;
	value?: string;
	os?: string;
	captchaToken?: string;
}

export interface DomainSearchParams {
	domain: string;
	storage: string;
	limit?: number;
	offset?: number;
}

export interface TagSearchResponse {
	data: {
		available: boolean;
		tagName: string;
		domain?: string;
		ipfs?: any[];
		arweave?: any[];
		tagObject?: {
			id: string;
			cid: string;
			size: number;
			mime_type?: string;
			created_at: string;
			url: string;
			publicData: {
				avaxName: string;
				btcAddress: string;
				domain: string;
				ethAddress: string;
				extraParams: string;
				solanaAddress: string;
			};
		};
		price?: {
			price: number;
			currency: string;
			reward: number;
			discount: number;
			priceWithoutDiscount: number;
			discountType: string;
		};
	};
}

export interface DomainSearchResponse {
	data: any[];
	total?: number;
	limit?: number;
	offset?: number;
}

@Injectable({
	providedIn: "root",
})
export class TagsService {
	private readonly baseUrl = `${environment.apiUrl}/api/tags`;

	constructor(private httpWrapper: HttpWrapperService) {}

	/**
	 * Search for a tag by name
	 * @param params Search parameters
	 * @returns Promise of search response
	 */
	searchTag(params: TagSearchParams): Promise<TagSearchResponse> {
		const queryParams = this.buildQueryParams(params);
		return this.httpWrapper.sendRequest("get", `${this.baseUrl}/search`, queryParams);
	}

	/**
	 * Search tags by domain
	 * @param params Domain search parameters
	 * @returns Promise of domain search response
	 */
	searchByDomain(params: DomainSearchParams): Promise<DomainSearchResponse> {
		const queryParams = this.buildQueryParams(params);
		return this.httpWrapper.sendRequest("get", `${this.baseUrl}/search-by-domain`, queryParams);
	}

	/**
	 * Build query parameters from object
	 * @param params Parameters object
	 * @returns Query parameters object
	 */
	private buildQueryParams(params: any): any {
		const queryParams: any = {};

		Object.keys(params).forEach((key) => {
			if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
				queryParams[key] = params[key];
			}
		});

		return queryParams;
	}
}
