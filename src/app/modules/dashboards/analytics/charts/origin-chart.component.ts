import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, OnChanges, SimpleChanges, ViewEncapsulation } from "@angular/core";
import { ApexOptions, NgApexchartsModule } from "ng-apexcharts";
import { TranslocoService } from "@jsverse/transloco";

interface TagRecord {
	name: string;
	type: string;
	origin: string;
	registeredAt?: string;
	expiresAt?: string;
}

@Component({
	selector: "app-origin-chart",
	standalone: true,
	imports: [CommonModule, NgApexchartsModule],
	templateUrl: "./origin-chart.component.html",
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OriginChartComponent implements OnInit, OnChanges {
	@Input() records: TagRecord[] = [];

	chartOptions: ApexOptions = {
		chart: { type: "donut" },
		series: [],
	};
	labels: string[] = [];
	series: number[] = [];
	counts: number[] = []; // Actual counts for each bucket

	constructor(
		private _translocoService: TranslocoService,
		private _cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this._updateChart();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes["records"]) {
			this._updateChart();
		}
	}

	private _updateChart(): void {
		const result = this._calculateOriginBuckets();
		this.labels = result.labels || [];
		this.series = result.series || [];
		this.counts = result.counts || [];

		this.chartOptions = {
			chart: {
				animations: {
					speed: 400,
					animateGradually: {
						enabled: false,
					},
				},
				fontFamily: "inherit",
				foreColor: "inherit",
				width: "100%",
				height: 180,
				type: "donut",
				sparkline: {
					enabled: true,
				},
			},
			colors: ["#DD6B20", "#F6AD55", "#FED7AA"],
			labels: this.labels || [],
			plotOptions: {
				pie: {
					customScale: 0.9,
					expandOnClick: false,
					donut: {
						size: "70%",
					},
				},
			},
			series: this.series || [],
			states: {
				hover: {
					filter: {
						type: "none",
					},
				},
				active: {
					filter: {
						type: "none",
					},
				},
			},
			tooltip: {
				enabled: true,
				fillSeriesColor: false,
				theme: "dark",
				custom: ({ seriesIndex, w }): string => {
					const count = this.counts[seriesIndex] || 0;
					const percentage = w.config.series[seriesIndex] || 0;
					const label = this._formatOriginLabel(w.config.labels[seriesIndex] || "");
					return `<div class="flex flex-col px-3 py-2">
                                                    <div class="flex items-center">
                                                        <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
                                                        <div class="ml-2 text-md leading-none">${label}</div>
                                                    </div>
                                                    <div class="ml-5 mt-1 text-sm text-gray-400">${count} ${count === 1 ? "tag" : "tags"} • ${percentage}%</div>
                                                </div>`;
				},
			},
		};

		this._cdr.markForCheck();
	}

	private _formatOriginLabel(origin: string): string {
		if (!origin || origin === "unknown") return "Unknown";
		// Capitalize first letter and format nicely
		return origin.charAt(0).toUpperCase() + origin.slice(1).toLowerCase();
	}

	private _calculateOriginBuckets(): { labels: string[]; series: number[]; counts: number[] } {
		const originBuckets = new Map<string, number>();

		if (!this.records || this.records.length === 0) {
			// Return empty arrays but ensure valid structure
			return { labels: [], series: [], counts: [] };
		}

		for (const r of this.records) {
			const origin = r.origin || "unknown";
			originBuckets.set(origin, (originBuckets.get(origin) || 0) + 1);
		}

		const labels = Array.from(originBuckets.keys());
		const counts = labels.map((k) => originBuckets.get(k) || 0);

		// Convert to percentages
		const total = counts.reduce((a, b) => a + b, 0);
		const series = total > 0 ? counts.map((c) => Math.round((c / total) * 10000) / 100) : counts;

		return { labels, series, counts };
	}
}
