import { Component, Input } from "@angular/core";

@Component({
	selector: "app-human-authn-step-card",
	templateUrl: "./human-authn-step-card.component.html",
	styleUrls: ["./human-authn-step-card.component.scss"],
})
export class HumanAuthnStepCardComponent {
	@Input({ required: true }) step!: number;
	@Input({ required: true }) title!: string;
	@Input() hint = "";
	@Input() field = "";
}
