import { Routes } from "@angular/router";

export default [
	{
		path: "",
		redirectTo: "lawyers",
		pathMatch: "full",
	},
	{
		path: "lawyers",
		loadComponent: () =>
			import("app/modules/zelf-legacy/lawyers/lawyers.component").then((m) => m.LawyersComponent),
	},
] as Routes;
