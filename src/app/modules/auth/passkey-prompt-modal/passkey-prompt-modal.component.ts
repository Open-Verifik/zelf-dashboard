import { Component, EventEmitter, Output, ViewEncapsulation } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { fadeIn, zoomIn } from "@fuse/animations";

@Component({
	selector: "app-passkey-prompt-modal",
	standalone: true,
	imports: [CommonModule, MatButtonModule, MatIconModule],
	templateUrl: "./passkey-prompt-modal.component.html",
	encapsulation: ViewEncapsulation.None,
	animations: [fadeIn, zoomIn],
})
export class PasskeyPromptModalComponent {
	@Output() onSave = new EventEmitter<void>();
	@Output() onCancel = new EventEmitter<void>();

	save() {
		this.onSave.emit();
	}

	cancel() {
		this.onCancel.emit();
	}
}
