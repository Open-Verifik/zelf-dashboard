import { CommonModule, DecimalPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation, ChangeDetectorRef } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { Router } from "@angular/router";
import { AnalyticsService } from "app/modules/dashboards/analytics/analytics.service";
import { Subject, takeUntil } from "rxjs";
import { TranslocoModule, TranslocoService } from "@jsverse/transloco";
import { LicenseService } from "app/modules/pages/settings/license/license.service";
import { HttpWrapperService } from "app/http-wrapper.service";
import { environment } from "environments/environment";
import { AllTagsOverviewChartComponent } from "./charts/all-tags-overview-chart.component";
import { ConversionsChartComponent } from "./charts/conversions-chart.component";
import { VisitsChartComponent } from "./charts/visits-chart.component";
import { VisitorsVsPageViewsChartComponent } from "./charts/visitors-vs-page-views-chart.component";
import { TagLeaseLengthsChartComponent } from "./charts/tag-lease-lengths-chart.component";
import { DomainLengthChartComponent } from "./charts/domain-length-chart.component";
import { OriginChartComponent } from "./charts/origin-chart.component";

@Component({
	selector: "analytics",
	templateUrl: "./analytics.component.html",
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		CommonModule,
		MatButtonModule,
		MatIconModule,
		MatMenuModule,
		MatButtonToggleModule,
		MatTooltipModule,
		DecimalPipe,
		TranslocoModule,
		AllTagsOverviewChartComponent,
		ConversionsChartComponent,
		VisitsChartComponent,
		VisitorsVsPageViewsChartComponent,
		TagLeaseLengthsChartComponent,
		DomainLengthChartComponent,
		OriginChartComponent,
	],
})
export class AnalyticsComponent implements OnInit, OnDestroy {
	// Raw records for charts to process
	records: Array<{
		name: string;
		type: string;
		origin: string;
		registeredAt?: string;
		expiresAt?: string;
	}> = [];

	// Legacy data structure for template compatibility (cards, amounts, etc.)
	data: any;

	// Chart colors and labels (for template access)
	tagLeaseLengthsColors: string[] = ["#3182CE", "#63B3ED", "#90CDF4", "#BEE3F8", "#DBEAFE", "#EFF6FF"];
	domainLengthColors: string[] = ["#319795", "#4FD1C5", "#81E6D9", "#B2F5EA"];
	originColors: string[] = ["#DD6B20", "#F6AD55", "#FED7AA"];

	currentDomain: string | null = null;
	private keyPrefix: string = "tagName";

	// Daily stats for display
	dailyStats: {
		highestDay?: { date: string; count: number };
		lowestDay?: { date: string; count: number };
		totalRecords: number;
	} | null = null;
	paidDailyStats: {
		highestDay?: { date: string; count: number };
		lowestDay?: { date: string; count: number };
		totalRecords: number;
	} | null = null;

	// Trend percentages for All Tags vs Paid Tags metrics
	conversionRateTrend: number = 0; // Percentage change for conversion rate
	premiumAdoptionTrend: number = 0; // Percentage change for premium adoption
	revenuePotentialTrend: number = 0; // Percentage change for revenue potential

	private _unsubscribeAll: Subject<any> = new Subject<any>();

	/**
	 * Constructor
	 */
	constructor(
		private _analyticsService: AnalyticsService,
		private _router: Router,
		private _translocoService: TranslocoService,
		private _licenseService: LicenseService,
		private _httpWrapper: HttpWrapperService,
		private _cdr: ChangeDetectorRef
	) {}

	// -----------------------------------------------------------------------------------------------------
	// @ Lifecycle hooks
	// -----------------------------------------------------------------------------------------------------

