import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnInit, ViewEncapsulation, signal, ElementRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { Router, ActivatedRoute } from "@angular/router";
import { TranslocoModule, TranslocoService } from "@jsverse/transloco";
import { TagsService } from "../../../tags/tags.service";
import { SessionService } from "app/core/services/session.service";

@Component({
	selector: "portfolio-payment",
	templateUrl: "./payment.component.html",
	styleUrls: ["./payment.component.scss"],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule, MatIconModule, FormsModule, TranslocoModule],
})
export class PortfolioPaymentComponent implements OnInit {
	domains = signal<string[]>([".zelf", ".bdag"]); // Initialize with default domains
	selectedDomain: string = ".zelf"; // Use regular property for two-way binding
	searchTagName = signal<string>("");
	isLoading = signal<boolean>(true);
	paymentOptions = signal<any>(null);
	isSearching = signal<boolean>(false);
	searchError = signal<string | null>(null);
	showNameAvailable = signal<boolean>(false);
	selectedPaymentMethod = signal<string>("ETH");
	coinbaseUrl = signal<string | null>(null);
	selectedDuration = signal<number>(1); // Duration in years, default 1
	isDurationDropdownOpen = signal<boolean>(false);
	leaseDurationOptions = [
		{ value: 1, label: "1 Year" },
		{ value: 2, label: "2 Years" },
		{ value: 3, label: "3 Years" },
		{ value: 4, label: "4 Years" },
		{ value: 5, label: "5 Years" },
		{ value: 999, label: "Lifetime" },
	];

	getPricingDocsUrl(): string {
		const language = (navigator?.language || "en").toLowerCase();
		const isSpanish = language.startsWith("es");
		return isSpanish ? "https://docs.zelf.world/docs-es/airdrop/precios-por-dominio" : "https://docs.zelf.world/docs/airdrop/pricing-per-domain";
	}

	constructor(
		private tagsService: TagsService,
		private cdr: ChangeDetectorRef,
		private router: Router,
		private route: ActivatedRoute,
		private elementRef: ElementRef,
		private translocoService: TranslocoService,
		private sessionService: SessionService
	) {}

	@HostListener("document:click", ["$event"])
	handleClickOutside(event: Event): void {
		const clickedElement = event.target as HTMLElement;
		const dropdownButton = this.elementRef.nativeElement.querySelector("[data-duration-button]");
		const dropdownMenu = this.elementRef.nativeElement.querySelector("[data-duration-menu]");

		if (
			this.isDurationDropdownOpen() &&
			clickedElement !== dropdownButton &&
			!clickedElement.closest("[data-duration-menu]") &&
			!dropdownButton?.contains(clickedElement)
		) {
			this.isDurationDropdownOpen.set(false);
			this.cdr.markForCheck();
		}
	}

	async ngOnInit(): Promise<void> {
		// Initialize session for API access
		await this.sessionService.initializePaymentSession();

		await this.loadDomains();
		await this.checkQueryParams();
	}

	async checkQueryParams(): Promise<void> {
		// Check initial query params from snapshot
		const initialParams = this.route.snapshot.queryParams;
		if (initialParams["domain"]) {
			this.selectedDomain = `.${initialParams["domain"]}`;
		} else {
			// No query param domain, use first available
			const availableDomains = this.domains();
			if (availableDomains.length > 0) {
				this.selectedDomain = availableDomains[0];
			}
		}

		// Check if we should trigger search based on initial params
		if (initialParams["tagname"] && initialParams["domain"]) {
			const tagName = initialParams["tagname"];
			const domain = initialParams["domain"];
			const duration = initialParams["duration"] ? parseInt(initialParams["duration"], 10) : 1;

			// Set the form values
			this.searchTagName.set(tagName);
			this.selectedDomain = `.${domain}`;
			this.selectedDuration.set(duration);

			// Trigger search automatically with specified duration
			await this.performSearch(tagName, `.${domain}`, duration);
		}

		// Subscribe to future query param changes
		this.route.queryParams.subscribe(async (params) => {
			if (params["tagname"] && params["domain"]) {
				const tagName = params["tagname"];
				const domain = params["domain"];
				const duration = params["duration"] ? parseInt(params["duration"], 10) : 1;

				// Set the form values
				this.searchTagName.set(tagName);
				this.selectedDomain = `.${domain}`;
				this.selectedDuration.set(duration);

				// Trigger search automatically with specified duration
				await this.performSearch(tagName, `.${domain}`, duration);
			}
		});
	}

