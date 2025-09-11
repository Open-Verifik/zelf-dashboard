import { TextFieldModule } from "@angular/cdk/text-field";
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from "@angular/core";
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
import { AuthService } from "app/core/auth/auth.service";
import { CommonModule } from "@angular/common";

interface UserData {
	email: string;
	company: string;
	countryCode: string;
	phone: string;
	language: string;
	zelfProof: string;
	createdAt: string;
	version: string;
	photo?: string;
	name?: string;
}

@Component({
	selector: "profile",
	templateUrl: "./profile.component.html",
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		CommonModule,
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
export class ProfileComponent implements OnInit {
	userData: UserData | null = null;
	userPhoto: string | null = null;
	loading: boolean = true;
	license: any = null;

	/**
	 * Constructor
	 */
	constructor(private _authService: AuthService) {}

	ngOnInit(): void {
		this.license = null;

		this.loadUserData();
	}

	private async loadUserData(): Promise<void> {
		try {
			const zelfAccount = this._authService.zelfAccount;

			console.log({ zelfAccount });

			this.userData = zelfAccount.metadata;

			this.loading = false;
		} catch (error) {
			console.error("Error loading user data:", error);
		} finally {
			this.loading = false;
		}
	}

	private extractNameFromEmail(email: string): string {
		// Extract name from email (e.g., "miguel.smith@example.com" -> "Miguel Smith")
		const localPart = email.split("@")[0];
		const nameParts = localPart.split(".");
		return nameParts.map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(" ");
	}

	get displayName(): string {
		return this.userData?.name || this.extractNameFromEmail(this.userData?.email || "user@example.com");
	}

	get displayEmail(): string {
		return this.userData?.email || "user@example.com";
	}

	get displayPhone(): string {
		return this.userData?.phone || "000-000-0000";
	}

	get displayCompany(): string {
		return this.userData?.company || "Zelf Technology";
	}
}
