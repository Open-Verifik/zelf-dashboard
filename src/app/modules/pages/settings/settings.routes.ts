import { Routes } from "@angular/router";
import { SettingsComponent } from "app/modules/pages/settings/settings.component";

export default [
	{
		path: "",
		component: SettingsComponent,
		children: [
			{
				path: "",
				redirectTo: "license",
				pathMatch: "full",
			},
			{
				path: "license",
				loadComponent: () => import("app/modules/pages/settings/license/license.component").then((m) => m.SettingsLicenseComponent),
			},
			{
				path: "security",
				loadComponent: () => import("app/modules/pages/settings/security/security.component").then((m) => m.SettingsSecurityComponent),
			},
			{
				path: "plan-billing",
				loadComponent: () =>
					import("app/modules/pages/settings/plan-billing/plan-billing.component").then((m) => m.SettingsPlanBillingComponent),
			},
			{
				path: "notifications",
				loadComponent: () =>
					import("app/modules/pages/settings/notifications/notifications.component").then((m) => m.SettingsNotificationsComponent),
			},
			{
				path: "team",
				loadComponent: () => import("app/modules/pages/settings/team/team.component").then((m) => m.SettingsTeamComponent),
			},
		],
	},
] as Routes;
