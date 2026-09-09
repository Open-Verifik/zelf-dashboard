import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { HumanAuthnNextStep, previewPayloadForDisplay } from "../human-authn-play.utils";

export type HumanAuthnIoHighlight = "zelfID" | "zelfIDQR" | "publicData" | "metadata" | null;

@Component({
	selector: "app-human-authn-io-panel",
	templateUrl: "./human-authn-io-panel.component.html",
	styleUrls: ["./human-authn-io-panel.component.scss"],
	imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatTooltipModule],
})
export class HumanAuthnIoPanelComponent {
	@Input() sendPayload: Record<string, unknown> | null = null;
	@Input() expectedShape = "";
	@Input() emptyHint = "";
	@Input() response: unknown = null;
	@Input() error: unknown = null;
	@Input() qrImageSrc: string | null = null;
	@Input() highlight: HumanAuthnIoHighlight = null;
	@Input() nextSteps: HumanAuthnNextStep[] = [];
	@Output() copyResponse = new EventEmitter<void>();
	@Output() downloadQr = new EventEmitter<void>();

	get sendJson(): string {
		return JSON.stringify(previewPayloadForDisplay(this.sendPayload), null, 2);
	}

	get responseRecord(): Record<string, unknown> | null {
		if (!this.response || typeof this.response !== "object") return null;
		return this.response as Record<string, unknown>;
	}

	get highlightedValue(): unknown {
		const rec = this.responseRecord;
		if (!rec || !this.highlight) return null;
		return rec[this.highlight] ?? null;
	}

	get highlightCaption(): string {
		switch (this.highlight) {
			case "zelfID":
				return "This string is your HumanAuthn. Copy it, then Preview (public fields) or Decrypt (secrets).";
			case "zelfIDQR":
				return "This PNG is the QR. Optional zelfID is the same proof string Create returns.";
			case "publicData":
				return "This was readable without a face. Secrets stay hidden until Decrypt.";
			case "metadata":
				return "This was locked. Decrypt needed the same face (and password if you set one).";
			default:
				return "";
		}
	}

	onCopy(): void {
		this.copyResponse.emit();
	}
}
