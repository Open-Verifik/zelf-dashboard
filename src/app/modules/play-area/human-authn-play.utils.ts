export type HumanAuthnPlayStepId = "fill" | "send" | "pay" | "result";

export interface HumanAuthnPlayRailStep {
	id: HumanAuthnPlayStepId;
	label: string;
}

export interface HumanAuthnNextStep {
	label: string;
	path: string;
}

export const HUMAN_AUTHN_PLAY_RAIL: HumanAuthnPlayRailStep[] = [
	{ id: "fill", label: "Fill" },
	{ id: "send", label: "Send" },
	{ id: "pay", label: "Pay (402)" },
	{ id: "result", label: "Result" },
];

export const HUMAN_AUTHN_NEXT_CREATE: HumanAuthnNextStep = {
	label: "Create another",
	path: "/play-area/human-authn/create",
};

export const HUMAN_AUTHN_NEXT_PREVIEW: HumanAuthnNextStep = {
	label: "Preview public fields",
	path: "/play-area/human-authn/preview",
};

export const HUMAN_AUTHN_NEXT_DECRYPT: HumanAuthnNextStep = {
	label: "Decrypt secrets",
	path: "/play-area/human-authn/decrypt",
};

/**
 * Which rail step is current. Result wins, then 402 payment, then in-flight send.
 */
export function resolveHumanAuthnPlayStep(state: {
	loading: boolean;
	paymentRequired: boolean;
	response: unknown;
}): HumanAuthnPlayStepId {
	if (state.response) return "result";
	if (state.paymentRequired) return "pay";
	if (state.loading) return "send";
	return "fill";
}

/**
 * Truncate long face / proof strings so the live JSON stays readable.
 */
export function previewPayloadForDisplay(payload: Record<string, unknown> | null): Record<string, unknown> {
	if (!payload) return {};
	const out: Record<string, unknown> = { ...payload };
	for (const key of ["faceBase64", "zelfProof", "zelfID", "zelfIDQR"] as const) {
		const value = out[key];
		if (typeof value !== "string" || value.length < 64) continue;
		if (key === "faceBase64" && value.startsWith("data:")) {
			const comma = value.indexOf(",");
			const prefix = comma >= 0 ? value.slice(0, comma + 1) : "data:";
			out[key] = `${prefix}…[${value.length} chars]`;
			continue;
		}
		out[key] = `${value.slice(0, 28)}…[${value.length} chars]`;
	}
	return out;
}
