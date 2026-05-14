import { inject, Injectable } from "@angular/core";
import { HttpWrapperService } from "app/http-wrapper.service";
import { environment } from "../../../environments/environment";

/** ZNS token symbol used to match in tokenHoldings.tokens[] from /api/solana/address. */
const ZNS_TOKEN_SYMBOL = "ZNS";

interface SolanaTokenHolding {
	symbol?: string;
	amount?: number | string;
	balance?: number | string;
	valueUsd?: number | string;
	[key: string]: unknown;
}

interface SolanaAddressResponse {
	data?: { tokenHoldings?: { tokens?: SolanaTokenHolding[] } };
	tokenHoldings?: { tokens?: SolanaTokenHolding[] };
}

@Injectable({ providedIn: "root" })
export class SolanaService {
	private _httpWrapper = inject(HttpWrapperService);

	/**
	 * Get the current Solana address summary (mirrors zelf-extension `getWalletDetails`).
	 * Endpoint: GET /api/solana/address/:id (JWT-protected). `source=oklink` matches the extension's preferred provider.
	 */
	async getAddressSummary(address: string, source: string = "oklink"): Promise<SolanaAddressResponse> {
		const url = `${environment.apiUrl}/api/solana/address/${address}`;
		return this._httpWrapper.sendRequest("get", url, { source });
	}

	/**
	 * Read ZNS balance for a Solana address by scanning `tokenHoldings.tokens[]` for `symbol === "ZNS"`.
	 * Returns 0 when the address is missing the token account or the upstream provider doesn't surface it.
	 */
	async getZnsBalance(address: string): Promise<number> {
		if (!address) return 0;

		try {
			const response = await this.getAddressSummary(address);
			const tokens = response?.data?.tokenHoldings?.tokens ?? response?.tokenHoldings?.tokens ?? [];
			const znsToken = Array.isArray(tokens)
				? tokens.find((t) => (t.symbol || "").toUpperCase() === ZNS_TOKEN_SYMBOL)
				: null;
			const raw = znsToken?.amount ?? znsToken?.balance ?? 0;
			const amount = typeof raw === "number" ? raw : parseFloat(String(raw));
			return Number.isFinite(amount) ? amount : 0;
		} catch (error) {
			console.warn("Failed to load ZNS balance:", error);
			return 0;
		}
	}
}
