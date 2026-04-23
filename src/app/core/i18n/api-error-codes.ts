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
