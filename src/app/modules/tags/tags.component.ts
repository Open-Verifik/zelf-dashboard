import { Component, ViewEncapsulation, OnInit, OnDestroy } from "@angular/core";
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
import { QRCodeModalComponent } from "./qr-code-modal.component";
import { DetailsModalComponent } from "./details-modal.component";
import { EditModalComponent } from "./edit-modal.component";
import { TagsService, TagSearchParams, DomainSearchParams } from "./tags.service";
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from "rxjs";

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
	],
})
export class TagsComponent implements OnInit, OnDestroy {
	displayedColumns: string[] = ["name", "domain", "created_at", "size", "actions"];
	dataSource: TagRecord[] = [];

	// Pagination properties
	currentPage: number = 1;
	pageSize: number = 10;
	totalPages: number = 5;
	totalItems: number = 50;
	pageSizeOptions: number[] = [5, 10, 25, 50];
	visiblePages: (number | string)[] = [1, 2, 3, 4, 5];

	// Search and Filter properties
	searchType: string = "all";
	selectedDomain: string = "all";
	selectedStorage: string = "all";
	searchQuery: string = "";
	availableDomains: string[] = ["avax", "eth", "btc", "sol"];
	availableStorage: string[] = ["IPFS", "Arweave", "Walrus", "NFT"];

	// Debounced search properties
	private searchSubject = new Subject<string>();
	private destroy$ = new Subject<void>();
	isSearching: boolean = false;

	// Purchase message properties
	showPurchaseMessage: boolean = false;
	purchaseData: PurchaseData | null = null;

	constructor(
		private dialog: MatDialog,
		private tagsService: TagsService
	) {}

	ngOnInit(): void {
		this.updateVisiblePages();

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

		// Load initial data from API
		this.performSearch();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
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
				console.log("QR Code modal closed with result:", result);
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
				console.log("Edit modal closed with result:", result);
				// Here you would typically make an API call to extend the lease
				this.handleLeaseExtension(result);
			}
		});
	}

	private handleLeaseExtension(extensionData: any): void {
		// TODO: Implement actual API call to extend lease
		console.log("Extending lease:", extensionData);
		// You would typically:
		// 1. Make an API call to extend the lease
		// 2. Update the local data source
		// 3. Show a success/error message
		// 4. Refresh the table data
	}

	deleteRecord(record: TagRecord): void {
		if (!this.canDelete(record)) {
			console.warn("Cannot delete record - not a .hold tag");
			return;
		}

		// TODO: Implement confirmation dialog and delete functionality
		console.log("Deleting record:", record);
		// You would typically:
		// 1. Show a confirmation dialog
		// 2. Make an API call to delete the record
		// 3. Update the local data source
		// 4. Show a success/error message
	}

	// Pagination methods
	goToFirstPage(): void {
		this.currentPage = 1;
		this.updateVisiblePages();
		console.log("Going to first page");
		this.performSearch();
	}

	goToPreviousPage(): void {
		if (this.currentPage > 1) {
			this.currentPage--;
			this.updateVisiblePages();
			console.log("Going to previous page:", this.currentPage);
			this.performSearch();
		}
	}

	goToNextPage(): void {
		if (this.currentPage < this.totalPages) {
			this.currentPage++;
			this.updateVisiblePages();
			console.log("Going to next page:", this.currentPage);
			this.performSearch();
		}
	}

	goToLastPage(): void {
		this.currentPage = this.totalPages;
		this.updateVisiblePages();
		console.log("Going to last page");
		this.performSearch();
	}

	goToPage(page: number | string): void {
		if (typeof page === "number" && page >= 1 && page <= this.totalPages) {
			this.currentPage = page;
			this.updateVisiblePages();
			console.log("Going to page:", page);
			this.performSearch();
		}
	}

	onPageSizeChange(): void {
		this.currentPage = 1;
		this.totalPages = Math.ceil(this.totalItems / this.pageSize);
		this.updateVisiblePages();
		console.log("Page size changed to:", this.pageSize);
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
		console.log("Search query changed:", this.searchQuery);
		// Set loading state when user starts typing
		this.isSearching = true;
		// Emit to debounced search subject instead of calling performSearch directly
		this.searchSubject.next(this.searchQuery);
	}

	onDomainChange(): void {
		console.log("Domain filter changed:", this.selectedDomain);
		this.performSearch();
	}

	onStorageChange(): void {
		console.log("Storage filter changed:", this.selectedStorage);
		this.performSearch();
	}

	performSearch(): void {
		console.log("Performing search with:", {
			searchType: this.searchType,
			selectedDomain: this.selectedDomain,
			selectedStorage: this.selectedStorage,
			searchQuery: this.searchQuery,
		});

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
			domain: this.selectedDomain !== "all" ? this.selectedDomain : undefined,
			os: "DESKTOP",
		};

		this.tagsService
			.searchTag(searchParams)
			.then((response) => {
				console.log("Tag search response:", response);
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
									domain: response.data.tagObject?.publicData?.domain || this.selectedDomain,
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
		const domainParams: DomainSearchParams = {
			domain: this.selectedDomain !== "all" ? this.selectedDomain : "avax",
			storage: this.selectedStorage !== "all" ? this.selectedStorage : "IPFS",
			limit: this.pageSize,
			offset: (this.currentPage - 1) * this.pageSize,
		};

		this.tagsService
			.searchByDomain(domainParams)
			.then((response) => {
				console.log("Domain search response:", response);
				if (response.data && Array.isArray(response.data)) {
					this.dataSource = response.data;
					// Update pagination info if provided
					if (response.total) {
						this.totalItems = response.total;
						this.totalPages = Math.ceil(this.totalItems / this.pageSize);
						this.updateVisiblePages();
					}
				}
			})
			.catch((error) => {
				console.error("Domain search error:", error);
				// Clear data on error
				this.dataSource = [];
			});
	}

	hasActiveFilters(): boolean {
		return this.searchType !== "all" || this.selectedDomain !== "all" || this.selectedStorage !== "all" || this.searchQuery.trim() !== "";
	}

	getSearchTypeLabel(): string {
		const labels: { [key: string]: string } = {
			all: "All",
			name: "Tag Name",
			blockdag: "BlockDAG Address",
			eth: "ETH Address",
			solana: "Solana Address",
			bitcoin: "Bitcoin Address",
			sui: "SUI Address",
		};
		return labels[this.searchType] || "All";
	}

	clearFilters(): void {
		this.searchType = "all";
		this.selectedDomain = "all";
		this.selectedStorage = "all";
		this.searchQuery = "";
		this.showPurchaseMessage = false;
		this.purchaseData = null;
		this.performSearch();
		console.log("All filters cleared");
	}

	removeSearchTypeFilter(): void {
		this.searchType = "all";
		this.showPurchaseMessage = false;
		this.purchaseData = null;
		this.performSearch();
	}

	removeDomainFilter(): void {
		this.selectedDomain = "all";
		this.showPurchaseMessage = false;
		this.purchaseData = null;
		this.performSearch();
	}

	removeStorageFilter(): void {
		this.selectedStorage = "all";
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
