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
	selector: "app-visitors-vs-page-views-chart",
	standalone: true,
	imports: [CommonModule, NgApexchartsModule],
	templateUrl: "./visitors-vs-page-views-chart.component.html",
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitorsVsPageViewsChartComponent implements OnInit, OnChanges {
	@Input() records: TagRecord[] = [];

	chartOptions: ApexOptions = {
		chart: { type: "area" },
		series: [],
	};

	private yAxisMin: number = 0;
	private yAxisMax: number = 10;

	constructor(
		private _translocoService: TranslocoService,
		private _cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		// Initialize chart even if records are empty
		this._updateChart();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes["records"]) {
			this._updateChart();
		}
	}

	private _updateChart(): void {
		// Process records into series
		const series = this._buildSeries();

		// Calculate y-axis range
		if (series.length > 0) {
			const range = this._calculateYAxisRangeFromSeries(series);
			this.yAxisMin = range.min;
			this.yAxisMax = range.max;
		} else {
			// Default range if no series
			this.yAxisMin = 0;
			this.yAxisMax = 5;
		}

		this.chartOptions = {
			chart: {
				animations: {
					enabled: false,
				},
				fontFamily: "inherit",
				foreColor: "inherit",
				width: "100%",
				height: 320,
				type: "area",
				toolbar: {
					show: false,
				},
				zoom: {
					enabled: false,
				},
			},
			colors: ["#64748B", "#94A3B8"],
			dataLabels: {
				enabled: false,
			},
			fill: {
				colors: ["#64748B", "#94A3B8"],
				opacity: 0.5,
			},
			grid: {
				show: false,
				padding: {
					bottom: -40,
					left: 0,
					right: 0,
				},
			},
			legend: {
				show: false,
			},
			series: series || [],
			stroke: {
				curve: "smooth",
				width: 2,
			},
			tooltip: {
				followCursor: true,
				theme: "dark",
				x: {
					format: this._translocoService.translate("analytics.chart.dateFormat"),
				},
			},
			xaxis: {
				axisBorder: {
					show: false,
				},
				labels: {
					offsetY: -20,
					rotate: 0,
					style: {
						colors: "var(--fuse-text-secondary)",
					},
				},
				tickAmount: 3,
				tooltip: {
					enabled: false,
				},
				type: "datetime",
			},
			yaxis: {
				labels: {
					style: {
						colors: "var(--fuse-text-secondary)",
					},
				},
				min: this.yAxisMin,
				max: this.yAxisMax,
				show: false,
				tickAmount: 5,
			},
		};

		this._cdr.markForCheck();
	}

	private _parseDateToTimestamp(s?: string): number | null {
		if (!s) return null;
		try {
			if (s.includes(" ") && !s.includes("T")) {
				const [datePart, timePart] = s.split(" ");
				const [year, month, day] = datePart.split("-").map(Number);
				const [hour, minute, second] = timePart.split(":").map(Number);
				const d = new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
				return d.getTime();
			}
			const t = Date.parse(s);
			return isNaN(t) ? null : t;
		} catch {
			return null;
		}
	}

	private _buildDailySeries(records: TagRecord[]): [number, number][] {
		if (!records || records.length === 0) {
			// Return empty series with 30 days of zeros - ensure valid timestamps
			const now = new Date();
			const days = 30;
			const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1));
			start.setHours(0, 0, 0, 0);
			const arr: [number, number][] = [];
			for (let i = 0; i < days; i++) {
				const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
				const timestamp = cur.getTime();
				// Ensure we have a valid timestamp
				if (!isNaN(timestamp) && timestamp > 0) {
					arr.push([timestamp, 0]);
				}
			}
			// If we still have no valid data, return at least one point
			if (arr.length === 0) {
				arr.push([Date.now(), 0]);
			}
			return arr;
		}

		const now = new Date();
		const days = 30;
		const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1));
		start.setHours(0, 0, 0, 0);
		const byDay = new Map<string, number>();

		for (const r of records) {
			const ts = this._parseDateToTimestamp(r.registeredAt);
			if (ts == null) continue;
			const d = new Date(ts);
			d.setHours(0, 0, 0, 0);
			if (d < start) continue;
			const key = d.toISOString().slice(0, 10);
			byDay.set(key, (byDay.get(key) || 0) + 1);
		}

		const arr: [number, number][] = [];
		for (let i = 0; i < days; i++) {
			const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
			const key = cur.toISOString().slice(0, 10);
			const dayCount = byDay.get(key) || 0;
			const timestamp = cur.getTime();
			// Ensure we have a valid timestamp
			if (!isNaN(timestamp) && timestamp > 0) {
				arr.push([timestamp, dayCount]);
			}
		}

		// If we still have no valid data, return at least one point
		if (arr.length === 0) {
			arr.push([Date.now(), 0]);
		}

		return arr;
	}

	private _buildSeries(): any[] {
		const allTags = this._buildDailySeries(this.records);
		const paidTags = this._buildDailySeries(this.records.filter((r) => r.type === "mainnet"));

		// Filter out any invalid data points from both series
		const validAllTags = allTags.filter((point) => {
			if (!Array.isArray(point) || point.length !== 2) return false;
			const [timestamp, value] = point;
			return typeof timestamp === "number" && !isNaN(timestamp) && timestamp > 0 && typeof value === "number" && !isNaN(value) && value >= 0;
		});

		const validPaidTags = paidTags.filter((point) => {
			if (!Array.isArray(point) || point.length !== 2) return false;
			const [timestamp, value] = point;
			return typeof timestamp === "number" && !isNaN(timestamp) && timestamp > 0 && typeof value === "number" && !isNaN(value) && value >= 0;
		});

		// Ensure we have at least one valid point for each series
		if (validAllTags.length === 0) {
			validAllTags.push([Date.now(), 0]);
		}
		if (validPaidTags.length === 0) {
			validPaidTags.push([Date.now(), 0]);
		}

		const allTagsLabel = this._translocoService.translate("analytics.chart.allTags");
		const paidTagsLabel = this._translocoService.translate("analytics.chart.paidTags");
		return [
			{ name: allTagsLabel, data: validAllTags },
			{ name: paidTagsLabel, data: validPaidTags },
		];
	}

	private _calculateYAxisRangeFromSeries(series: any[]): { min: number; max: number } {
		if (!Array.isArray(series) || series.length === 0) {
			return { min: 0, max: 10 };
		}

		const allValues: number[] = [];

		for (const s of series) {
			if (s?.data && Array.isArray(s.data)) {
				for (const item of s.data) {
					const value = Array.isArray(item) ? item[1] : item;
					if (typeof value === "number") {
						allValues.push(value);
					}
				}
			}
		}

		if (allValues.length === 0) {
			return { min: 0, max: 10 };
		}

		const min = Math.min(...allValues);
		const max = Math.max(...allValues);

		if (max === 0) {
			return { min: 0, max: 5 };
		}

		const padding = Math.max(1, Math.ceil(max * 0.1));
		return {
			min: Math.max(0, min - padding),
			max: max + padding,
		};
	}
}
