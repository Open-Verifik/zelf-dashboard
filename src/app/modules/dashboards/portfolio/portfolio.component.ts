import { ChangeDetectionStrategy, Component, ViewEncapsulation } from "@angular/core";
import { RouterModule } from "@angular/router";

@Component({
	selector: "portfolio",
	templateUrl: "./portfolio.component.html",
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterModule],
})
export class PortfolioComponent {}
