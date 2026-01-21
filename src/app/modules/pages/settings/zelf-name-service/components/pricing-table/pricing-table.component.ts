import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { TranslocoModule } from "@jsverse/transloco";

export interface PricingRow {
	length: string;
	oneYear: number;
	twoYears: number;
	threeYears: number;
	fourYears: number;
	fiveYears: number;
	lifetime: number;
}

@Component({
	selector: "zns-pricing-table",
	templateUrl: "./pricing-table.component.html",
	standalone: true,
	imports: [CommonModule, FormsModule, MatIconModule, TranslocoModule],
})
export class PricingTableComponent {
	@Input() rows: PricingRow[] = [];
	@Output() resetDefault = new EventEmitter<void>();
}
