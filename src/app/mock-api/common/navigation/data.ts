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
