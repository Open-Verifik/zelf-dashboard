import { Routes } from "@angular/router";
import { PortfolioComponent } from "app/modules/dashboards/portfolio/portfolio.component";

export default [
	{
		path: "",
		component: PortfolioComponent,
		children: [
			{
				path: "",
				redirectTo: "my-tags",
				pathMatch: "full",
			},
			{
				path: "my-tags",
				loadComponent: () => import("app/modules/dashboards/portfolio/my-tags/my-tags.component").then((m) => m.PortfolioMyTagsComponent),
			},
			{
				path: "discover",
				loadComponent: () => import("app/modules/dashboards/portfolio/discover/discover.component").then((m) => m.PortfolioDiscoverComponent),
			},
		],
	},
] as Routes;
