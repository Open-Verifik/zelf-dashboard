/**
 * Analytics dashboard strings merged after `/i18n/{lang}.json` loads.
 * Rebrands tag copy to Zelf IDs and adds keys used by the live analytics dashboard.
 */

const ANALYTICS_ONBOARDING_EN = {
	eyebrow: "Setup",
	title: "Complete your domain setup",
	subtitle: "Finish these steps to unlock analytics and start tracking Zelf ID activity.",
	progress: "{{completed}} of {{total}} complete",
	optional: "Optional",
	open: "Open",
	lockedPreview: "Analytics charts unlock after setup is complete.",
	routes: {
		settings: "Settings",
		billing: "Billing",
		playArea: "Play Area",
		tags: "Zelf IDs",
		zelfKeys: "ZelfKeys",
	},
	steps: {
		license: {
			title: "Create your license & pick your extension",
			description: "Set up your domain (.zelf, .john, .star, …) before configuring ZNS or billing.",
		},
		zelfNameService: {
			title: "Configure Zelf Name Service",
			description: "Set pricing, validation rules, payment networks, and storage for your Zelf IDs.",
		},
		themeStyles: {
			title: "Customize theme & styles",
			description: "Apply your brand colors and styles to ZNS and checkout flows.",
		},
		subscription: {
			title: "Subscribe to a plan",
			description: "Activate a subscription to receive ZNS credits for HumanAuthn and tag flows.",
		},
		playCreate: {
			title: "Play Area: Create with HumanAuthn",
			description: "Encrypt a test credential and run the ZNS 402 payment flow. Completes after a successful encrypt.",
		},
		playPreview: {
			title: "Play Area: Preview",
			description: "Inspect a ZelfProof without decrypting cleartext data. Completes after a successful preview.",
		},
		playDecrypt: {
			title: "Play Area: Decrypt",
			description: "Complete the loop with selfie verification and proof decryption. Completes after a successful decrypt.",
		},
		firstZelfId: {
			title: "Register a first test Zelf ID",
			description: "Create at least one Zelf ID so analytics can show real activity.",
		},
		zelfKeys: {
			title: "Explore ZelfKeys",
			description: "Tour encrypted storage for passwords, notes, and OTP secrets.",
		},
	},
};

