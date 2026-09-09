/**
 * Backend API error `code` values (JSON body) → Transloco keys under `errors.api.*`.
 * Add explicit entries per code; unknown `ERR_FACE_*` uses ERR_FACE_VERIFICATION.
 */
const API_ERROR_CODE_TO_TRANSLOCO: Record<string, string> = {
	ERR_LIVENESS_FAILED: "errors.api.ERR_LIVENESS_FAILED",
	ERR_INVALID_IMAGE: "errors.api.ERR_INVALID_IMAGE",
	ERR_INVALID_SENSEPRINT_BYTES: "errors.api.ERR_INVALID_SENSEPRINT_BYTES",
	ERR_PASSWORD_REQUIRED: "errors.api.ERR_PASSWORD_REQUIRED",
};

export function translocoKeyForApiErrorCode(code: string | undefined): string | null {
	if (!code) return null;
	const key = API_ERROR_CODE_TO_TRANSLOCO[code];
	if (key) return key;
	if (code.startsWith("ERR_FACE_")) return "errors.api.ERR_FACE_VERIFICATION";
	return null;
}

export function apiErrorTextAndCode(error: unknown): { text: string; code?: string } {
	const err = error as { error?: unknown; message?: string; code?: string };
	const body = err?.error;
	if (body && typeof body === "object" && !Array.isArray(body)) {
		const record = body as { message?: unknown; code?: unknown };
		return {
			text: typeof record.message === "string" ? record.message : "",
			code: typeof record.code === "string" ? record.code : undefined,
		};
	}
	if (typeof body === "string") {
		try {
			const parsed = JSON.parse(body) as { message?: unknown; code?: unknown };
			if (parsed && typeof parsed === "object") {
				return {
					text: typeof parsed.message === "string" ? parsed.message : "",
					code: typeof parsed.code === "string" ? parsed.code : undefined,
				};
			}
		} catch {
			return { text: body };
		}
	}
	return {
		text: typeof err?.message === "string" ? err.message : "",
		code: typeof err?.code === "string" ? err.code : undefined,
	};
}

export function isBiometricApiError(error: unknown): boolean {
	const { text, code } = apiErrorTextAndCode(error);
	const lower = text.toLowerCase();
	if (code && (code === "ERR_LIVENESS_FAILED" || code.includes("FACE_") || code.startsWith("ERR_FACE_"))) {
		return true;
	}
	return (
		lower.includes("multiple face") ||
		lower.includes("no face detected") ||
		lower.includes("face not recognized") ||
		lower.includes("face quality") ||
		lower.includes("face is not central") ||
		lower.includes("not central") ||
		lower.includes("liveness") ||
		lower.includes("face too small") ||
		lower.includes("face too large") ||
		lower.includes("close to border")
	);
}
