import { Component, ViewEncapsulation, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDialogModule, MatDialog } from "@angular/material/dialog";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { FormsModule } from "@angular/forms";
import { TranslocoModule } from "@jsverse/transloco";
import { QRCodeModalComponent } from "./qr-code-modal.component";
import { DetailsModalComponent } from "./details-modal.component";
import { EditModalComponent } from "./edit-modal.component";
import { TagsService, TagSearchParams, DomainSearchParams } from "./tags.service";
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from "rxjs";
import { DomainConfig, License } from "../pages/settings/license/license.class";
import { LicenseService } from "../pages/settings/license/license.service";

// Interfaces
export interface TagRecord {
	id: string;
	name: string;
	cid: string;
	size: number;
	number_of_files: number;
	mime_type: string;
	group_id: string | null;
	created_at: string;
	url: string;
	publicData: {
		avaxName: string;
		btcAddress: string;
		domain: string;
		ethAddress: string;
		extraParams: string;
		solanaAddress: string;
	};
}

export interface TagsResponse {
	data: TagRecord[];
}

export interface PurchaseData {
	tagName: string;
	price: {
		price: number;
		currency: string;
		reward: number;
		discount: number;
		priceWithoutDiscount: number;
		discountType: string;
	};
}

@Component({
	selector: "tags",
	standalone: true,
	templateUrl: "./tags.component.html",
	styleUrls: ["./tags.component.scss"],
	encapsulation: ViewEncapsulation.None,
	imports: [
		CommonModule,
		MatTableModule,
		MatButtonModule,
		MatIconModule,
		MatDialogModule,
		MatCardModule,
		MatChipsModule,
		MatTooltipModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		FormsModule,
		TranslocoModule,
	],
})
export class TagsComponent implements OnInit, OnDestroy {
	displayedColumns: string[] = ["name", "domain", "created_at", "size", "actions"];
	dataSource: TagRecord[] = [];

	// Pagination properties
	currentPage: number = 1;
	pageSize: number = 10;
	totalPages: number = 1;
	totalItems: number = 0;
	pageSizeOptions: number[] = [10, 25, 50, 100];
	visiblePages: (number | string)[] = [1];

	// Search and Filter properties
	searchType: string = "all";
	selectedStorage: string = "IPFS";
	searchQuery: string = "";
	license: License | null = null;
	availableStorage: string[] = ["IPFS", "Arweave", "Walrus", "NFT"];
	licenseDomain: string | null = null;
	isLicenseConfigured: boolean = false;
	isLoadingLicense: boolean = true;

	// Debounced search properties
	private searchSubject = new Subject<string>();
	private destroy$ = new Subject<void>();
	isSearching: boolean = false;

	// Purchase message properties
	showPurchaseMessage: boolean = false;
	purchaseData: PurchaseData | null = null;
	licenseData: DomainConfig | null = null;

	// Dark mode detection
	isDarkMode: boolean = false;
	private darkModeObserver?: MutationObserver;

	constructor(
		private dialog: MatDialog,
		private tagsService: TagsService,
		private _licenseService: LicenseService,
		private _cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		// Check for dark mode
		this._checkDarkMode();

		// Watch for dark mode changes
		this._watchDarkMode();

		// Fetch license first, then load tags
		this._getMyLicense();
	}

	private _checkDarkMode(): void {
		const wasDarkMode = this.isDarkMode;
		this.isDarkMode = document.body.classList.contains("dark") || document.documentElement.classList.contains("dark");

		// Trigger change detection if mode changed
		if (wasDarkMode !== this.isDarkMode) {
			this._cdr.markForCheck();
		}
	}

