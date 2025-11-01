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
	selector: "app-tag-lease-lengths-chart",
	standalone: true,
	imports: [CommonModule, NgApexchartsModule],
	templateUrl: "./tag-lease-lengths-chart.component.html",
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagLeaseLengthsChartComponent implements OnInit, OnChanges {
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
		const result = this._calculateLeaseBuckets();
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
			colors: ["#3182CE", "#63B3ED", "#90CDF4", "#BEE3F8", "#DBEAFE", "#EFF6FF"],
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
					return `<div class="flex flex-col px-3 py-2">
                                                    <div class="flex items-center">
                                                        <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
                                                        <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]}</div>
                                                    </div>
                                                    <div class="ml-5 mt-1 text-sm text-gray-400">${count} ${count === 1 ? "tag" : "tags"} • ${percentage}%</div>
                                                </div>`;
				},
			},
		};

		this._cdr.markForCheck();
	}

	private _parseDateToDate(s?: string): Date | null {
		if (!s) return null;
		try {
			if (s.includes(" ") && !s.includes("T")) {
				const [datePart, timePart] = s.split(" ");
				const [year, month, day] = datePart.split("-").map(Number);
				const [hour, minute, second] = timePart.split(":").map(Number);
				return new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
			}
			const d = new Date(s);
			return isNaN(d.getTime()) ? null : d;
		} catch {
			return null;
		}
	}

	private _calculateLeaseYears(registeredAt?: string, expiresAt?: string): number | null {
		if (!registeredAt || !expiresAt) return null;
		const regDate = this._parseDateToDate(registeredAt);
		const expDate = this._parseDateToDate(expiresAt);
		if (!regDate || !expDate) return null;
		const diffMs = expDate.getTime() - regDate.getTime();
		const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
		return years;
	}

	private _calculateLeaseBuckets(): { labels: string[]; series: number[]; counts: number[] } {
		const leaseBuckets: { [key: string]: number } = {
			"1": 0,
			"2": 0,
			"3": 0,
			"4": 0,
			"5": 0,
			lifetime: 0,
		};

		if (!this.records || this.records.length === 0) {
			const labels = ["1 Year", "2 Years", "3 Years", "4 Years", "5 Years", "Lifetime"];
			return { labels, series: [0, 0, 0, 0, 0, 0], counts: [0, 0, 0, 0, 0, 0] };
		}

		for (const r of this.records) {
			const years = this._calculateLeaseYears(r.registeredAt, r.expiresAt);
			if (years === null || years < 0.5) continue;

			if (years >= 0.5 && years < 2.0) {
				leaseBuckets["1"]++;
			} else if (years >= 2.0 && years < 3.0) {
				leaseBuckets["2"]++;
			} else if (years >= 3.0 && years < 4.0) {
				leaseBuckets["3"]++;
			} else if (years >= 4.0 && years < 5.0) {
				leaseBuckets["4"]++;
			} else if (years >= 5.0 && years < 100) {
				leaseBuckets["5"]++;
			} else if (years >= 100) {
				leaseBuckets.lifetime++;
			}
		}

		const labels = ["1 Year", "2 Years", "3 Years", "4 Years", "5 Years", "Lifetime"];
		const counts = [leaseBuckets["1"], leaseBuckets["2"], leaseBuckets["3"], leaseBuckets["4"], leaseBuckets["5"], leaseBuckets.lifetime];

		// Convert to percentages
		const total = counts.reduce((a, b) => a + b, 0);
		const series = total > 0 ? counts.map((c) => Math.round((c / total) * 10000) / 100) : counts;

		return { labels, series, counts };
	}
}
