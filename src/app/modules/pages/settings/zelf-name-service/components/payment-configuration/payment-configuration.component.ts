import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { TranslocoModule } from "@jsverse/transloco";

export interface CurrencyInfo {
	code: string;
	networkKey: string;
	label: string;
	colorClass: string;
}

@Component({
	selector: "zns-payment-configuration",
	templateUrl: "./payment-configuration.component.html",
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, FormsModule, MatIconModule, MatSlideToggleModule, TranslocoModule],
})
export class PaymentConfigurationComponent {
	@Input() formGroup!: UntypedFormGroup;
	@Input() whitelistItems!: any[];
	@Input() removeWhitelistItem!: (index: number) => void;
	@Input() addWhitelistItem!: () => void;
	@Input() newWhitelistItem: any;
	@Input() getWhitelistTypeLabel!: (type: string) => string;
	@Input() networksFormGroup?: UntypedFormGroup;

	@Output() currencyToggled = new EventEmitter<{ networkKey: string; enabled: boolean }>();

	private readonly networkLabels: { [key: string]: string } = {
		ethereum: "Ethereum",
		solana: "Solana",
		bitcoin: "Bitcoin",
		blockdag: "BlockDAG",
		avalanche: "Avalanche",
		binance: "BSC",
		polygon: "Polygon",
		sui: "Sui",
	};

	private readonly networkColors: { [key: string]: string } = {
		ethereum: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300",
		solana: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300",
		bitcoin: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300",
		blockdag: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
		avalanche: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300",
		binance: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300",
		polygon: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300",
		sui: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300",
	};

	get enabledCurrencies(): CurrencyInfo[] {
		if (!this.networksFormGroup) return [];
		const currencies: CurrencyInfo[] = [];
		const controls = this.networksFormGroup.controls;

		Object.keys(controls).forEach((key) => {
			const network = controls[key] as UntypedFormGroup;
			if (network.get("enabled")?.value) {
				// Native
				if (network.get("nativeCurrency.enabled")?.value) {
					const code = network.get("nativeCurrency.code")?.value;
					if (code) {
						currencies.push({
							code,
							networkKey: key,
							label: this.networkLabels[key] || key,
							colorClass: this.networkColors[key] || "bg-gray-100 text-gray-600",
						});
					}
				}
			}
		});
		return currencies;
	}

	get availableCurrencies(): CurrencyInfo[] {
		if (!this.networksFormGroup) return [];
		const available: CurrencyInfo[] = [];
		const controls = this.networksFormGroup.controls;

		Object.keys(controls).forEach((key) => {
			const network = controls[key] as UntypedFormGroup;
			const isEnabled = network.get("enabled")?.value;
			const nativeEnabled = network.get("nativeCurrency.enabled")?.value;
			const code = network.get("nativeCurrency.code")?.value;

			// Only show currencies that are not currently enabled
			if (!isEnabled || !nativeEnabled) {
				if (code) {
					available.push({
						code,
						networkKey: key,
						label: this.networkLabels[key] || key,
						colorClass: this.networkColors[key] || "bg-gray-100 text-gray-600",
					});
				}
			}
		});
		return available;
	}

	removeCurrency(currency: CurrencyInfo): void {
		if (!this.networksFormGroup) return;
		const network = this.networksFormGroup.get(currency.networkKey) as UntypedFormGroup;
		if (network) {
			// Disable the native currency
			network.get("nativeCurrency")?.get("enabled")?.setValue(false);
			// If no currencies are enabled for this network, disable the network
			const altCoinsEnabled = network.get("altCoins")?.get("enabled")?.value;
			if (!altCoinsEnabled) {
				network.get("enabled")?.setValue(false);
			}
			this.currencyToggled.emit({ networkKey: currency.networkKey, enabled: false });
		}
	}

	addCurrency(currency: CurrencyInfo): void {
		if (!this.networksFormGroup) return;
		const network = this.networksFormGroup.get(currency.networkKey) as UntypedFormGroup;
		if (network) {
			// Enable the network
			network.get("enabled")?.setValue(true);
			// Enable the native currency
			network.get("nativeCurrency")?.get("enabled")?.setValue(true);
			this.currencyToggled.emit({ networkKey: currency.networkKey, enabled: true });
		}
	}
}