	async performSearch(tagName: string, domain: string, duration?: number): Promise<void> {
		const searchDuration = duration ?? this.selectedDuration();
		this.isSearching.set(true);
		this.searchError.set(null);
		this.showNameAvailable.set(false);

		const cacheKey = `payment_options_${tagName.trim()}_${domain}_${searchDuration}`;
		const cachedData = this.getCachedPaymentOptions(cacheKey);

		if (cachedData) {
			this.useCachedPaymentData(cachedData, searchDuration);
			this.isSearching.set(false);
			this.cdr.markForCheck();
			return;
		}

		await this.fetchAndSavePaymentData(tagName, domain, searchDuration, cacheKey);
		this.isSearching.set(false);
		this.cdr.markForCheck();
	}

	private useCachedPaymentData(cachedData: any, fallbackDuration: number): void {
		this.paymentOptions.set(cachedData);
		this.selectedPaymentMethod.set("ETH");
		this.selectedDuration.set(cachedData.duration || fallbackDuration);

		if (cachedData.coinbase_hosted_url) {
			this.coinbaseUrl.set(cachedData.coinbase_hosted_url);
		}

		if (cachedData.signedDataPrice) {
			localStorage.setItem("signedDataPrice", cachedData.signedDataPrice);
		}
	}

	private async fetchAndSavePaymentData(tagName: string, domain: string, duration: number, cacheKey: string): Promise<void> {
		this.paymentOptions.set(null);
		this.coinbaseUrl.set(null);
		localStorage.removeItem("signedDataPrice");

		try {
			const response = await this.tagsService.getPaymentOptions({
				tagName: tagName.trim(),
				domain: domain.replace(".", ""),
				duration: duration,
			});

			if ("error" in response.data) {
				this.handleSearchError(response.data.error);
			} else {
				this.processPaymentResponse(response.data, duration, cacheKey);
			}
		} catch (error: any) {
			console.error("Error fetching payment options:", error);

			this.handleSearchError("tag_not_found");
		}
	}

	private handleSearchError(error: string): void {
		if (error === "tag_not_found") {
			// Tag not found means the name is available!
			this.showNameAvailable.set(true);
			this.searchError.set(null);
		} else {
			this.showNameAvailable.set(false);
			const errorMessage = error || "Unknown error occurred";
			this.searchError.set(errorMessage);
		}
	}

	private processPaymentResponse(data: any, duration: number, cacheKey: string): void {
		this.paymentOptions.set(data);
		this.selectedPaymentMethod.set("ETH");
		this.selectedDuration.set(duration);

		this.saveCachedPaymentOptions(cacheKey, data);
		this.saveSignedDataPrice(data);
		this.saveCoinbaseUrl(data);
	}

	private saveSignedDataPrice(data: any): void {
		if (data.signedDataPrice) {
			localStorage.setItem("signedDataPrice", data.signedDataPrice);
		}
	}

	private saveCoinbaseUrl(data: any): void {
		if (data.coinbase_hosted_url) {
			this.coinbaseUrl.set(data.coinbase_hosted_url);
		}
	}

	private getCachedPaymentOptions(cacheKey: string): any | null {
		try {
			const cached = localStorage.getItem(cacheKey);

			if (!cached) return null;

			const data = JSON.parse(cached);

			// Check if the cached data has expired based on TTL
			if (data.ttl && data.ttl > 0) {
				const currentTimestamp = Math.floor(Date.now() / 1000);
				if (currentTimestamp >= data.ttl) {
					// Cache expired, remove it
					localStorage.removeItem(cacheKey);
					return null;
				}
			}

			return data;
		} catch (error) {
			console.error("Error reading cached payment options:", error);
			return null;
		}
	}

