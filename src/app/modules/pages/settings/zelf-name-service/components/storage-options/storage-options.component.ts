import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, UntypedFormGroup } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { TranslocoModule } from "@jsverse/transloco";

@Component({
	selector: "zns-storage-options",
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatSlideToggleModule, TranslocoModule],
	templateUrl: "./storage-options.component.html",
})
export class StorageOptionsComponent {
	@Input() formGroup!: UntypedFormGroup;
	@Input() titleKey: string = "license.storage_options.title";
	@Input() ipfsControlName: string = "ipfsEnabled";
	@Input() arweaveControlName: string = "arweaveEnabled";
	@Input() walrusControlName: string = "walrusEnabled";
	@Input() keyPrefixControlName: string = "keyPrefix";
}
