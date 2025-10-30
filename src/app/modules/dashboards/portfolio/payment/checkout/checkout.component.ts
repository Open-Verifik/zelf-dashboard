import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy, ViewEncapsulation, signal, ElementRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { Router, ActivatedRoute } from "@angular/router";
import { TranslocoModule } from "@jsverse/transloco";
import { TagsService } from "../../../../tags/tags.service";
import { SessionService } from "app/core/services/session.service";
import { FuseConfigService } from "@fuse/services/config";
import { Subject, takeUntil } from "rxjs";

@Component({
	selector: "portfolio-payment-checkout",
	templateUrl: "./checkout.component.html",
	styleUrls: ["./checkout.component.scss"],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule, TranslocoModule],
})
export class PortfolioPaymentCheckoutComponent implements OnInit, OnDestroy {
	tagName = signal<string>("");
	domain = signal<string>("");
	duration = signal<number>(1);
	price = signal<number | string>("");
	paymentMethod = signal<string>("ETH");
	ethAddress = signal<string>("");
	amountToPay = signal<string>("");
	qrcodeUrl = signal<string>("");
	coinbaseUrl = signal<string>("");
	coinbaseExpiresAt = signal<string>("");
	isCheckingPayment = signal<boolean>(false);
	isPaymentConfirmed = signal<boolean>(false);
	amountReceived = signal<string>("");
	lastCheckTime = signal<Date | null>(null);
	receiptEmail = signal<string>("");
	isSendingReceipt = signal<boolean>(false);
	private isDarkMode = signal<boolean>(false);
	private qrCodeInstance: any | null = null;
	private qrContainerEl: HTMLElement | null = null;
	private paymentCheckInterval: any = null;
	private isCheckInProgress = false; // Flag to prevent overlapping payment checks
	private _unsubscribeAll = new Subject<void>();

	constructor(
		private cdr: ChangeDetectorRef,
		private router: Router,
		private route: ActivatedRoute,
		private elementRef: ElementRef,
		private snackBar: MatSnackBar,
		private tagsService: TagsService,
		private _fuseConfigService: FuseConfigService,
		private sessionService: SessionService
	) {}

