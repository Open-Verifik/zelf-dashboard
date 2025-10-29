import { ChangeDetectionStrategy, Component, ViewEncapsulation } from "@angular/core";

@Component({
	selector: "portfolio-my-tags",
	template: `
		<!-- Placeholder content -->
		<div class="w-full">
			<div class="bg-card rounded-2xl p-12 shadow">
				<h2 class="text-2xl font-semibold">My Tags</h2>
				<p class="mt-4 text-secondary">Content for My Tags page will go here.</p>
			</div>
		</div>
	`,
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioMyTagsComponent {}
