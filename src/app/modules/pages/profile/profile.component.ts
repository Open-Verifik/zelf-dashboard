import { TextFieldModule } from "@angular/cdk/text-field";
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatSelectModule } from "@angular/material/select";
import { MatTooltipModule } from "@angular/material/tooltip";
import { RouterLink } from "@angular/router";
import { FuseCardComponent } from "@fuse/components/card";

@Component({
	selector: "profile",
	templateUrl: "./profile.component.html",
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		RouterLink,
		FuseCardComponent,
		MatIconModule,
		MatButtonModule,
		MatMenuModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		TextFieldModule,
		MatDividerModule,
		MatTooltipModule,
	],
})
export class ProfileComponent {
	/**
	 * Constructor
	 */
	constructor() {}
}
