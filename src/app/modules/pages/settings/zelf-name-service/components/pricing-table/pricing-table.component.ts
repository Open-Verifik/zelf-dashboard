import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { TranslocoModule } from "@jsverse/transloco";

export type PricingTableTab = "tags" | "premium" | "unlimited";

export type PricingColumnKey = "oneYear" | "twoYears" | "threeYears" | "fourYears" | "fiveYears" | "lifetime";

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
	@Input() activeTab: PricingTableTab = "tags";
	@Input() hasUnsavedChanges = false;
	@Output() activeTabChange = new EventEmitter<PricingTableTab>();
	@Output() resetDefault = new EventEmitter<void>();
	@Output() cellChange = new EventEmitter<{ length: string; column: PricingColumnKey; value: number }>();
	@Output() saveRequested = new EventEmitter<void>();

	readonly tabs: Array<{ id: PricingTableTab; label: string }> = [
		{ id: "tags", label: "Tags / default" },
		{ id: "premium", label: "Premium" },
		{ id: "unlimited", label: "Unlimited" },
	];

	readonly columns: Array<{ key: PricingColumnKey; label: string }> = [
		{ key: "oneYear", label: "1 Year" },
		{ key: "twoYears", label: "2 Year" },
		{ key: "threeYears", label: "3 Year" },
		{ key: "fourYears", label: "4 Year" },
		{ key: "fiveYears", label: "5 Year" },
		{ key: "lifetime", label: "Life" },
	];

	selectTab(tab: PricingTableTab): void {
		if (tab === this.activeTab) return;
		this.activeTabChange.emit(tab);
	}

	trackByLength(_index: number, row: PricingRow): string {
		return row.length;
	}

	onCellChange(row: PricingRow, column: PricingColumnKey, raw: number | string | null): void {
		const value = Number(raw);
		row[column] = Number.isFinite(value) ? value : 0;
		this.cellChange.emit({ length: row.length, column, value: row[column] });
	}
}
