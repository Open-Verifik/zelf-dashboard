import { Component, ViewEncapsulation, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { FormsModule } from "@angular/forms";
import { TranslocoModule } from "@jsverse/transloco";
import { ActivatedRoute } from "@angular/router";
import { ZelfKeysService, ZelfKeyItem } from "./zelfkeys.service";
import { LicenseService } from "../pages/settings/license/license.service";
import { Subject, takeUntil } from "rxjs";

const CATEGORIES = [
	{ value: "all", labelKey: "zelfkeys.filters.all" },
	{ value: "password", labelKey: "zelfkeys.filters.password" },
	{ value: "notes", labelKey: "zelfkeys.filters.notes" },
	{ value: "zotp", labelKey: "zelfkeys.filters.zotp" },
	{ value: "credit_card", labelKey: "zelfkeys.filters.credit_card" },
	{ value: "contact", labelKey: "zelfkeys.filters.contact" },
];

export interface ZelfKeyRecord extends ZelfKeyItem {
	category: string;
}

@Component({
	selector: "zelfkeys",
	standalone: true,
	templateUrl: "./zelfkeys.component.html",
	styleUrls: ["./zelfkeys.component.scss"],
	encapsulation: ViewEncapsulation.None,
	imports: [
		CommonModule,
		MatButtonModule,
		MatIconModule,
		MatCardModule,
		MatTooltipModule,
		MatFormFieldModule,
		MatSelectModule,
		FormsModule,
		TranslocoModule,
	],
})
export class ZelfKeysComponent implements OnInit, OnDestroy {
	dataSource: ZelfKeyRecord[] = [];
	allCategories = CATEGORIES;
	selectedCategory = "all";

	// Loading and error state
	isLoading = true;
	error: string | null = null;

	// Identifier from URL or license (e.g. miguel.zelf)
	identifier: string | null = null;
	isLicenseConfigured = false;
	isLoadingLicense = true;

	// Dark mode detection
	isDarkMode = false;
	private darkModeObserver?: MutationObserver;
	private destroy$ = new Subject<void>();

	constructor(
		private _zelfKeysService: ZelfKeysService,
		private _route: ActivatedRoute,
		private _licenseService: LicenseService,
		private _cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this._checkDarkMode();
		this._watchDarkMode();
		this._readQueryParams();
		this._getMyLicense();
	}

	private _readQueryParams(): void {
		this._route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
			const identifierFromUrl = params.get("identifier");
			const valid = identifierFromUrl && identifierFromUrl.trim() && identifierFromUrl !== "undefined";
			if (valid) {
				this.identifier = identifierFromUrl!.trim();
				this._cdr.markForCheck();
				this.loadKeys();
			}
		});
	}

	private async _getMyLicense(): Promise<void> {
		this.isLoadingLicense = true;
		try {
			const licenseStr = localStorage.getItem("license");
			if (licenseStr) {
				const licenseData = JSON.parse(licenseStr);
				const domainCfg = licenseData?.domainConfig || licenseData;
				const owner = domainCfg?.owner;
				const domainName = domainCfg?.name || licenseData?.domain;
				if (owner && domainName && owner.trim() && domainName.trim()) {
					this.identifier = this.identifier || `${owner}.${domainName}`;
					this.isLicenseConfigured = true;
				}
			}
			if (!this.identifier) {
				const response = await this._licenseService.getMyLicense(true);
				if (response?.data?.myLicense?.domainConfig) {
					const domainCfg = response.data.myLicense.domainConfig;
					const owner = domainCfg?.owner;
					const domainName = domainCfg?.name;
					if (owner && domainName && owner.trim() && domainName.trim()) {
						this.identifier = this.identifier || `${owner}.${domainName}`;
						this.isLicenseConfigured = true;
						if (licenseStr) {
							const parsed = JSON.parse(licenseStr);
							localStorage.setItem("license", JSON.stringify({ ...parsed, domainConfig: domainCfg }));
						}
					}
				}
			}
		} catch {
			// Ignore
		} finally {
			this.isLoadingLicense = false;
			this._cdr.markForCheck();
			this.loadKeys();
		}
	}

	private _checkDarkMode(): void {
		const wasDarkMode = this.isDarkMode;
		this.isDarkMode = document.body.classList.contains("dark") || document.documentElement.classList.contains("dark");
		if (wasDarkMode !== this.isDarkMode) {
			this._cdr.markForCheck();
		}
	}

	private _watchDarkMode(): void {
		this.darkModeObserver = new MutationObserver(() => {
			this._checkDarkMode();
		});
		this.darkModeObserver.observe(document.body, {
			attributes: true,
			attributeFilter: ["class"],
		});
		this.darkModeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
		if (this.darkModeObserver) {
			this.darkModeObserver.disconnect();
		}
	}

	loadKeys(): void {
		const id = this.identifier && this.identifier.trim() && this.identifier !== "undefined" ? this.identifier.trim() : null;
		if (!id) {
			this.isLoading = false;
			this.isLoadingLicense = false;
			this.dataSource = [];
			this.error = null;
			this._cdr.markForCheck();
			return;
		}

		this.isLoading = true;
		this.error = null;

		this._zelfKeysService
			.listAllDashboard({ identifier: id })
			.then((response) => {
				const data = response?.data?.data;
				if (data) {
					const flat: ZelfKeyRecord[] = [];
					(Object.keys(data) as Array<keyof typeof data>).forEach((category) => {
						const items = data[category] || [];
						items.forEach((item) => {
							flat.push({ ...item, category });
						});
					});
					this.dataSource = flat;
				} else {
					this.dataSource = [];
				}
			})
			.catch((err) => {
				console.error("ZelfKeys list error:", err);
				this.error = err?.error?.message || err?.message || "Failed to load ZelfKeys";
				this.dataSource = [];
			})
			.finally(() => {
				this.isLoading = false;
				this._cdr.markForCheck();
			});
	}

	onCategoryChange(): void {
		this._cdr.markForCheck();
	}

	get filteredData(): ZelfKeyRecord[] {
		if (this.selectedCategory === "all") {
			return this.dataSource;
		}
		return this.dataSource.filter((item) => item.category === this.selectedCategory);
	}

	formatDate(dateString: string | undefined): string {
		if (!dateString) return "—";
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	getItemLabel(item: ZelfKeyRecord): string {
		const pd = item.publicData || {};
		switch (item.category) {
			case "password":
				return (pd.website as string) || (pd.username as string) || item.id || "Password";
			case "notes":
				return (pd.title as string) || item.id || "Note";
			case "zotp":
				return (pd.issuer as string) || (pd.username as string) || item.id || "ZOTP";
			case "credit_card": {
				try {
					const card = typeof pd.card === "string" ? JSON.parse(pd.card) : pd.card;
					return card?.name || item.id || "Card";
				} catch {
					return item.id || "Card";
				}
			}
			case "contact":
				return (pd.username as string) || item.id || "Contact";
			default:
				return item.id || "Item";
		}
	}

	getCategoryIcon(category: string): string {
		const icons: Record<string, string> = {
			password: "lock",
			notes: "note",
			zotp: "phonelink_lock",
			credit_card: "credit_card",
			contact: "contacts",
		};
		return icons[category] || "key";
	}

	refresh(): void {
		this.loadKeys();
	}
}
