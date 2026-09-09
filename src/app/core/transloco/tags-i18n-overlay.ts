/**
 * Tags / Zelf IDs page strings merged after `/i18n/{lang}.json` loads.
 * Overrides root-owned public/i18n copy for the Zelf IDs rebrand.
 */
export const TAGS_I18N_OVERLAYS: Record<string, Record<string, unknown>> = {
	en: {
		tags: {
			title: "Zelf IDs Management",
			subtitle: "Manage your Zelf IDs created for your domain {{domain}}",
			subtitleDomainFallback: "your domain",
		},
	},
	es: {
		tags: {
			title: "Gestión de Zelf IDs",
			subtitle: "Administra tus Zelf IDs creados para tu dominio {{domain}}",
			subtitleDomainFallback: "tu dominio",
		},
	},
	fr: {
		tags: {
			title: "Gestion des Zelf IDs",
			subtitle: "Gérez vos Zelf IDs créés pour votre domaine {{domain}}",
			subtitleDomainFallback: "votre domaine",
		},
	},
	ja: {
		tags: {
			title: "Zelf ID 管理",
			subtitle: "ドメイン {{domain}} に作成された Zelf ID を管理",
			subtitleDomainFallback: "あなたのドメイン",
		},
	},
	ko: {
		tags: {
			title: "Zelf ID 관리",
			subtitle: "도메인 {{domain}}에 생성된 Zelf ID 관리",
			subtitleDomainFallback: "귀하의 도메인",
		},
	},
	zh: {
		tags: {
			title: "Zelf ID 管理",
			subtitle: "管理为您的域名 {{domain}} 创建的 Zelf ID",
			subtitleDomainFallback: "您的域名",
		},
	},
};

export function getTagsI18nOverlay(lang: string): Record<string, unknown> {
	return TAGS_I18N_OVERLAYS[lang] ?? TAGS_I18N_OVERLAYS.en;
}
