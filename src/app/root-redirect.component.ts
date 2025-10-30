import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { environment } from "environments/environment";

@Component({
	standalone: true,
	selector: "app-root-redirect",
	template: "",
	imports: [CommonModule],
})
export class RootRedirectComponent implements OnInit {
	constructor(private router: Router) {}

	ngOnInit(): void {
		try {
			const host = window?.location?.host || "";
			const cfg = (environment as any)?.rootRedirect || {};
			const enabled = cfg.enabled !== false; // default true
			const shouldMatchHost = !!cfg.host;
			const hostMatches = shouldMatchHost ? host === cfg.host : false;

			const target = enabled && hostMatches ? cfg.path || "/portfolio/payment" : cfg.fallbackPath || "/analytics";

			// Use replaceUrl so history doesn't keep the blank route
			this.router.navigateByUrl(target, { replaceUrl: true });
		} catch {
			this.router.navigateByUrl("/analytics", { replaceUrl: true });
		}
	}
}
