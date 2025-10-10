import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { DomainConfig } from "../../modules/pages/settings/license/license.class";

export interface SaveConfirmationData {
	domain: string | null;
	domainConfig: DomainConfig | null;
	redirectUrl: string;
	operation: {
		title: string;
		description: string;
		action: string; // e.g., "saving", "updating", "creating"
		itemName: string; // e.g., "domain configuration", "license", "security settings"
	};
	securityData?: {
		newPassword?: string;
		confirmPassword?: string;
		operation?: string; // "changePassword" or "loadApiKey"
		faceBase64: string;
		masterPassword: string;
	};
	profileData?: {
		name: string;
		email: string;
		countryCode: string;
		phone: string;
		company: string;
		faceBase64: string;
		masterPassword: string;
	};
}

@Injectable({
	providedIn: "root",
})
export class SaveConfirmationService {
	private saveDataSubject = new BehaviorSubject<SaveConfirmationData | null>(null);
	public saveData$ = this.saveDataSubject.asObservable();

	/**
	 * Set the data to be saved
	 */
	setSaveData(data: SaveConfirmationData): void {
		this.saveDataSubject.next(data);
	}

	/**
	 * Get the current save data
	 */
	getSaveData(): SaveConfirmationData | null {
		return this.saveDataSubject.value;
	}

	/**
	 * Clear the save data
	 */
	clearSaveData(): void {
		this.saveDataSubject.next(null);
	}
}