	async ngOnInit(): Promise<void> {
		// Initialize session for API access
		await this.sessionService.initializePaymentSession();

		this.loadQueryParams();

		// Subscribe to theme changes from Fuse config
		this._fuseConfigService.config$.pipe(takeUntil(this._unsubscribeAll)).subscribe((config) => {
			const isDark = config.scheme === "dark" || (config.scheme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
			this.isDarkMode.set(isDark);

			// Regenerate QR code when theme changes
			void this.generateQRCode();
		});
	}

	private loadQueryParams(): void {
		this.route.queryParams.subscribe((params) => {
			this.tagName.set(params["tagname"] || "");
			this.domain.set(params["domain"] || "");
			this.duration.set(parseInt(params["duration"], 10) || 1);
			this.price.set(params["price"] || "");
			this.paymentMethod.set(params["paymentMethod"] || "ETH");
			this.ethAddress.set(params["ethAddress"] || "");
			this.amountToPay.set(params["amountToPay"] || "");
			this.coinbaseUrl.set(params["coinbaseUrl"] || "");
			this.coinbaseExpiresAt.set(params["coinbaseExpiresAt"] || "");

			// Generate QR code for payment address
			void this.generateQRCode();

			// Start payment checking
			this.startPaymentChecking();

			this.cdr.markForCheck();
		});
	}

	startPaymentChecking(): void {
		// Clear any existing interval
		if (this.paymentCheckInterval) {
			clearInterval(this.paymentCheckInterval);
		}

		// Start checking every 10 seconds
		this.paymentCheckInterval = setInterval(() => {
			void this.checkPaymentStatus();
		}, 10000);

		// Do an initial check immediately
		void this.checkPaymentStatus();
	}

	async checkPaymentStatus(): Promise<void> {
		// Prevent overlapping calls - if a check is already in progress, skip this one
		if (this.isCheckInProgress) {
			console.log("Payment check already in progress, skipping...");
			return;
		}

		const signedDataPrice = localStorage.getItem("signedDataPrice");

		if (!signedDataPrice) {
			return;
		}

		// Set flag to indicate check is in progress
		this.isCheckInProgress = true;
		this.isCheckingPayment.set(true);
		this.lastCheckTime.set(new Date());

		try {
			// Determine network based on payment method
			const network = this.getNetworkFromPaymentMethod();

			const response = await this.tagsService.checkPaymentConfirmation({
				tagName: this.tagName(),
				domain: this.domain(),
				token: signedDataPrice,
				network: network,
			});

			// Check if payment is confirmed
			if (response && response.data && response.data.confirmed === true) {
				// Stop checking
				if (this.paymentCheckInterval) {
					clearInterval(this.paymentCheckInterval);
					this.paymentCheckInterval = null;
				}

				// Update UI to show payment confirmed
				this.isPaymentConfirmed.set(true);

				// Store the amount received
				const receivedAmount = response.data.amountReceived || response.data.paymentConfirmation?.amountReceived || "0";
				this.amountReceived.set(receivedAmount);

				// Show success message
				this.snackBar.open("Payment confirmed successfully!", "Close", { duration: 5000 });

				// You can add redirect logic here
				// this.router.navigate(['/success-page']);
			}
		} catch (error) {
			console.error("Error checking payment status:", error);
		} finally {
			// Reset flag when check completes
			this.isCheckInProgress = false;
			this.isCheckingPayment.set(false);
			this.cdr.markForCheck();
		}
	}

	getNetworkFromPaymentMethod(): string {
		const method = this.paymentMethod();

		// Backend accepts: [coinbase, CB, ETH, SOL, BTC, AVAX]
		// Only COINBASE needs special handling, others pass through
		if (method === "COINBASE") {
			return "coinbase";
		}

		return method || "ETH"; // Return method as-is, default to ETH
	}

	ngOnDestroy(): void {
		if (this.paymentCheckInterval) {
			clearInterval(this.paymentCheckInterval);
		}
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	private async generateQRCode(): Promise<void> {
		// Determine what data to encode in QR code
		// For COINBASE, use the coinbase URL; for others, use the payment address
		let dataToEncode: string;
		if (this.paymentMethod() === "COINBASE" && this.coinbaseUrl()) {
			dataToEncode = this.coinbaseUrl();
		} else {
			dataToEncode = this.ethAddress();
		}

		if (!dataToEncode) return;

		// Locate the container once
		if (!this.qrContainerEl) {
			this.qrContainerEl = this.elementRef.nativeElement.querySelector("#qrContainer");
		}

		if (!this.qrContainerEl) {
			return;
		}

		// Lazy import to avoid type issues and reduce bundle size
		const { default: QRCodeStyling } = await import("qr-code-styling");

		// Clear the container before regenerating
		if (this.qrContainerEl) {
			this.qrContainerEl.innerHTML = "";
		}

		// Create QR code with theme-appropriate colors
		this.qrCodeInstance = new QRCodeStyling({
			width: 256,
			height: 256,
			type: "svg",
			data: dataToEncode,
			qrOptions: {
				errorCorrectionLevel: "M",
			},
			dotsOptions: {
				type: "dots",
				color: this.isDarkMode() ? "#ffffff" : "#111827", // white in dark mode, gray-900 in light
			},
			cornersSquareOptions: {
				type: "extra-rounded",
				color: this.isDarkMode() ? "#ffffff" : "#111827",
			},
			cornersDotOptions: {
				type: "dot",
				color: this.isDarkMode() ? "#ffffff" : "#111827",
			},
			backgroundOptions: {
				color: "transparent",
			},
		});
		this.qrCodeInstance.append(this.qrContainerEl);
	}

	getFullTagName(): string {
		return `${this.tagName()}.${this.domain()}`.toUpperCase();
	}

	getDurationLabel(): string {
		const dur = this.duration();
		if (dur === 999) return "Lifetime";
		return dur === 1 ? "1 Year" : `${dur} Years`;
	}

	getPriceInUSD(): string {
		const price = this.price();
		if (typeof price === "number") {
			return `$${price} USD`;
		}
		return `$${price} USD`;
	}

	getPricingDocsUrl(): string {
		const language = (navigator?.language || "en").toLowerCase();
		const isSpanish = language.startsWith("es");
		return isSpanish ? "https://docs.zelf.world/docs-es/airdrop/precios-por-dominio" : "https://docs.zelf.world/docs/airdrop/pricing-per-domain";
	}

	copyAddress(): void {
		const textToCopy = this.paymentMethod() === "COINBASE" && this.coinbaseUrl() ? this.coinbaseUrl() : this.ethAddress();
		navigator.clipboard.writeText(textToCopy).then(() => {
			this.snackBar.open("Address copied to clipboard", "Close", { duration: 2500 });
		});
	}

	openCoinbaseLink(): void {
		if (this.paymentMethod() === "COINBASE" && this.coinbaseUrl()) {
			window.open(this.coinbaseUrl(), "_blank", "noopener,noreferrer");
		}
	}

	getAddressToDisplay(): string {
		if (this.paymentMethod() === "COINBASE" && this.coinbaseUrl()) {
			return this.coinbaseUrl();
		}
		return this.ethAddress();
	}

	getExpirationDate(): string {
		if (this.paymentMethod() === "COINBASE" && this.coinbaseExpiresAt()) {
			const expiration = new Date(this.coinbaseExpiresAt());
			const now = new Date();
			const diffMs = expiration.getTime() - now.getTime();
			const diffMins = Math.floor(diffMs / 60000);

			if (diffMins > 0) {
				const hours = Math.floor(diffMins / 60);
				const mins = diffMins % 60;
				if (hours > 0) {
					return `${hours}h ${mins}m`;
				}
				return `${diffMins} minutes`;
			}
			return "Expired";
		}
		return "30 minutes";
	}

	copyAmount(): void {
		const amountToCopy = this.paymentMethod() === "COINBASE" ? `$${this.price()}` : this.amountToPay();
		navigator.clipboard.writeText(amountToCopy).then(() => {
			this.snackBar.open("Amount copied to clipboard", "Close", { duration: 2500 });
		});
	}

	goBack(): void {
		// If payment is confirmed, clear the localStorage cache and go back without queryParams
		if (this.isPaymentConfirmed()) {
			// Clear the payment data from localStorage
			localStorage.removeItem("signedDataPrice");
			//delete the  payment options from localStorage
			const key = `payment_options_${this.tagName()}_.${this.domain()}_${this.duration()}`;

			localStorage.removeItem(key);

			console.log("Deleted payment options from localStorage:", key);

			// Navigate back to payment options without any queryParams (fresh state)
			this.router.navigate(["/portfolio/payment"]);
		} else {
			// If payment is not confirmed, go back with queryParams to preserve the state
			this.router.navigate(["/portfolio/payment"], {
				queryParams: {
					tagname: this.tagName(),
					domain: this.domain(),
					duration: this.duration(),
				},
			});
		}
	}

	async sendReceipt(): Promise<void> {
		const email = this.receiptEmail().trim();
		if (!email) {
			this.snackBar.open("Please enter your email address", "Close", { duration: 3000 });
			return;
		}

		// Basic email validation
		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailPattern.test(email)) {
			this.snackBar.open("Please enter a valid email address", "Close", { duration: 3000 });
			return;
		}

		const signedDataPrice = localStorage.getItem("signedDataPrice");
		if (!signedDataPrice) {
			this.snackBar.open("Payment data not found", "Close", { duration: 3000 });
			return;
		}

		this.isSendingReceipt.set(true);

		try {
			const network = this.getNetworkFromPaymentMethod();

			const response = await this.tagsService.emailReceipt({
				tagName: this.tagName(),
				domain: this.domain(),
				email: email,
				token: signedDataPrice,
				network: network,
			});

			if (response && response.data) {
				this.snackBar.open("Receipt sent successfully to your email!", "Close", { duration: 5000 });
				this.receiptEmail.set("");
			}
		} catch (error) {
			console.error("Error sending receipt:", error);
			this.snackBar.open("Failed to send receipt. Please try again later.", "Close", { duration: 5000 });
		} finally {
			this.isSendingReceipt.set(false);
			this.cdr.markForCheck();
		}
	}
}