	private _watchDarkMode(): void {
		// Watch for class changes on body/html
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

	async _getMyLicense(): Promise<void> {
		this.isLoadingLicense = true;

		try {
			// Get the license from localStorage first
			const licenseStr = localStorage.getItem("license");

			if (licenseStr) {
				const licenseData = JSON.parse(licenseStr);

				// Extract domain from licenseData - same logic as analytics component
				// Use domainConfig.name (not domainConfig.domain)
				const domainCfg = licenseData?.domainConfig || licenseData;
				this.licenseDomain = domainCfg?.name || licenseData?.domain || null;

				if (!this.licenseDomain || this.licenseDomain.trim() === "") {
					this.isLicenseConfigured = false;
					this.isLoadingLicense = false;
					return;
				}

				this.licenseData = domainCfg;
				this.license = domainCfg;
				this.isLicenseConfigured = true;
				this.isLoadingLicense = false;

				// Set up debounced search after license is loaded
				this._setupSearch();
				// Load initial tags
				this.performSearch();
				return;
			}

			// If not in localStorage, fetch from API
			const response = await this._licenseService.getMyLicense(true);

			if (response.data?.myLicense) {
				const domainCfg = response.data.myLicense.domainConfig;
				this.licenseDomain = domainCfg?.name || null;

				if (!this.licenseDomain || this.licenseDomain.trim() === "") {
					this.isLicenseConfigured = false;
				} else {
					this.licenseData = domainCfg;
					this.license = domainCfg;
					this.isLicenseConfigured = true;
					localStorage.setItem("license", JSON.stringify({ ...(licenseStr ? JSON.parse(licenseStr) : {}), domainConfig: domainCfg }));
				}
			} else {
				this.isLicenseConfigured = false;
			}
		} catch (error) {
			this.isLicenseConfigured = false;
		} finally {
			this.isLoadingLicense = false;

			// Set up debounced search after license check is complete
			if (this.isLicenseConfigured) {
				this._setupSearch();
				// Load initial tags only if license is configured
				this.performSearch();
			}
		}
	}

	private _setupSearch(): void {
		// Set up debounced search
		this.searchSubject
			.pipe(
				debounceTime(2000), // 2 second delay
				distinctUntilChanged(), // Only emit when the value changes
				takeUntil(this.destroy$)
			)
			.subscribe((searchQuery) => {
				this.searchQuery = searchQuery;
				this.performSearch();
			});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();

		// Clean up dark mode observer
		if (this.darkModeObserver) {
			this.darkModeObserver.disconnect();
		}
	}

	formatFileSize(bytes: number): string {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	}

	formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	canDelete(record: TagRecord): boolean {
		return record.name.includes(".hold");
	}

	openQRCodeModal(record: TagRecord): void {
		const dialogRef = this.dialog.open(QRCodeModalComponent, {
			width: "500px",
			data: record,
			disableClose: false,
			panelClass: "custom-dialog-container",
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (result) {
			}
		});
	}

	openDetailsModal(record: TagRecord): void {
		const dialogRef = this.dialog.open(DetailsModalComponent, {
			width: "700px",
			maxHeight: "80vh",
			data: record,
			disableClose: false,
			panelClass: "custom-dialog-container",
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (result === "openQR") {
				// Open QR code modal if requested from details modal
				this.openQRCodeModal(record);
			}
		});
	}

	openEditModal(record: TagRecord): void {
		const dialogRef = this.dialog.open(EditModalComponent, {
			width: "500px",
			data: record,
			disableClose: false,
			panelClass: "custom-dialog-container",
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (result) {
				// Here you would typically make an API call to extend the lease
				this.handleLeaseExtension(result);
			}
		});
	}

	private handleLeaseExtension(extensionData: any): void {}

	deleteRecord(record: TagRecord): void {
		if (!this.canDelete(record)) {
			return;
		}
	}

	// Pagination methods
	goToFirstPage(): void {
		this.currentPage = 1;
		this.updateVisiblePages();
		this.performSearch();
	}

	goToPreviousPage(): void {
		if (this.currentPage > 1) {
			this.currentPage--;
			this.updateVisiblePages();
			this.performSearch();
		}
	}

	goToNextPage(): void {
		if (this.currentPage < this.totalPages) {
			this.currentPage++;
			this.updateVisiblePages();
			this.performSearch();
		}
	}

	goToLastPage(): void {
		this.currentPage = this.totalPages;
		this.updateVisiblePages();

		this.performSearch();
	}

	goToPage(page: number | string): void {
		if (typeof page === "number" && page >= 1 && page <= this.totalPages) {
			this.currentPage = page;
			this.updateVisiblePages();

			this.performSearch();
		}
	}

	onPageSizeChange(): void {
		this.currentPage = 1;
		this.totalPages = Math.ceil(this.totalItems / this.pageSize);
		this.updateVisiblePages();

		this.performSearch();
	}

	private updateVisiblePages(): void {
		// Simple pagination logic - show first 5 pages or current page ± 2
		const pages: (number | string)[] = [];
		const maxVisible = 5;

		if (this.totalPages <= maxVisible) {
			// Show all pages if total is less than max visible
			for (let i = 1; i <= this.totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Show ellipsis logic
			if (this.currentPage <= 3) {
				// Show first 4 pages + ellipsis + last page
				for (let i = 1; i <= 4; i++) {
					pages.push(i);
				}
				pages.push("...");
				pages.push(this.totalPages);
			} else if (this.currentPage >= this.totalPages - 2) {
				// Show first page + ellipsis + last 4 pages
				pages.push(1);
				pages.push("...");
				for (let i = this.totalPages - 3; i <= this.totalPages; i++) {
					pages.push(i);
				}
			} else {
				// Show first + ellipsis + current-1, current, current+1 + ellipsis + last
				pages.push(1);
				pages.push("...");
				for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
					pages.push(i);
				}
				pages.push("...");
				pages.push(this.totalPages);
			}
		}

		this.visiblePages = pages;
	}

	getStartItem(): number {
		return (this.currentPage - 1) * this.pageSize + 1;
	}

	getEndItem(): number {
		const end = this.currentPage * this.pageSize;
		return Math.min(end, this.totalItems);
	}

	// Search and Filter methods
	onSearchChange(): void {
		// Set loading state when user starts typing
		this.isSearching = true;
		// Emit to debounced search subject instead of calling performSearch directly
		this.searchSubject.next(this.searchQuery);
	}

	onStorageChange(): void {
		this.currentPage = 1; // Reset to first page when storage changes
		this.performSearch();
	}

	performSearch(): void {
		// Don't perform search if license is not configured or domain is missing/empty
		if (!this.isLicenseConfigured || !this.licenseDomain || this.licenseDomain.trim() === "") {
			return;
		}

		// Clear loading state
		this.isSearching = false;

		// If we have a search query, use the search endpoint
		if (this.searchQuery.trim()) {
			this.searchByTagName();
		} else {
			// Otherwise, use the domain search endpoint
			this.searchByDomain();
		}
	}

	private searchByTagName(): void {
		const searchParams: TagSearchParams = {
			tagName: this.searchQuery.trim(),
			domain: this.licenseDomain || undefined,
			os: "DESKTOP",
		};

		this.tagsService
			.searchTag(searchParams)
			.then((response) => {
				// Handle single tag search response
				if (response.data) {
					// Check if tag is available for purchase
					if (response.data.available === true) {
						// Tag is available for purchase - show purchase message
						this.dataSource = [];
						this.showPurchaseMessage = true;
						this.purchaseData = {
							tagName: response.data.tagName,
							price: response.data.price,
						};
					} else {
						// Tag exists - show in table
						this.showPurchaseMessage = false;
						this.purchaseData = null;

						// Convert single tag response to array format for table
						this.dataSource = [
							{
								id: "search-result",
								name: response.data.tagName,
								cid: response.data.tagObject?.cid || "",
								size: response.data.tagObject?.size || 0,
								number_of_files: 1,
								mime_type: response.data.tagObject?.mime_type || "",
								group_id: null,
								created_at: response.data.tagObject?.created_at || new Date().toISOString(),
								url: response.data.tagObject?.url || "",
								publicData: {
									avaxName: response.data.tagObject?.publicData?.avaxName || response.data.tagName,
									btcAddress: response.data.tagObject?.publicData?.btcAddress || "",
									domain: response.data.tagObject?.publicData?.domain || this.licenseDomain,
									ethAddress: response.data.tagObject?.publicData?.ethAddress || "",
									extraParams: response.data.tagObject?.publicData?.extraParams || "",
									solanaAddress: response.data.tagObject?.publicData?.solanaAddress || "",
								},
							},
						];
					}
				}
			})
			.catch((error) => {
				console.error("Tag search error:", error);
				// Clear data on error
				this.dataSource = [];
				this.showPurchaseMessage = false;
				this.purchaseData = null;
			});
	}

	private searchByDomain(): void {
		if (!this.licenseDomain) {
			return;
		}

		const domainParams: DomainSearchParams = {
			domain: this.licenseDomain,
			storage: this.selectedStorage,
			limit: this.pageSize,
			offset: (this.currentPage - 1) * this.pageSize,
		};

		this.tagsService
			.searchByDomain(domainParams)
			.then((response) => {
				if (response.data && Array.isArray(response.data)) {
					this.dataSource = response.data;

					// Update pagination info if provided
					if (response.total !== undefined) {
						this.totalItems = response.total;
						this.totalPages = Math.ceil(this.totalItems / this.pageSize);
						this.updateVisiblePages();
					} else {
						// If total is not provided, estimate from data length
						if (response.data.length < this.pageSize) {
							this.totalItems = (this.currentPage - 1) * this.pageSize + response.data.length;
							this.totalPages = Math.ceil(this.totalItems / this.pageSize);
							this.updateVisiblePages();
						}
					}
				} else {
					this.dataSource = [];
					this.totalItems = 0;
					this.totalPages = 1;
					this.updateVisiblePages();
				}
			})
			.catch((error) => {
				// Clear data on error
				this.dataSource = [];
				this.totalItems = 0;
				this.totalPages = 1;
				this.updateVisiblePages();
			});
	}

	hasActiveFilters(): boolean {
		return this.searchType !== "all" || this.selectedStorage !== "IPFS" || this.searchQuery.trim() !== "";
	}

	getSearchTypeLabel(): string {
		const labels: { [key: string]: string } = {
			all: "tags.filters.all",
			name: "tags.filters.tagName",
			blockdag: "tags.filters.blockdagAddress",
			eth: "tags.filters.ethAddress",
			solana: "tags.filters.solanaAddress",
			bitcoin: "tags.filters.bitcoinAddress",
			sui: "tags.filters.suiAddress",
		};
		// This will be handled by the template using transloco pipe
		return labels[this.searchType] || "tags.filters.all";
	}

	clearFilters(): void {
		this.searchType = "all";
		this.selectedStorage = "IPFS";
		this.searchQuery = "";
		this.currentPage = 1;
		this.showPurchaseMessage = false;
		this.purchaseData = null;
		this.performSearch();
	}

	removeSearchTypeFilter(): void {
		this.searchType = "all";
		this.showPurchaseMessage = false;
		this.purchaseData = null;
		this.performSearch();
	}

	// Removed removeDomainFilter - domain is always from license

	removeStorageFilter(): void {
		this.selectedStorage = "IPFS";
		this.currentPage = 1;
		this.showPurchaseMessage = false;
		this.purchaseData = null;
		this.performSearch();
	}

	clearSearchQuery(): void {
		this.searchQuery = "";
		this.showPurchaseMessage = false;
		this.purchaseData = null;
		// Emit empty string to debounced search subject
		this.searchSubject.next("");
	}
}
