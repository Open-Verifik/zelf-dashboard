import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input, OnInit } from "@angular/core";
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { TranslocoModule } from "@jsverse/transloco";

@Component({
	selector: "networks-config",
	templateUrl: "./networks-config.component.html",
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MatCheckboxModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		MatIconModule,
		MatSelectModule,
		MatSlideToggleModule,
		TranslocoModule,
	],
})
export class NetworksConfigComponent implements OnInit {
	@Input() networksFormGroup!: UntypedFormGroup;

	get networkKeys(): string[] {
		if (!this.networksFormGroup) return [];
		return Object.keys(this.networksFormGroup.controls);
	}

	ngOnInit() {}

	getNetworkGroup(key: string): UntypedFormGroup {
		return this.networksFormGroup.get(key) as UntypedFormGroup;
	}

	getNetworkLabel(key: string): string {
		const labels: { [key: string]: string } = {
			ethereum: "Ethereum",
			solana: "Solana",
			bitcoin: "Bitcoin",
			blockdag: "BlockDAG",
			avalanche: "Avalanche",
			binance: "Binance Smart Chain",
			polygon: "Polygon",
			sui: "Sui",
		};
		return labels[key] || key;
	}

	toggleNetwork(key: string) {
		const group = this.getNetworkGroup(key);
		const enabled = group.get("enabled")?.value;
		group.get("nativeCurrency")?.get("enabled")?.setValue(enabled);
		if (group.get("altCoins")) {
			group.get("altCoins")?.get("enabled")?.setValue(enabled);
		}
	}

	toggleNativeCurrency(key: string) {
		this.checkNetworkState(key);
	}

	toggleAltCoins(key: string) {
		this.checkNetworkState(key);
	}

	checkNetworkState(key: string) {
		const group = this.getNetworkGroup(key);
		const nativeEnabled = group.get("nativeCurrency")?.get("enabled")?.value;
		const altCoinsEnabled = group.get("altCoins")?.get("enabled")?.value;

		const altCoinsExist = !!group.get("altCoins");
		const allChildrenDisabled = !nativeEnabled && (!altCoinsExist || !altCoinsEnabled);

		if (allChildrenDisabled) {
			group.get("enabled")?.setValue(false, { emitEvent: false });
		} else {
			if (group.get("enabled")?.value === false) {
				group.get("enabled")?.setValue(true, { emitEvent: false });
			}
		}
	}
}
