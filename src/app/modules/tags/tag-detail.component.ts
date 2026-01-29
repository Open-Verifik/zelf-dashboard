import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { CommonModule, KeyValuePipe } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";
import { TranslocoModule } from "@jsverse/transloco";
import { TagsService } from "./tags.service";
import { TagRecord } from "./tags.component";
import { Subject, takeUntil } from "rxjs";

@Component({
	selector: "app-tag-detail",
	standalone: true,
	imports: [CommonModule, KeyValuePipe, MatButtonModule, MatIconModule, MatCardModule, MatChipsModule, TranslocoModule],
	templateUrl: "./tag-detail.component.html",
	styleUrls: ["./tag-detail.component.scss"],
})
export class TagDetailComponent implements OnInit, OnDestroy {
	tagId: string = "";
	tagName: string = "";
	domain: string = "";
	record: TagRecord | null = null;
	extraParams: Record<string, unknown> | null = null;
	isLoading = true;
	isNotFound = false;
	isAvailableForPurchase = false;
	purchasePrice: { price: number; currency: string; reward: number } | null = null;
	isDarkMode = false;
	private destroy$ = new Subject<void>();
	private darkModeObserver?: MutationObserver;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private tagsService: TagsService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this._checkDarkMode();
		this._watchDarkMode();

		this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
			this.tagId = params.get("tagId") || "";
			if (!this.tagId) {
				this.isNotFound = true;
				this.isLoading = false;
				this.cdr.markForCheck();
				return;
			}
			this._parseTagId();
			this._loadTag();
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
		this.darkModeObserver?.disconnect();
	}

	private _parseTagId(): void {
		const lastDot = this.tagId.lastIndexOf(".");
		if (lastDot > 0) {
			this.tagName = this.tagId.slice(0, lastDot);
			this.domain = this.tagId.slice(lastDot + 1);
		} else {
			this.tagName = this.tagId;
			this.domain = "";
		}
	}

	private _loadTag(): void {
		this.isLoading = true;
		this.isNotFound = false;
		this.isAvailableForPurchase = false;
		this.record = null;
		this.purchasePrice = null;

		const domain = this.domain || undefined;
		this.tagsService
			.searchTag({ tagName: this.tagName, domain, os: "DESKTOP" })
			.then((res) => {
				const d = res?.data;
				if (!d) {
					this.isNotFound = true;
					return;
				}
				if (d.available === true) {
					this.isAvailableForPurchase = true;
					this.purchasePrice = d.price
						? { price: d.price.price, currency: d.price.currency, reward: d.price.reward }
						: null;
					return;
				}
				const obj = d.tagObject;
				if (!obj) {
					this.isNotFound = true;
					return;
				}
				this.record = {
					id: (obj as any).id || "detail",
					name: d.tagName || this.tagId,
					cid: obj.cid || "",
					size: obj.size || 0,
					number_of_files: 1,
					mime_type: obj.mime_type || "",
					group_id: null,
					created_at: obj.created_at || new Date().toISOString(),
					url: obj.url || "",
					publicData: {
						avaxName: (obj.publicData as any)?.avaxName || d.tagName,
						btcAddress: (obj.publicData as any)?.btcAddress || "",
						domain: (obj.publicData as any)?.domain || this.domain,
						ethAddress: (obj.publicData as any)?.ethAddress || "",
						extraParams: (obj.publicData as any)?.extraParams || "",
						solanaAddress: (obj.publicData as any)?.solanaAddress || "",
					},
				};
				this._parseExtraParams();
			})
			.catch(() => {
				this.isNotFound = true;
			})
			.finally(() => {
				this.isLoading = false;
				this.cdr.markForCheck();
			});
	}

	private _parseExtraParams(): void {
		if (!this.record?.publicData?.extraParams) {
			this.extraParams = null;
			return;
		}
		try {
			this.extraParams = JSON.parse(this.record.publicData.extraParams) as Record<string, unknown>;
		} catch {
			this.extraParams = null;
		}
	}

	private _checkDarkMode(): void {
		this.isDarkMode =
			document.body.classList.contains("dark") || document.documentElement.classList.contains("dark");
		this.cdr.markForCheck();
	}

	private _watchDarkMode(): void {
		this.darkModeObserver = new MutationObserver(() => this._checkDarkMode());
		this.darkModeObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
		this.darkModeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
	}

	formatDate(s: string): string {
		return new Date(s).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	formatFileSize(bytes: number): string {
		if (bytes === 0) return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	}

	async copyAllData(): Promise<void> {
		if (!this.record) return;
		try {
			await navigator.clipboard.writeText(JSON.stringify(this.record, null, 2));
		} catch (e) {
			console.error("Copy failed", e);
		}
	}

	async copyUrl(): Promise<void> {
		if (!this.record?.url) return;
		try {
			await navigator.clipboard.writeText(this.record.url);
		} catch (e) {
			console.error("Copy failed", e);
		}
	}

	openUrl(): void {
		if (this.record?.url) window.open(this.record.url, "_blank");
	}

	qrImageSrc(): string {
		const url = this.record?.url || "";
		if (!url) return "";
		return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
	}

	onQrImageError(e: Event): void {
		const el = e.target as HTMLImageElement;
		if (el) el.style.display = "none";
	}

	backToList(): void {
		this.router.navigate(["/tags"]);
	}
}
