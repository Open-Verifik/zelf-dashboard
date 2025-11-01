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
	selector: "app-all-tags-overview-chart",
	standalone: true,
	imports: [CommonModule, NgApexchartsModule],
	templateUrl: "./all-tags-overview-chart.component.html",
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllTagsOverviewChartComponent implements OnInit, OnChanges {
	@Input() records: TagRecord[] = [];
	@Input() selectedPeriod: string = "this-month";

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

	ngOnChanges(changes: SimpleChanges): void {
		if (changes["records"] || changes["selectedPeriod"]) {
			this._updateChart();
		}
	}

	ngOnInit(): void {
		// Initialize chart even if records are empty
		this._updateChart();
	}

	private _updateChart(): void {
		// Ensure selectedPeriod has a valid value
		if (!this.selectedPeriod || (this.selectedPeriod !== "this-month" && this.selectedPeriod !== "previous-month")) {
			this.selectedPeriod = "this-month";
		}

		// Process raw records into series
		const series = this._buildSeries();

		// Get the selected series - ensure we always have at least an empty array
		const selectedSeries = series[this.selectedPeriod] || series["this-month"] || [{ name: "Total", data: [] }];

		// Calculate y-axis range
		if (selectedSeries?.[0]?.data && Array.isArray(selectedSeries[0].data)) {
			const visitorData = selectedSeries[0].data;
			if (visitorData.length > 0) {
				const range = this._calculateYAxisRange(visitorData);
				this.yAxisMin = range.min;
				this.yAxisMax = range.max;
			} else {
				// Default range for empty data
				this.yAxisMin = 0;
				this.yAxisMax = 5;
			}
		} else {
			// Default range if no data
			this.yAxisMin = 0;
			this.yAxisMax = 5;
		}

		// Create a new chartOptions object to ensure Angular detects the change
		const newChartOptions: ApexOptions = {
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
				height: 320,
				type: "area",
				toolbar: {
					show: false,
				},
				zoom: {
					enabled: false,
				},
			},
			colors: ["#818CF8"],
			dataLabels: {
				enabled: false,
			},
			fill: {
				colors: ["#312E81"],
			},
			grid: {
				show: true,
				borderColor: "#334155",
				padding: {
					top: 10,
					bottom: 60,
					left: 20,
					right: 40,
				},
				position: "back",
				xaxis: {
					lines: {
						show: true,
					},
				},
			},
			series: selectedSeries,
			stroke: {
				width: 2,
			},
			tooltip: {
				followCursor: true,
				theme: "dark",
				x: {
					format: this._translocoService.translate("analytics.chart.dateFormat"),
				},
				y: {
					formatter: (value: number): string => `${value}`,
				},
			},
			xaxis: {
				axisBorder: {
					show: false,
				},
				axisTicks: {
					show: false,
				},
				crosshairs: {
					stroke: {
						color: "#475569",
						dashArray: 0,
						width: 2,
					},
				},
				tooltip: {
					enabled: false,
				},
				type: "datetime",
				tickPlacement: "on",
				floating: false,
				position: "bottom",
				labels: {
					offsetY: 0,
					style: {
						colors: "#CBD5E1",
						fontSize: "11px",
					},
					rotate: -45,
					trim: false,
					hideOverlappingLabels: false,
					show: true,
				},
			},
			yaxis: {
				axisTicks: {
					show: false,
				},
				axisBorder: {
					show: false,
				},
				min: this.yAxisMin,
				max: this.yAxisMax,
				tickAmount: 5,
				show: false,
			},
		};

		this.chartOptions = { ...newChartOptions };
		this._cdr.markForCheck();
	}

	private _parseDateToTimestamp(s?: string): number | null {
		if (!s) return null;
		try {
			// Handle "YYYY-MM-DD HH:mm:ss" format
			if (s.includes(" ") && !s.includes("T")) {
				const [datePart, timePart] = s.split(" ");
				const [year, month, day] = datePart.split("-").map(Number);
				const [hour, minute, second] = timePart.split(":").map(Number);
				const d = new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
				return d.getTime();
			}
			// Handle ISO format
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

		// Count actual registrations per day
		for (const r of records) {
			const ts = this._parseDateToTimestamp(r.registeredAt);
			if (ts == null) continue;
			const d = new Date(ts);
			d.setHours(0, 0, 0, 0);
			// only count last N days
			if (d < start) continue;
			const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
			byDay.set(key, (byDay.get(key) || 0) + 1);
		}

		const arr: [number, number][] = [];

		// Collect actual daily counts (not cumulative)
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

	private _buildSeries(): { "this-month": any[]; "previous-month": any[] } {
		const thisMonth = this._buildDailySeries(this.records);

		// Filter out any invalid data points (NaN, null, undefined)
		const validThisMonth = thisMonth.filter((point) => {
			if (!Array.isArray(point) || point.length !== 2) return false;
			const [timestamp, value] = point;
			return typeof timestamp === "number" && !isNaN(timestamp) && timestamp > 0 && typeof value === "number" && !isNaN(value) && value >= 0;
		});

		// If no valid data, create at least one valid point
		if (validThisMonth.length === 0) {
			validThisMonth.push([Date.now(), 0]);
		}

		const previousMonth = validThisMonth.map(([t, v]) => {
			const newValue = Math.round(v * 0.8);
			return [t, isNaN(newValue) ? 0 : newValue];
		});

		return {
			"this-month": [{ name: "Total", data: validThisMonth }],
			"previous-month": [{ name: "Total", data: previousMonth }],
		};
	}

	private _calculateYAxisRange(data: any[]): { min: number; max: number } {
		if (!Array.isArray(data) || data.length === 0) {
			return { min: 0, max: 10 };
		}

		const values = data.map((item) => (Array.isArray(item) ? item[1] : item)).filter((v) => typeof v === "number");
		if (values.length === 0) {
			return { min: 0, max: 10 };
		}

		const min = Math.min(...values);
		const max = Math.max(...values);

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