export const ANALYTICS_I18N_OVERLAYS: Record<string, Record<string, unknown>> = {
	en: {
		analytics: {
			description: "Monitor Zelf ID creation, subscriptions and activity metrics",
			tagDomainsOverview: {
				title: "Zelf IDs Overview",
				subtitle: "Number of Zelf IDs created (free and premium)",
			},
			paidTags: {
				title: "Paid Zelf IDs",
				subtitle: "Number of premium Zelf IDs created in the last 30 days",
			},
			activeTags: {
				title: "Active Zelf IDs",
				subtitle: "Number of currently active Zelf IDs",
			},
			allTagsVsPaidTags: {
				title: "All Zelf IDs vs. Paid Zelf IDs",
				subtitle: "Comparison between total and paid Zelf IDs",
			},
			metrics: {
				conversionRate: {
					description:
						"Conversion rate shows the percentage of total Zelf ID registrations that convert to paid/premium Zelf IDs. Higher is better.",
				},
				premiumAdoption: {
					description:
						"Premium Adoption shows the percentage of new Zelf ID registrations in the last 30 days that are paid/premium. Higher indicates better monetization.",
				},
				newPaidZelfIds: {
					title: "New Paid Zelf IDs",
					description: "Count of paid/premium Zelf IDs registered in the last 30 days.",
				},
			},
			tagLeaseLengths: {
				title: "Zelf ID Lease Lengths",
				subtitle: "Distribution of Zelf ID lease durations",
			},
			domainLength: {
				subtitle: "Distribution of Zelf ID name lengths",
			},
			chart: {
				allTags: "All Zelf IDs",
				paidTags: "Paid Zelf IDs",
				tag: "Zelf ID",
				tags: "Zelf IDs",
			},
			stats: {
				tags: "Zelf IDs",
				vsPreviousPeriod: "vs previous period",
				loading: "Loading analytics...",
			},
			chartData: {
				allTags: "All Zelf IDs",
				paidTags: "Paid Zelf IDs",
				tag: "Zelf ID",
				tags: "Zelf IDs",
			},
			onboarding: ANALYTICS_ONBOARDING_EN,
		},
	},
	es: {
		analytics: {
			description: "Supervise la creación de Zelf IDs, suscripciones y métricas de actividad",
			tagDomainsOverview: {
				title: "Resumen de Zelf IDs",
				subtitle: "Número de Zelf IDs creados (gratuitos y premium)",
			},
			paidTags: {
				title: "Zelf IDs de pago",
				subtitle: "Número de Zelf IDs premium creados en los últimos 30 días",
			},
			activeTags: {
				title: "Zelf IDs activos",
				subtitle: "Número de Zelf IDs actualmente activos",
			},
			allTagsVsPaidTags: {
				title: "Todos los Zelf IDs vs. Zelf IDs de pago",
				subtitle: "Comparación entre Zelf IDs totales y de pago",
			},
			metrics: {
				conversionRate: {
					description:
						"La tasa de conversión muestra el porcentaje de registros de Zelf IDs que se convierten en Zelf IDs de pago/premium. Más alto es mejor.",
				},
				premiumAdoption: {
					description:
						"La adopción premium muestra el porcentaje de nuevos registros de Zelf IDs en los últimos 30 días que son de pago/premium.",
				},
				newPaidZelfIds: {
					title: "Nuevos Zelf IDs de pago",
					description: "Cantidad de Zelf IDs de pago/premium registrados en los últimos 30 días.",
				},
			},
			tagLeaseLengths: {
				title: "Duración de arrendamiento de Zelf IDs",
				subtitle: "Distribución de duraciones de arrendamiento de Zelf IDs",
			},
			domainLength: {
				subtitle: "Distribución de longitudes de nombre de Zelf ID",
			},
			chart: {
				allTags: "Todos los Zelf IDs",
				paidTags: "Zelf IDs de pago",
				tag: "Zelf ID",
				tags: "Zelf IDs",
			},
			stats: {
				tags: "Zelf IDs",
				vsPreviousPeriod: "vs periodo anterior",
				loading: "Cargando analíticas...",
			},
			chartData: {
				allTags: "Todos los Zelf IDs",
				paidTags: "Zelf IDs de pago",
				tag: "Zelf ID",
				tags: "Zelf IDs",
			},
			onboarding: {
				eyebrow: "Configuración",
				title: "Complete la configuración de su dominio",
				subtitle: "Finalice estos pasos para desbloquear analíticas y rastrear la actividad de Zelf IDs.",
				progress: "{{completed}} de {{total}} completados",
				optional: "Opcional",
				open: "Abrir",
				lockedPreview: "Los gráficos de analíticas se desbloquean al completar la configuración.",
				routes: {
					settings: "Ajustes",
					billing: "Facturación",
					playArea: "Play Area",
					tags: "Zelf IDs",
					zelfKeys: "ZelfKeys",
				},
				steps: {
					license: {
						title: "Cree su licencia y elija su extensión",
						description: "Configure su dominio (.zelf, .john, .star, …) antes de ZNS o facturación.",
					},
					zelfNameService: {
						title: "Configure Zelf Name Service",
						description: "Defina precios, reglas de validación, redes de pago y almacenamiento.",
					},
					themeStyles: {
						title: "Personalice tema y estilos",
						description: "Aplique los colores de marca a los flujos ZNS y de checkout.",
					},
					subscription: {
						title: "Suscríbase a un plan",
						description: "Active una suscripción para recibir créditos ZNS para HumanAuthn y tags.",
					},
					playCreate: {
						title: "Play Area: Crear con HumanAuthn",
						description: "Cifre una credencial de prueba y ejecute el flujo de pago ZNS 402.",
					},
					playPreview: {
						title: "Play Area: Vista previa",
						description: "Inspeccione un ZelfProof sin descifrar datos en claro.",
					},
					playDecrypt: {
						title: "Play Area: Descifrar",
						description: "Complete el ciclo con verificación selfie y descifrado del proof.",
					},
					firstZelfId: {
						title: "Registre un primer Zelf ID de prueba",
						description: "Cree al menos un Zelf ID para que las analíticas muestren actividad real.",
					},
					zelfKeys: {
						title: "Explore ZelfKeys",
						description: "Conozca el almacenamiento cifrado de contraseñas, notas y OTP.",
					},
				},
			},
		},
	},
	fr: {
		analytics: {
			description: "Suivez la création de Zelf IDs, les abonnements et les métriques d'activité",
			tagDomainsOverview: {
				title: "Aperçu des Zelf IDs",
				subtitle: "Nombre de Zelf IDs créés (gratuits et premium)",
			},
			paidTags: {
				title: "Zelf IDs payants",
				subtitle: "Nombre de Zelf IDs premium créés au cours des 30 derniers jours",
			},
			activeTags: {
				title: "Zelf IDs actifs",
				subtitle: "Nombre de Zelf IDs actuellement actifs",
			},
			allTagsVsPaidTags: {
				title: "Tous les Zelf IDs vs. Zelf IDs payants",
				subtitle: "Comparaison entre Zelf IDs totaux et payants",
			},
			metrics: {
				conversionRate: {
					description:
						"Le taux de conversion indique le pourcentage d'enregistrements de Zelf IDs convertis en Zelf IDs payants/premium. Plus c'est élevé, mieux c'est.",
				},
				premiumAdoption: {
					description:
						"L'adoption premium indique le pourcentage de nouveaux enregistrements de Zelf IDs au cours des 30 derniers jours qui sont payants/premium.",
				},
				newPaidZelfIds: {
					title: "Nouveaux Zelf IDs payants",
					description: "Nombre de Zelf IDs payants/premium enregistrés au cours des 30 derniers jours.",
				},
			},
			tagLeaseLengths: {
				title: "Durées de bail des Zelf IDs",
				subtitle: "Répartition des durées de bail des Zelf IDs",
			},
			domainLength: {
				subtitle: "Répartition des longueurs de nom de Zelf ID",
			},
			chart: {
				allTags: "Tous les Zelf IDs",
				paidTags: "Zelf IDs payants",
				tag: "Zelf ID",
				tags: "Zelf IDs",
			},
			stats: {
				tags: "Zelf IDs",
				vsPreviousPeriod: "vs période précédente",
				loading: "Chargement des analyses...",
			},
			chartData: {
				allTags: "Tous les Zelf IDs",
				paidTags: "Zelf IDs payants",
				tag: "Zelf ID",
				tags: "Zelf IDs",
			},
			onboarding: {
				eyebrow: "Configuration",
				title: "Terminez la configuration de votre domaine",
				subtitle: "Complétez ces étapes pour débloquer les analyses et suivre l'activité des Zelf IDs.",
				progress: "{{completed}} sur {{total}} terminées",
				optional: "Optionnel",
				open: "Ouvrir",
				lockedPreview: "Les graphiques d'analyse se débloquent une fois la configuration terminée.",
				routes: {
					settings: "Paramètres",
					billing: "Facturation",
					playArea: "Play Area",
					tags: "Zelf IDs",
					zelfKeys: "ZelfKeys",
				},
				steps: {
					license: {
						title: "Créez votre licence et choisissez votre extension",
						description: "Configurez votre domaine (.zelf, .john, .star, …) avant ZNS ou la facturation.",
					},
					zelfNameService: {
						title: "Configurez Zelf Name Service",
						description: "Définissez tarifs, règles de validation, réseaux de paiement et stockage.",
					},
					themeStyles: {
						title: "Personnalisez le thème et les styles",
						description: "Appliquez votre marque aux flux ZNS et de paiement.",
					},
					subscription: {
						title: "Abonnez-vous à un plan",
						description: "Activez un abonnement pour recevoir des crédits ZNS pour HumanAuthn et les tags.",
					},
					playCreate: {
						title: "Play Area : Créer avec HumanAuthn",
						description: "Chiffrez une credential de test et exécutez le flux de paiement ZNS 402.",
					},
					playPreview: {
						title: "Play Area : Aperçu",
						description: "Inspectez un ZelfProof sans déchiffrer les données en clair.",
					},
					playDecrypt: {
						title: "Play Area : Déchiffrer",
						description: "Terminez la boucle avec vérification selfie et déchiffrement du proof.",
					},
					firstZelfId: {
						title: "Enregistrez un premier Zelf ID de test",
						description: "Créez au moins un Zelf ID pour afficher une activité réelle dans les analyses.",
					},
					zelfKeys: {
						title: "Explorez ZelfKeys",
						description: "Découvrez le stockage chiffré pour mots de passe, notes et OTP.",
					},
				},
			},
		},
	},
	ja: {
		analytics: {
			description: "Zelf IDの作成、サブスクリプション、アクティビティ指標を監視",
			tagDomainsOverview: {
				title: "Zelf ID 概要",
				subtitle: "作成された Zelf ID の数（無料およびプレミアム）",
			},
			paidTags: {
				title: "有料 Zelf ID",
				subtitle: "過去30日間に作成されたプレミアム Zelf ID の数",
			},
			activeTags: {
				title: "アクティブ Zelf ID",
				subtitle: "現在アクティブな Zelf ID の数",
			},
			allTagsVsPaidTags: {
				title: "すべての Zelf ID vs. 有料 Zelf ID",
				subtitle: "総数と有料 Zelf ID の比較",
			},
			metrics: {
				conversionRate: {
					description: "コンバージョン率は、Zelf ID 登録のうち有料/プレミアム Zelf ID に変換された割合です。高いほど良いです。",
				},
				premiumAdoption: {
					description: "プレミアム採用率は、過去30日間の新規 Zelf ID 登録のうち有料/プレミアムの割合です。",
				},
				newPaidZelfIds: {
					title: "新規有料 Zelf ID",
					description: "過去30日間に登録された有料/プレミアム Zelf ID の数。",
				},
			},
			tagLeaseLengths: {
				title: "Zelf ID リース期間",
				subtitle: "Zelf ID リース期間の分布",
			},
			domainLength: {
				subtitle: "Zelf ID 名の長さの分布",
			},
			chart: {
				allTags: "すべての Zelf ID",
				paidTags: "有料 Zelf ID",
				tag: "Zelf ID",
				tags: "Zelf IDs",
			},
			stats: {
				tags: "Zelf IDs",
				vsPreviousPeriod: "前の期間比",
				loading: "分析を読み込み中...",
			},
			chartData: {
				allTags: "すべての Zelf ID",
				paidTags: "有料 Zelf ID",
				tag: "Zelf ID",
				tags: "Zelf IDs",
			},
			onboarding: {
				eyebrow: "セットアップ",
				title: "ドメイン設定を完了する",
				subtitle: "これらのステップを完了すると、分析が有効になり Zelf ID のアクティビティを追跡できます。",
				progress: "{{total}} 中 {{completed}} 完了",
				optional: "任意",
				open: "開く",
				lockedPreview: "セットアップ完了後に分析チャートが利用可能になります。",
				routes: {
					settings: "設定",
					billing: "請求",
					playArea: "Play Area",
					tags: "Zelf IDs",
					zelfKeys: "ZelfKeys",
				},
				steps: {
					license: {
						title: "ライセンスを作成し拡張子を選択",
						description: "ZNS や請求の前にドメイン（.zelf、.john、.star など）を設定します。",
					},
					zelfNameService: {
						title: "Zelf Name Service を設定",
						description: "価格、検証ルール、決済ネットワーク、ストレージを設定します。",
					},
					themeStyles: {
						title: "テーマとスタイルをカスタマイズ",
						description: "ZNS とチェックアウトフローにブランドカラーを適用します。",
					},
					subscription: {
						title: "プランに加入",
						description: "HumanAuthn とタグフロー用の ZNS クレジットを受け取るにはサブスクリプションを有効化します。",
					},
					playCreate: {
						title: "Play Area: HumanAuthn で作成",
						description: "テスト資格情報を暗号化し、ZNS 402 決済フローを実行します。",
					},
					playPreview: {
						title: "Play Area: プレビュー",
						description: "平文を復号せずに ZelfProof を確認します。",
					},
					playDecrypt: {
						title: "Play Area: 復号",
						description: "セルフィー検証と proof 復号でフルループを完了します。",
					},
					firstZelfId: {
						title: "最初のテスト Zelf ID を登録",
						description: "分析に実データを表示するには、少なくとも 1 つの Zelf ID を作成します。",
					},
					zelfKeys: {
						title: "ZelfKeys を探索",
						description: "パスワード、メモ、OTP の暗号化ストレージを確認します。",
					},
				},
			},
		},
	},
	ko: {
		analytics: {
			description: "Zelf ID 생성, 구독 및 활동 지표 모니터링",
			tagDomainsOverview: {
				title: "Zelf ID 개요",
				subtitle: "생성된 Zelf ID 수(무료 및 프리미엄)",
			},
			paidTags: {
				title: "유료 Zelf ID",
				subtitle: "최근 30일 동안 생성된 프리미엄 Zelf ID 수",
			},
			activeTags: {
				title: "활성 Zelf ID",
				subtitle: "현재 활성 Zelf ID 수",
			},
			allTagsVsPaidTags: {
				title: "전체 Zelf ID vs. 유료 Zelf ID",
				subtitle: "전체 및 유료 Zelf ID 비교",
			},
			metrics: {
				conversionRate: {
					description: "전환율은 전체 Zelf ID 등록 중 유료/프리미엄 Zelf ID로 전환된 비율입니다. 높을수록 좋습니다.",
				},
				premiumAdoption: {
					description: "프리미엄 채택률은 최근 30일간 새 Zelf ID 등록 중 유료/프리미엄 비율입니다.",
				},
				newPaidZelfIds: {
					title: "신규 유료 Zelf ID",
					description: "최근 30일 동안 등록된 유료/프리미엄 Zelf ID 수.",
				},
			},
			tagLeaseLengths: {
				title: "Zelf ID 임대 기간",
				subtitle: "Zelf ID 임대 기간 분포",
			},
			domainLength: {
				subtitle: "Zelf ID 이름 길이 분포",
			},
			chart: {
				allTags: "전체 Zelf ID",
				paidTags: "유료 Zelf ID",
				tag: "Zelf ID",
				tags: "Zelf IDs",
			},
			stats: {
				tags: "Zelf IDs",
				vsPreviousPeriod: "이전 기간 대비",
				loading: "분석 로딩 중...",
			},
			chartData: {
				allTags: "전체 Zelf ID",
				paidTags: "유료 Zelf ID",
				tag: "Zelf ID",
				tags: "Zelf IDs",
			},
			onboarding: {
				eyebrow: "설정",
				title: "도메인 설정 완료",
				subtitle: "다음 단계를 완료하면 분석이 잠금 해제되고 Zelf ID 활동을 추적할 수 있습니다.",
				progress: "{{total}}개 중 {{completed}}개 완료",
				optional: "선택",
				open: "열기",
				lockedPreview: "설정 완료 후 분석 차트를 사용할 수 있습니다.",
				routes: {
					settings: "설정",
					billing: "결제",
					playArea: "Play Area",
					tags: "Zelf IDs",
					zelfKeys: "ZelfKeys",
				},
				steps: {
					license: {
						title: "라이선스 생성 및 확장자 선택",
						description: "ZNS 또는 결제 전에 도메인(.zelf, .john, .star 등)을 설정합니다.",
					},
					zelfNameService: {
						title: "Zelf Name Service 구성",
						description: "가격, 검증 규칙, 결제 네트워크 및 스토리지를 설정합니다.",
					},
					themeStyles: {
						title: "테마 및 스타일 사용자 지정",
						description: "ZNS 및 결제 흐름에 브랜드 색상을 적용합니다.",
					},
					subscription: {
						title: "플랜 구독",
						description: "HumanAuthn 및 태그 흐름용 ZNS 크레딧을 받으려면 구독을 활성화하세요.",
					},
					playCreate: {
						title: "Play Area: HumanAuthn으로 생성",
						description: "테스트 자격 증명을 암호화하고 ZNS 402 결제 흐름을 실행합니다.",
					},
					playPreview: {
						title: "Play Area: 미리보기",
						description: "평문을 복호화하지 않고 ZelfProof를 검사합니다.",
					},
					playDecrypt: {
						title: "Play Area: 복호화",
						description: "셀피 검증 및 proof 복호화로 전체 루프를 완료합니다.",
					},
					firstZelfId: {
						title: "첫 테스트 Zelf ID 등록",
						description: "분석에 실제 활동을 표시하려면 Zelf ID를 하나 이상 만드세요.",
					},
					zelfKeys: {
						title: "ZelfKeys 탐색",
						description: "비밀번호, 메모, OTP의 암호화 저장소를 둘러봅니다.",
					},
				},
			},
		},
	},
	zh: {
		analytics: {
			description: "监控 Zelf ID 创建、订阅和活动指标",
			tagDomainsOverview: {
				title: "Zelf ID 概览",
				subtitle: "已创建的 Zelf ID 数量（免费和高级）",
			},
			paidTags: {
				title: "付费 Zelf ID",
				subtitle: "过去 30 天内创建的高级 Zelf ID 数量",
			},
			activeTags: {
				title: "活跃 Zelf ID",
				subtitle: "当前活跃的 Zelf ID 数量",
			},
			allTagsVsPaidTags: {
				title: "全部 Zelf ID vs. 付费 Zelf ID",
				subtitle: "全部与付费 Zelf ID 的对比",
			},
			metrics: {
				conversionRate: {
					description: "转化率显示 Zelf ID 注册中转为付费/高级 Zelf ID 的百分比。越高越好。",
				},
				premiumAdoption: {
					description: "高级采用率显示过去 30 天内新 Zelf ID 注册中为付费/高级的比例。",
				},
				newPaidZelfIds: {
					title: "新增付费 Zelf ID",
					description: "过去 30 天内注册的付费/高级 Zelf ID 数量。",
				},
			},
			tagLeaseLengths: {
				title: "Zelf ID 租期",
				subtitle: "Zelf ID 租期分布",
			},
			domainLength: {
				subtitle: "Zelf ID 名称长度分布",
			},
			chart: {
				allTags: "全部 Zelf ID",
				paidTags: "付费 Zelf ID",
				tag: "Zelf ID",
				tags: "Zelf IDs",
			},
			stats: {
				tags: "Zelf IDs",
				vsPreviousPeriod: "与上一周期相比",
				loading: "正在加载分析数据...",
			},
			chartData: {
				allTags: "全部 Zelf ID",
				paidTags: "付费 Zelf ID",
				tag: "Zelf ID",
				tags: "Zelf IDs",
			},
			onboarding: {
				eyebrow: "设置",
				title: "完成域名设置",
				subtitle: "完成以下步骤以解锁分析并开始跟踪 Zelf ID 活动。",
				progress: "已完成 {{completed}} / {{total}}",
				optional: "可选",
				open: "打开",
				lockedPreview: "完成设置后即可查看分析图表。",
				routes: {
					settings: "设置",
					billing: "账单",
					playArea: "Play Area",
					tags: "Zelf IDs",
					zelfKeys: "ZelfKeys",
				},
				steps: {
					license: {
						title: "创建许可证并选择扩展名",
						description: "在配置 ZNS 或账单之前设置您的域名（.zelf、.john、.star 等）。",
					},
					zelfNameService: {
						title: "配置 Zelf Name Service",
						description: "设置定价、验证规则、支付网络和存储。",
					},
					themeStyles: {
						title: "自定义主题和样式",
						description: "将品牌颜色应用到 ZNS 和结账流程。",
					},
					subscription: {
						title: "订阅计划",
						description: "激活订阅以获取 HumanAuthn 和标签流程所需的 ZNS 积分。",
					},
					playCreate: {
						title: "Play Area：使用 HumanAuthn 创建",
						description: "加密测试凭证并运行 ZNS 402 支付流程。",
					},
					playPreview: {
						title: "Play Area：预览",
						description: "在不解密明文的情况下检查 ZelfProof。",
					},
					playDecrypt: {
						title: "Play Area：解密",
						description: "通过自拍验证和 proof 解密完成完整流程。",
					},
					firstZelfId: {
						title: "注册第一个测试 Zelf ID",
						description: "至少创建一个 Zelf ID，分析才能显示真实活动。",
					},
					zelfKeys: {
						title: "探索 ZelfKeys",
						description: "了解密码、笔记和 OTP 的加密存储。",
					},
				},
			},
		},
	},
};

export function getAnalyticsI18nOverlay(lang: string): Record<string, unknown> {
	return ANALYTICS_I18N_OVERLAYS[lang] ?? ANALYTICS_I18N_OVERLAYS.en;
}