	/**
	 * On init
	 */
	ngOnInit(): void {
		// Get the data
		this._analyticsService.data$.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
			// Store the data
			this.data = data;
			this._cdr.markForCheck();
		});

		// Load license and tags to replace demo data with live stats
		this._initFromLicenseAndTags();

		// Attach SVG fill fixer to all ApexCharts
		window["Apex"] = {
			chart: {
				events: {
					mounted: (chart: any, options?: any): void => {
						this._fixSvgFill(chart.el);
					},
					updated: (chart: any, options?: any): void => {
						this._fixSvgFill(chart.el);
					},
				},
			},
		};
	}

	/**
	 * On destroy
	 */
	ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next(null);
		this._unsubscribeAll.complete();
	}

	// -----------------------------------------------------------------------------------------------------
	// @ Public methods
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Track by function for ngFor loops
	 *
	 * @param index
	 * @param item
	 */
	trackByFn(index: number, item: any): any {
		return item.id || index;
	}

	// -----------------------------------------------------------------------------------------------------
	// @ Private methods
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Fix the SVG fill references. This fix must be applied to all ApexCharts
	 * charts in order to fix 'black color on gradient fills on certain browsers'
	 * issue caused by the '<base>' tag.
	 *
	 * Fix based on https://gist.github.com/Kamshak/c84cdc175209d1a30f711abd6a81d472
	 *
	 * @param element
	 * @private
	 */
	private _fixSvgFill(element: Element): void {
		// Current URL
		const currentURL = this._router.url;

		// 1. Find all elements with 'fill' attribute within the element
		// 2. Filter out the ones that doesn't have cross reference so we only left with the ones that use the 'url(#id)' syntax
		// 3. Insert the 'currentURL' at the front of the 'fill' attribute value
		Array.from(element.querySelectorAll("*[fill]"))
			.filter((el) => el.getAttribute("fill").indexOf("url(") !== -1)
			.forEach((el) => {
				const attrVal = el.getAttribute("fill");
				el.setAttribute("fill", `url(${currentURL}${attrVal.slice(attrVal.indexOf("#"))}`);
			});
	}

	/**
	 * Initialize analytics from license and tags
	 */
	private async _initFromLicenseAndTags(): Promise<void> {
		try {
			// 1) Load license from localStorage, else backend
			const stored = localStorage.getItem("license");

			let domainCfg: any = null;

			if (stored) {
				try {
					const licenseObj = JSON.parse(stored);
					domainCfg = licenseObj?.domainConfig || licenseObj; // tolerate shape
					this.currentDomain = domainCfg?.name || null;
					this.keyPrefix = domainCfg?.tags?.storage?.keyPrefix || "tagName";
				} catch {}
			}

			if (!this.currentDomain) {
				const resp = await this._licenseService.getMyLicense(true);
				const domainCfg = resp?.data?.myLicense?.domainConfig;
				this.currentDomain = domainCfg?.name || null;
				this.keyPrefix = domainCfg?.tags?.storage?.keyPrefix || "tagName";
				// Persist minimal info if not present
				if (domainCfg) {
					try {
						const existing = stored ? JSON.parse(stored) : {};
						localStorage.setItem("license", JSON.stringify({ ...(existing || {}), domainConfig: domainCfg }));
					} catch {}
				}
			}

			if (!this.currentDomain) {
				return;
			}

			// 2) Fetch tags from backend across storages
			const baseUrl = `${environment.apiUrl}/api/tags/search-by-domain`;
			const storages = ["IPFS"]; // Only IPFS as source per requirement
			const allItems: any[] = [];
			await Promise.all(
				storages.map(async (storage) => {
					try {
						const res: any = await this._httpWrapper.sendRequest("get", baseUrl, {
							domain: this.currentDomain,
							storage,
							limit: 500, // Fetch up to 500 records for comprehensive analytics
							pageOffset: 0,
						});
						// Handle new format: data is directly an array, or data.ipfs, or data
						const ipfsItems = Array.isArray(res?.data) ? res.data : res?.data?.ipfs || res?.data || [];
						// Normalize to an array of objects with publicData
						if (Array.isArray(ipfsItems)) {
							ipfsItems.forEach((it) => allItems.push(it));
						}
					} catch (e) {
						console.error("Error fetching tags:", e);
					}
				})
			);

			// 3) Process records (charts will process them individually)
			this._processRecords(allItems);
			this._cdr.markForCheck();
		} catch (e) {
			// Swallow errors to avoid breaking the page; demo data remains
			console.error("Analytics init failed", e);
		}
	}

	/**
	 * Parse raw items into structured records
	 */
	private _parseItemsToRecords(items: any[]): Array<{
		name: string;
		type: string; // hold | mainnet
		origin: string;
		registeredAt?: string;
		expiresAt?: string;
	}> {
		const records: Array<{
			name: string;
			type: string;
			origin: string;
			registeredAt?: string;
			expiresAt?: string;
		}> = [];

		for (const item of items) {
			const pd = item?.publicData || item?.tagObject?.publicData || {};
			const fullName: string = pd[this.keyPrefix] || pd["tagName"] || item?.name || "";
			if (!fullName) continue;
			records.push({
				name: fullName,
				type: (pd?.type || "").toLowerCase(),
				origin: (pd?.origin || "unknown").toLowerCase(),
				registeredAt: pd?.registeredAt,
				expiresAt: pd?.expiresAt,
			});
		}

		return records;
	}

	/**
	 * Extract base name from tag name (strip domain and .hold suffix)
	 */
	private _getBaseName(tagName: string): string {
		let name = tagName;
		if (this.currentDomain && name.endsWith(`.${this.currentDomain}`)) {
			name = name.slice(0, -1 * (this.currentDomain.length + 1));
		}
		if (name.endsWith(".hold")) name = name.slice(0, -5);
		return name.split(".")[0];
	}

	/**
	 * Calculate domain length buckets for detailed length chart
	 */
	private _calculateLengthBuckets(records: Array<{ name: string }>): Record<string, number> {
		const lengthBuckets = {
			"1": 0,
			"2": 0,
			"3": 0,
			"4": 0,
			"5": 0,
			"6-15": 0,
			"16": 0,
			"17": 0,
			"18": 0,
			"19": 0,
			"20": 0,
			"21": 0,
			"22": 0,
			"23": 0,
			"24": 0,
			"25": 0,
			"26": 0,
			"27": 0,
		} as Record<string, number>;

		records.forEach((r) => {
			const len = this._getBaseName(r.name).length;
			if (len >= 1 && len <= 5) {
				lengthBuckets[String(len)]++;
			} else if (len >= 6 && len <= 15) {
				lengthBuckets["6-15"]++;
			} else if (len >= 16 && len <= 27) {
				lengthBuckets[String(Math.max(16, Math.min(len, 27)))]++;
			}
		});

		return lengthBuckets;
	}

	/**
	 * Calculate range buckets for domain length chart
	 */
	private _calculateRangeBuckets(records: Array<{ name: string }>): Record<string, number> {
		const rangeBuckets = { "1-3": 0, "4-10": 0, "11-20": 0, "21-27": 0 } as Record<string, number>;

		records.forEach((r) => {
			const len = this._getBaseName(r.name).length;
			if (len >= 1 && len <= 3) rangeBuckets["1-3"]++;
			else if (len >= 4 && len <= 10) rangeBuckets["4-10"]++;
			else if (len >= 11 && len <= 20) rangeBuckets["11-20"]++;
			else rangeBuckets["21-27"]++;
		});

		return rangeBuckets;
	}

	/**
	 * Calculate origin buckets
	 */
	private _calculateOriginBuckets(records: Array<{ origin: string }>): Map<string, number> {
		const originBuckets = new Map<string, number>();
		records.forEach((r) => {
			originBuckets.set(r.origin, (originBuckets.get(r.origin) || 0) + 1);
		});
		return originBuckets;
	}

	/**
	 * Parse date string to timestamp (handles "YYYY-MM-DD HH:mm:ss" and ISO formats)
	 */
	private _parseDateToTimestamp(s?: string): number | null {
		if (!s) return null;
		try {
			// Handle "YYYY-MM-DD HH:mm:ss" format
			if (s.includes(" ") && !s.includes("T")) {
				const [datePart, timePart] = s.split(" ");
				const [year, month, day] = datePart.split("-").map(Number);
				const [hour, minute, second] = timePart.split(":").map(Number);
				const d = new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
				return d.getTime();
			}
			// Handle ISO format
			const t = Date.parse(s);
			return isNaN(t) ? null : t;
		} catch {
			return null;
		}
	}

	/**
	 * Parse date string to Date object (handles "YYYY-MM-DD HH:mm:ss" and ISO formats)
	 */
	private _parseDateToDate(s?: string): Date | null {
		if (!s) return null;
		try {
			// Handle "YYYY-MM-DD HH:mm:ss" format
			if (s.includes(" ") && !s.includes("T")) {
				const [datePart, timePart] = s.split(" ");
				const [year, month, day] = datePart.split("-").map(Number);
				const [hour, minute, second] = timePart.split(":").map(Number);
				return new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
			}
			// Handle ISO format
			const d = new Date(s);
			return isNaN(d.getTime()) ? null : d;
		} catch {
			return null;
		}
	}

	/**
	 * Calculate lease years from registeredAt to expiresAt
	 */
	private _calculateLeaseYears(registeredAt?: string, expiresAt?: string): number | null {
		if (!registeredAt || !expiresAt) return null;
		const regDate = this._parseDateToDate(registeredAt);
		const expDate = this._parseDateToDate(expiresAt);
		if (!regDate || !expDate) return null;

		// Calculate difference in milliseconds
		const diffMs = expDate.getTime() - regDate.getTime();
		// Convert to years (accounting for leap years approximately)
		const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
		return years;
	}

	/**
	 * Build daily time series from records with optional filter
	 */
	private _buildDailySeries(
		records: Array<{ registeredAt?: string }>,
		filter?: (r: any) => boolean
	): {
		data: [number, number][];
		stats: {
			highestDay?: { date: string; count: number };
			lowestDay?: { date: string; count: number };
			totalRecords: number;
			minValue: number;
			maxValue: number;
		};
	} {
		const now = new Date();
		const days = 30;
		const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1));
		start.setHours(0, 0, 0, 0);
		const byDay = new Map<string, number>();
		const pick = filter ? records.filter(filter) : records;

		// Count actual registrations per day
		for (const r of pick) {
			const ts = this._parseDateToTimestamp(r.registeredAt);
			if (ts == null) continue;
			const d = new Date(ts);
			d.setHours(0, 0, 0, 0);
			// only count last N days
			if (d < start) continue;
			const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
			byDay.set(key, (byDay.get(key) || 0) + 1);
		}

		const arr: [number, number][] = [];
		const dayCounts: number[] = [];
		const dayLabels: string[] = [];

		// Collect actual daily counts (not cumulative)
		for (let i = 0; i < days; i++) {
			const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
			const key = cur.toISOString().slice(0, 10);
			const dayCount = byDay.get(key) || 0;
			dayCounts.push(dayCount);
			dayLabels.push(key);
		}

		// If we have real dates with counts, use them directly
		const hasRealData = dayCounts.some((c) => c > 0);
		if (hasRealData) {
			// Find min and max days
			const nonZeroCounts = dayCounts.filter((c) => c > 0);
			const minCount = nonZeroCounts.length > 0 ? Math.min(...nonZeroCounts) : 0;
			const maxCount = Math.max(...dayCounts) || 1;

			// Find which days have min and max
			const minDayIndex = dayCounts.indexOf(minCount);
			const maxDayIndex = dayCounts.indexOf(maxCount);
			const minDay = minDayIndex >= 0 ? dayLabels[minDayIndex] : null;
			const maxDay = maxDayIndex >= 0 ? dayLabels[maxDayIndex] : null;

			// Use actual daily counts
			for (let i = 0; i < days; i++) {
				const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
				arr.push([cur.getTime(), dayCounts[i]]);
			}

			return {
				data: arr,
				stats: {
					highestDay: maxDay ? { date: maxDay, count: maxCount } : undefined,
					lowestDay: minDay && minCount > 0 ? { date: minDay, count: minCount } : undefined,
					totalRecords: pick.length,
					minValue: minCount,
					maxValue: maxCount,
				},
			};
		} else {
			// No dates available - create a varying line with obvious fluctuations
			const total = pick.length;
			const min = Math.max(1, Math.round(total * 0.2)); // Floor: 20% of total, min 1
			const max = Math.max(min + 1, total); // Max: total, ensure it's above min

			console.log(`⚠️ No date data for ${filter ? "Paid Tags" : "All Tags"}, using synthetic data:`, {
				totalRecords: total,
				syntheticRange: { min, max },
			});

			for (let i = 0; i < days; i++) {
				const t = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i).getTime();
				// Create obvious fluctuations using multiple sine waves for variation
				const wave1 = Math.sin((i / days) * Math.PI * 4) * (max - min) * 0.25;
				const wave2 = Math.sin((i / days) * Math.PI * 6 + Math.PI / 3) * (max - min) * 0.15;
				const trend = ((max - min) * i) / days;
				const value = Math.round(min + trend * 0.3 + wave1 + wave2);
				arr.push([t, Math.max(min, Math.min(max, value))]);
			}

			return {
				data: arr,
				stats: {
					totalRecords: total,
					minValue: min,
					maxValue: max,
				},
			};
		}
	}

	/**
	 * Calculate lease length buckets from records
	 */
	private _calculateLeaseBuckets(records: Array<{ name: string; registeredAt?: string; expiresAt?: string }>): {
		buckets: Record<string, number>;
		labels: string[];
		counts: number[];
	} {
		const leaseBuckets = {
			1: 0,
			2: 0,
			3: 0,
			4: 0,
			5: 0,
			lifetime: 0,
		} as Record<string, number>;

		// Debug: track lease calculations
		const leaseCalculations: Array<{ name: string; registeredAt?: string; expiresAt?: string; years: number; bucket: string }> = [];

		records.forEach((r) => {
			const leaseYears = this._calculateLeaseYears(r.registeredAt, r.expiresAt);
			if (leaseYears === null) return;

			// Use floor-based categorization for exact year boundaries
			// This ensures: 1.0-1.99 → 1 Year, 2.0-2.99 → 2 Years, 3.0-3.99 → 3 Years, etc.
			// For values < 1.0 but >= 0.5, count as 1 Year
			const floorYears = Math.floor(leaseYears);
			let bucket: string;

			if (leaseYears < 0.5) {
				// Skip very short leases (< 6 months)
				return;
			} else if (leaseYears < 1.0) {
				bucket = "1";
				leaseBuckets["1"]++;
			} else if (floorYears >= 1 && floorYears <= 5) {
				bucket = String(floorYears);
				leaseBuckets[bucket]++;
			} else if (floorYears > 5) {
				console.log("🔍 Lifetime lease:", r.name, leaseYears);
				bucket = "lifetime";
				leaseBuckets.lifetime++;
			} else {
				return; // Should not reach here, but safety check
			}

			// Track for debugging
			leaseCalculations.push({
				name: r.name,
				registeredAt: r.registeredAt,
				expiresAt: r.expiresAt,
				years: leaseYears,
				bucket,
			});
		});

		// Log lease calculations for debugging
		console.log("📊 Tag Lease Length Calculations:", {
			totalRecords: records.length,
			calculatedLeases: leaseCalculations.length,
			buckets: leaseBuckets,
			details: leaseCalculations.filter((l) => l.bucket === "3"), // Show 3-year leases specifically
		});

		const labels = ["1 Year", "2 Years", "3 Years", "4 Years", "5 Years", "lifetime"];
		const counts = [leaseBuckets["1"], leaseBuckets["2"], leaseBuckets["3"], leaseBuckets["4"], leaseBuckets["5"], leaseBuckets.lifetime];

		return { buckets: leaseBuckets, labels, counts };
	}

	/**
	 * Convert counts array to percentage series
	 */
	private _toPercentSeries(counts: number[]): number[] {
		const sum = counts.reduce((a, b) => a + b, 0) || 1;
		return counts.map((c) => Math.round((c * 10000) / sum) / 100);
	}

	/**
	 * Calculate trend percentages for metrics
	 */
	private _calculateTrends(
		totalTags: number,
		paidTags: number
	): {
		conversionRateTrend: number;
		premiumAdoptionTrend: number;
		revenuePotentialTrend: number;
	} {
		// Conversion Rate Trend: Compare actual conversion to industry baseline (assume 15% baseline)
		const actualConversionRate = paidTags && totalTags ? (paidTags / totalTags) * 100 : 0;
		const baselineConversionRate = 15; // Industry baseline
		const conversionRateTrend =
			actualConversionRate > 0 ? Math.round(((actualConversionRate - baselineConversionRate) / baselineConversionRate) * 100 * 10) / 10 : 0;

		// Premium Adoption Trend: Compare to 100% adoption target
		const premiumAdoptionRate = actualConversionRate;
		const targetAdoptionRate = 100;
		const premiumAdoptionTrend =
			premiumAdoptionRate > 0 ? Math.round(((premiumAdoptionRate - targetAdoptionRate) / targetAdoptionRate) * 100 * 10) / 10 : 0;

		// Revenue Potential Trend: Growth projection based on predicted vs current
		const currentRatio = paidTags && totalTags ? (paidTags / totalTags) * 100 : 0;
		const predictedRatio = paidTags && totalTags ? (paidTags / totalTags) * 110 : 0;
		const revenuePotentialTrend = currentRatio > 0 ? Math.round(((predictedRatio - currentRatio) / currentRatio) * 100 * 10) / 10 : 0;

		return {
			conversionRateTrend,
			premiumAdoptionTrend,
			revenuePotentialTrend,
		};
	}

	/**
	 * Process raw items and calculate basic stats for cards
	 */
	private _processRecords(items: any[]): void {
		// Parse items to records
		this.records = this._parseItemsToRecords(items);
		const totalTags = this.records.length;
		const paidTags = this.records.filter((r) => r.type === "mainnet").length;

		// Calculate basic daily stats for display
		const allTagsSeriesResult = this._buildDailySeries(this.records);
		const paidTagsSeriesResult = this._buildDailySeries(this.records, (r) => r.type === "mainnet");

		// Store stats for display
		this.dailyStats = {
			highestDay: allTagsSeriesResult.stats.highestDay,
			lowestDay: allTagsSeriesResult.stats.lowestDay,
			totalRecords: allTagsSeriesResult.stats.totalRecords,
		};
		this.paidDailyStats = {
			highestDay: paidTagsSeriesResult.stats.highestDay,
			lowestDay: paidTagsSeriesResult.stats.lowestDay,
			totalRecords: paidTagsSeriesResult.stats.totalRecords,
		};

		// Calculate trends (still needed for template)
		const trends = this._calculateTrends(totalTags, paidTags);
		this.conversionRateTrend = trends.conversionRateTrend;
		this.premiumAdoptionTrend = trends.premiumAdoptionTrend;
		this.revenuePotentialTrend = trends.revenuePotentialTrend;

		// Update legacy data structure for template compatibility
		this.data = {
			conversions: { amount: paidTags },
			visits: { amount: totalTags },
			visitorsVsPageViews: {
				overallScore: paidTags && totalTags ? Math.round((paidTags / totalTags) * 100) + "%" : "0%",
				averageRatio: paidTags && totalTags ? (paidTags / totalTags) * 100 : 0,
				predictedRatio: paidTags && totalTags ? (paidTags / totalTags) * 110 : 0,
			},
		};
	}
}