	private saveCachedPaymentOptions(cacheKey: string, data: any): void {
		try {
			localStorage.setItem(cacheKey, JSON.stringify(data));
		} catch (error) {
			console.error("Error saving cached payment options:", error);
		}
	}

	async loadDomains(): Promise<void> {
		this.isLoading.set(true);

		try {
			const response = await this.tagsService.getDomains();

			if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
				this.domains.set(response.data);
			}
		} catch (error) {
			console.error("Error loading domains:", error);
			// Keep default domains that are already set
		} finally {
			this.isLoading.set(false);

			this.cdr.markForCheck();
		}
	}

	async onDomainChange(): Promise<void> {
		const tagName = this.searchTagName();

		// Only trigger search if there's a search term
		if (tagName && tagName.trim() !== "") {
			await this.onSearch();
		}
	}

	async onSearch(): Promise<void> {
		const tagName = this.searchTagName();
		const domain = this.selectedDomain;
		const duration = this.selectedDuration();

		if (!tagName || tagName.trim() === "") {
			this.searchError.set(this.translocoService.translate("payment.pleaseEnterTagName"));

			return;
		}

		await this.performSearch(tagName, domain, duration);

		// Update URL with query parameters after successful search
		this.router.navigate([], {
			relativeTo: this.route,
			queryParams: {
				tagname: tagName.trim(),
				domain: domain.replace(".", ""),
				duration: duration,
			},
			replaceUrl: true,
		});
	}

	getPrice(): string | number {
		const options = this.paymentOptions();
		if (!options?.prices) return "N/A";

		// Return the price from the first available currency
		return (
			options.prices.ETH?.price ||
			options.prices.BTC?.price ||
			options.prices.AVAX?.price ||
			options.prices.SOL?.price ||
			options.publicData.price
		);
	}

	async onDurationChange(newDuration: number): Promise<void> {
		this.selectedDuration.set(newDuration);

		const tagName = this.searchTagName();
		const domain = this.selectedDomain;

		if (!tagName || tagName.trim() === "") {
			return;
		}

		// Re-fetch payment options with new duration
		await this.performSearch(tagName, domain, newDuration);

		// Update URL with new duration parameter
		this.router.navigate([], {
			relativeTo: this.route,
			queryParams: {
				tagname: tagName.trim(),
				domain: domain.replace(".", ""),
				duration: newDuration,
			},
			replaceUrl: true,
		});
	}

	getDurationLabel(duration: number): string {
		if (duration === 999) return "Lifetime";
		return duration === 1 ? "1 Year" : `${duration} Years`;
	}

	toggleDurationDropdown(): void {
		this.isDurationDropdownOpen.update((value) => !value);
	}

	selectDuration(duration: number): void {
		this.isDurationDropdownOpen.set(false);
		this.onDurationChange(duration);
	}

	onPurchaseNow(): void {
		const options = this.paymentOptions();
		const tagName = this.searchTagName();
		const domain = this.selectedDomain;
		const duration = this.selectedDuration();
		const paymentMethod = this.selectedPaymentMethod();

		if (!options) return;

		const price = this.getPrice();
		const ethAddress = options.paymentAddress?.ethAddress || "";
		const amountToPay = options.prices?.[paymentMethod]?.amountToSend || "";

		// Build query params
		const queryParams: any = {
			tagname: tagName,
			domain: domain.replace(".", ""),
			duration: duration,
			price: price,
			paymentMethod: paymentMethod,
			ethAddress: ethAddress,
			amountToPay: amountToPay,
		};

		// Add coinbase-specific data if payment method is COINBASE
		if (paymentMethod === "COINBASE" && this.coinbaseUrl()) {
			queryParams.coinbaseUrl = this.coinbaseUrl();
			if (options.coinbase_expires_at) {
				queryParams.coinbaseExpiresAt = options.coinbase_expires_at;
			}
		}

		// Navigate to checkout with all the details
		this.router.navigate(["/portfolio/payment-checkout"], {
			queryParams: queryParams,
		});
	}
}
