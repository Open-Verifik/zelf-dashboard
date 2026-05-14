import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Translation, TranslocoLoader } from "@jsverse/transloco";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { PLAN_BILLING_PRICING_OVERLAY } from "./plan-billing-pricing-overlay";

function isPlainRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** Deep-merge translation trees (nested objects); patch replaces primitives and arrays. */
function deepMergeTranslations(base: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
	const out: Record<string, unknown> = { ...base };
	for (const key of Object.keys(patch)) {
		const patchVal = patch[key];
		const baseVal = out[key];
		if (isPlainRecord(patchVal) && isPlainRecord(baseVal)) {
			out[key] = deepMergeTranslations(baseVal, patchVal);
		} else {
			out[key] = patchVal;
		}
	}
	return out;
}

@Injectable({ providedIn: "root" })
export class TranslocoHttpLoader implements TranslocoLoader {
	private _httpClient = inject(HttpClient);

	/**
	 * Load `/i18n/{lang}.json`, then merge bundled Plan & Billing pricing strings (no separate overlay HTTP).
	 */
	getTranslation(lang: string): Observable<Translation> {
		return this._httpClient.get<Translation>(`/i18n/${lang}.json`).pipe(
			map((base) =>
				deepMergeTranslations(base as Record<string, unknown>, PLAN_BILLING_PRICING_OVERLAY) as Translation,
			),
		);
	}
}
