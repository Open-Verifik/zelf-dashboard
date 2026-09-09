import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
	HUMAN_AUTHN_PLAY_RAIL,
	HumanAuthnPlayRailStep,
	HumanAuthnPlayStepId,
} from "../human-authn-play.utils";

@Component({
	selector: "app-human-authn-play-header",
	templateUrl: "./human-authn-play-header.component.html",
	styleUrls: ["./human-authn-play-header.component.scss"],
	imports: [CommonModule],
})
export class HumanAuthnPlayHeaderComponent {
	@Input() eyebrow = "HumanAuthn · ZelfEncrypt v4";
	@Input({ required: true }) title!: string;
	@Input() subtitle = "";
	@Input() method = "POST";
	@Input({ required: true }) path!: string;
	@Input() currentStep: HumanAuthnPlayStepId = "fill";
	@Input() rail: HumanAuthnPlayRailStep[] = HUMAN_AUTHN_PLAY_RAIL;

	private readonly order: HumanAuthnPlayStepId[] = ["fill", "send", "pay", "result"];

	isCurrent(id: HumanAuthnPlayStepId): boolean {
		return this.currentStep === id;
	}

	isDone(id: HumanAuthnPlayStepId): boolean {
		return this.order.indexOf(id) < this.order.indexOf(this.currentStep);
	}
}
