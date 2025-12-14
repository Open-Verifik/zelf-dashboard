import { Component, ViewEncapsulation } from "@angular/core";
import { RouterLink } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

@Component({
	selector: "zelfkeys-cancel",
	standalone: true,
	imports: [RouterLink, MatButtonModule, MatIconModule],
	templateUrl: "./cancel.component.html",
	encapsulation: ViewEncapsulation.None,
})
export class ZelfKeysCancelComponent {
	/**
	 * Constructor
	 */
	constructor() {}

	openExtension(): void {
		window.postMessage({ type: "OPEN_ZELF_EXTENSION" }, "*");
		// Fallback: try to close the window after a short delay if the extension doesn't handle it
		setTimeout(() => {
			window.close();
		}, 500);
	}
}
