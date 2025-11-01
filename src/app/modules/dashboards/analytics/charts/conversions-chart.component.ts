import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, OnChanges, SimpleChanges, ViewEncapsulation } from "@angular/core";
import { ApexOptions, NgApexchartsModule } from "ng-apexcharts";

interface TagRecord {
	name: string;
	type: string;
	origin: string;
	registeredAt?: string;
	expiresAt?: string;
}

@Component({
	selector: "app-conversions-chart",
	standalone: true,
	imports: [CommonModule, NgApexchartsModule],
	templateUrl: "./conversions-chart.component.html",
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversionsChartComponent implements OnInit, OnChanges {
	@Input() records: TagRecord[] = [];

	chartOptions: ApexOptions = {
		chart: { type: "area" },
		series: [],
	};

	constructor(private _cdr: ChangeDetectorRef) {}

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
		// Simple sparkline - just show a flat line for paid tags count
		const paidCount = this.records && this.records.length > 0 ? this.records.filter((r) => r.type === "mainnet").length : 0;

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
				sparkline: {
					enabled: true,
				},
			},
			colors: ["#38BDF8"],
			fill: {
				colors: ["#38BDF8"],
				opacity: 0.5,
			},
			series: [{ data: Array(30).fill(Math.max(0, paidCount)) }],
			stroke: {
				curve: "smooth",
			},
			tooltip: {
				followCursor: true,
				theme: "dark",
			},
			xaxis: {
				type: "category",
				categories: [],
			},
			yaxis: {
				labels: {
					formatter: (val): string => val.toString(),
				},
			},
		};

		this._cdr.markForCheck();
	}
}
