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
	selector: "app-domain-length-chart",
	standalone: true,
	imports: [CommonModule, NgApexchartsModule],
	templateUrl: "./domain-length-chart.component.html",
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DomainLengthChartComponent implements OnInit, OnChanges {
	@Input() records: TagRecord[] = [];
	@Input() currentDomain: string | null = null;

	chartOptions: ApexOptions = {
		chart: { type: "donut" },
		series: [],
	};
	labels: string[] = [];
	series: number[] = [];
	counts: number[] = []; // Actual counts for each bucket

	constructor(
		private _cdr: ChangeDetectorRef,
		private _translocoService: TranslocoService
	) {}

	ngOnInit(): void {
		this._updateChart();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes["records"] || changes["currentDomain"]) {
			this._updateChart();
		}
	}

	private _updateChart(): void {
		const result = this._calculateRangeBuckets();
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
			colors: ["#319795", "#4FD1C5", "#81E6D9", "#B2F5EA"],
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
					const charsLabel = this._translocoService.translate("analytics.chart.chars");
					const tagLabel = count === 1 
						? this._translocoService.translate("analytics.chart.tag") 
						: this._translocoService.translate("analytics.chart.tags");
					return `<div class="flex flex-col px-3 py-2">
                                                     <div class="flex items-center">
                                                         <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
                                                         <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]} ${charsLabel}</div>
                                                     </div>
                                                     <div class="ml-5 mt-1 text-sm text-gray-400">${count} ${tagLabel} • ${percentage}%</div>
                                                 </div>`;
				},
			},
		};

		this._cdr.markForCheck();
	}

	private _getBaseName(tagName: string): string {
		let name = tagName;
		if (this.currentDomain && name.endsWith(`.${this.currentDomain}`)) {
			name = name.slice(0, -1 * (this.currentDomain.length + 1));
		}
		if (name.endsWith(".hold")) name = name.slice(0, -5);
		return name.split(".")[0];
	}

	private _calculateRangeBuckets(): { labels: string[]; series: number[]; counts: number[] } {
		const rangeBuckets = { "1-3": 0, "4-10": 0, "11-20": 0, "21-27": 0 };

		if (!this.records || this.records.length === 0) {
			const labels = ["1-3", "4-10", "11-20", "21-27"];
			return { labels, series: [0, 0, 0, 0], counts: [0, 0, 0, 0] };
		}

		for (const r of this.records) {
			const len = this._getBaseName(r.name).length;
			if (len >= 1 && len <= 3) rangeBuckets["1-3"]++;
			else if (len >= 4 && len <= 10) rangeBuckets["4-10"]++;
			else if (len >= 11 && len <= 20) rangeBuckets["11-20"]++;
			else rangeBuckets["21-27"]++;
		}

		const labels = ["1-3", "4-10", "11-20", "21-27"];
		const counts = [rangeBuckets["1-3"], rangeBuckets["4-10"], rangeBuckets["11-20"], rangeBuckets["21-27"]];

		// Convert to percentages
		const total = counts.reduce((a, b) => a + b, 0);
		const series = total > 0 ? counts.map((c) => Math.round((c / total) * 10000) / 100) : counts;

		return { labels, series, counts };
	}
}
