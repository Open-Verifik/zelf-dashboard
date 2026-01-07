/* eslint-disable */
import { FuseNavigationItem } from "@fuse/components/navigation";

export const defaultNavigation: FuseNavigationItem[] = [
	{
		id: "analytics",
		title: "Analytics",
		type: "basic",
		icon: "heroicons_outline:chart-pie",
		link: "/analytics",
	},
	{
		id: "tags",
		title: "Tags",
		type: "basic",
		icon: "heroicons_outline:tag",
		link: "/tags",
	},
	{
		id: "zelfkeys",
		title: "ZelfKeys",
		type: "basic",
		icon: "heroicons_outline:key",
		link: "/zelfkeys",
	},
	{
		id: "play-area",
		title: "Play Area",
		type: "collapsable",
		icon: "heroicons_outline:beaker",
		children: [
			{
				id: "play-area.zelfproofs",
				title: "ZelfProofs",
				type: "basic",
				icon: "heroicons_outline:shield-check",
				link: "/play-area/zelfproofs",
			},
		],
	},
	{
		id: "settings",
		title: "Settings",
		type: "basic",
		icon: "heroicons_outline:cog",
		link: "/settings",
	},
];

export const portfolioNavigation: FuseNavigationItem[] = [
	{
		id: "my-tags",
		title: "My Tags",
		type: "basic",
		icon: "heroicons_outline:tag",
		link: "/portfolio/my-tags",
		hidden(item) {
			return true;
		},
	},
	{
		id: "payment",
		title: "Payment",
		type: "basic",
		icon: "heroicons_outline:credit-card",
		link: "/portfolio/payment",
	},
	{
		id: "discover",
		title: "Discover",
		type: "basic",
		icon: "heroicons_outline:globe-alt",
		link: "/portfolio/discover",
	},
];

export const horizontalNavigation: FuseNavigationItem[] = [
	{
		id: "analytics",
		title: "Analytics",
		type: "basic",
		icon: "heroicons_outline:chart-pie",
		link: "/analytics",
	},
	{
		id: "tags",
		title: "Tags",
		type: "basic",
		icon: "heroicons_outline:tag",
		link: "/tags",
	},
	{
		id: "zelfkeys",
		title: "ZelfKeys",
		type: "basic",
		icon: "heroicons_outline:key",
		link: "/zelfkeys",
	},
	{
		id: "play-area",
		title: "Play Area",
		type: "collapsable",
		icon: "heroicons_outline:beaker",
		children: [
			{
				id: "play-area.zelfproofs",
				title: "ZelfProofs",
				type: "basic",
				icon: "heroicons_outline:shield-check",
				link: "/play-area/zelfproofs",
			},
		],
	},
	{
		id: "settings",
		title: "Settings",
		type: "basic",
		icon: "heroicons_outline:cog",
		link: "/settings",
	},
];

export const horizontalPortfolioNavigation: FuseNavigationItem[] = [
	{
		id: "my-tags",
		title: "My Tags",
		type: "basic",
		icon: "heroicons_outline:tag",
		link: "/portfolio/my-tags",
		hidden(item) {
			return true;
		},
	},
	{
		id: "payment",
		title: "Payment",
		type: "basic",
		icon: "heroicons_outline:credit-card",
		link: "/portfolio/payment",
	},
	{
		id: "discover",
		title: "Discover",
		type: "basic",
		icon: "heroicons_outline:globe-alt",
		link: "/portfolio/discover",
		hidden(item) {
			return true;
		},
	},
];
