import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { ReactiveFormsModule, UntypedFormGroup } from "@angular/forms";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from "@angular/material/icon";

@Component({
	selector: "zns-blockchain-networks",
	templateUrl: "./blockchain-networks.component.html",
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatCheckboxModule],
})
export class BlockchainNetworksComponent {
	@Input() networksFormGroup!: UntypedFormGroup;
	@Input() getNetworkLabel!: (key: string) => string;
	@Input() getNetworkStyle!: (key: string) => { colorClass: string; initials: string };
	@Input() getNetworkGroup!: (key: string) => UntypedFormGroup;
	@Input() toggleNetwork!: (key: string) => void;

	get networkKeys(): string[] {
		if (!this.networksFormGroup) return [];
		return Object.keys(this.networksFormGroup.controls);
	}
}
