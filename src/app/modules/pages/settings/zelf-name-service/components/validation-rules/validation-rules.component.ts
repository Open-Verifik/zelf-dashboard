import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { ReactiveFormsModule, UntypedFormGroup } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { TranslocoModule } from "@jsverse/transloco";

@Component({
	selector: "zns-validation-rules",
	templateUrl: "./validation-rules.component.html",
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatSlideToggleModule, TranslocoModule],
})
export class ValidationRulesComponent {
	@Input() formGroup!: UntypedFormGroup;
	@Input() reservedWords: string[] = [];
	@Input() addReservedWord!: (word: string) => void;
	@Input() removeReservedWord!: (word: string) => void;
}
