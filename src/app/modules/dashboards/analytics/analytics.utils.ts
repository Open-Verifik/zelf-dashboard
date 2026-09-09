export interface TagAnalyticsRecord {
	name: string;
	type: string;
	origin: string;
	registeredAt?: string;
	expiresAt?: string;
}

export interface DailySeriesPoint {
	timestamp: number;
	count: number;
}

export interface DailySeriesResult {
	data: DailySeriesPoint[];
	stats: {
		highestDay?: { date: string; count: number };
		lowestDay?: { date: string; count: number };
		totalRecords: number;
	};
}

export interface PeriodMetrics {
	current: number;
	previous: number;
	percentChange: number;
}

export interface AnalyticsMetrics {
	totalCount: number;
	paidCount: number;
	activeCount: number;
	paidInPeriod: PeriodMetrics;
	activeSnapshot: PeriodMetrics;
	conversionRate: number;
	conversionRateTrend: number;
	premiumAdoptionRate: number;
	premiumAdoptionTrend: number;
	newPaidInPeriod: PeriodMetrics;
}

export const ANALYTICS_PERIOD_DAYS = 30;

export function parseDateToTimestamp(s?: string): number | null {
	if (!s) return null;
	try {
		if (s.includes(" ") && !s.includes("T")) {
			const [datePart, timePart] = s.split(" ");
			const [year, month, day] = datePart.split("-").map(Number);
			const [hour, minute, second] = timePart.split(":").map(Number);
			const d = new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
			return d.getTime();
		}
		const t = Date.parse(s);
		return isNaN(t) ? null : t;
	} catch {
		return null;
	}
}

export function parseDateToDate(s?: string): Date | null {
	if (!s) return null;
	try {
		if (s.includes(" ") && !s.includes("T")) {
			const [datePart, timePart] = s.split(" ");
			const [year, month, day] = datePart.split("-").map(Number);
			const [hour, minute, second] = timePart.split(":").map(Number);
			return new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
		}
		const d = new Date(s);
		return isNaN(d.getTime()) ? null : d;
	} catch {
		return null;
	}
}

export function normalizeTagRow(raw: any, keyPrefix: string = "tagName"): TagAnalyticsRecord | null {
	let pd = raw?.publicData ?? raw?.tagObject?.publicData ?? {};

	if (pd?.extraParams && typeof pd.extraParams === "string") {
		try {
			const extraParams = JSON.parse(pd.extraParams);
			pd = { ...pd, ...extraParams };
		} catch {
			// ignore invalid extraParams
		}
	}

	const fullName: string =
		(typeof raw?.name === "string" && raw.name) ||
		(typeof pd?.zelfName === "string" && pd.zelfName) ||
		(typeof pd?.avaxName === "string" && pd.avaxName) ||
		pd[keyPrefix] ||
		pd["tagName"] ||
		"";

	if (!fullName) return null;

	return {
		name: fullName,
		type: String(pd?.type || "").toLowerCase(),
		origin: String(pd?.origin || "unknown").toLowerCase(),
		registeredAt: pd?.registeredAt || raw?.created_at || pd?.renewedAt || undefined,
		expiresAt: pd?.expiresAt || undefined,
	};
}

export function normalizeTagRows(items: any[], keyPrefix: string = "tagName"): TagAnalyticsRecord[] {
	const records: TagAnalyticsRecord[] = [];
	for (const item of items) {
		const record = normalizeTagRow(item, keyPrefix);
		if (record) records.push(record);
	}
	return records;
}

export function isPaidTag(record: TagAnalyticsRecord): boolean {
	return record.type === "mainnet";
}

export function isActiveTag(record: TagAnalyticsRecord, now: Date = new Date()): boolean {
	if (!record.expiresAt) return true;
	const exp = parseDateToDate(record.expiresAt);
	if (!exp) return true;
	return exp.getTime() > now.getTime();
}

export function getBaseName(tagName: string, currentDomain: string | null): string {
	let name = tagName;
	if (currentDomain && name.endsWith(`.${currentDomain}`)) {
		name = name.slice(0, -1 * (currentDomain.length + 1));
	}
	if (name.endsWith(".hold")) name = name.slice(0, -5);
	return name.split(".")[0];
}

export function percentChange(current: number, previous: number): number {
	if (previous === 0) {
		return current === 0 ? 0 : 100;
	}
	return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

export function startOfDay(d: Date): Date {
	const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
	copy.setHours(0, 0, 0, 0);
	return copy;
}

export function countInRange(
	records: TagAnalyticsRecord[],
	rangeStart: Date,
	rangeEnd: Date,
	filter?: (r: TagAnalyticsRecord) => boolean
): number {
	const pick = filter ? records.filter(filter) : records;
	const startMs = rangeStart.getTime();
	const endMs = rangeEnd.getTime();
	let count = 0;
	for (const r of pick) {
		const ts = parseDateToTimestamp(r.registeredAt);
		if (ts == null) continue;
		if (ts >= startMs && ts < endMs) count++;
	}
	return count;
}

export function countActiveAt(records: TagAnalyticsRecord[], at: Date): number {
	return records.filter((r) => {
		if (!r.expiresAt) return true;
		const exp = parseDateToDate(r.expiresAt);
		if (!exp) return true;
		return exp.getTime() > at.getTime();
	}).length;
}

export function buildDailySeries(
	records: TagAnalyticsRecord[],
	days: number = ANALYTICS_PERIOD_DAYS,
	rangeEnd?: Date,
	filter?: (r: TagAnalyticsRecord) => boolean
): DailySeriesResult {
	const now = rangeEnd ? startOfDay(rangeEnd) : startOfDay(new Date());
	const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1));
	start.setHours(0, 0, 0, 0);
	const byDay = new Map<string, number>();
	const pick = filter ? records.filter(filter) : records;

	for (const r of pick) {
		const ts = parseDateToTimestamp(r.registeredAt);
		if (ts == null) continue;
		const d = startOfDay(new Date(ts));
		if (d < start || d > now) continue;
		const key = d.toISOString().slice(0, 10);
		byDay.set(key, (byDay.get(key) || 0) + 1);
	}

	const data: DailySeriesPoint[] = [];
	const dayCounts: number[] = [];
	const dayLabels: string[] = [];

	for (let i = 0; i < days; i++) {
		const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
		const key = cur.toISOString().slice(0, 10);
		const dayCount = byDay.get(key) || 0;
		dayCounts.push(dayCount);
		dayLabels.push(key);
		data.push({ timestamp: cur.getTime(), count: dayCount });
	}

	const nonZeroCounts = dayCounts.filter((c) => c > 0);
	const minCount = nonZeroCounts.length > 0 ? Math.min(...nonZeroCounts) : 0;
	const maxCount = Math.max(...dayCounts, 0);
	const minDayIndex = dayCounts.indexOf(minCount);
	const maxDayIndex = dayCounts.indexOf(maxCount);

	return {
		data,
		stats: {
			highestDay: maxCount > 0 && maxDayIndex >= 0 ? { date: dayLabels[maxDayIndex], count: maxCount } : undefined,
			lowestDay: minCount > 0 && minDayIndex >= 0 ? { date: dayLabels[minDayIndex], count: minCount } : undefined,
			totalRecords: pick.length,
		},
	};
}

export function toApexSeries(points: DailySeriesPoint[]): [number, number][] {
	return points.map((p) => [p.timestamp, p.count]);
}

export function computeAnalyticsMetrics(records: TagAnalyticsRecord[], periodDays: number = ANALYTICS_PERIOD_DAYS): AnalyticsMetrics {
	const now = startOfDay(new Date());
	const currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (periodDays - 1));
	currentStart.setHours(0, 0, 0, 0);
	const previousEnd = new Date(currentStart);
	const previousStart = new Date(currentStart.getFullYear(), currentStart.getMonth(), currentStart.getDate() - periodDays);

	const totalCount = records.length;
	const paidCount = records.filter(isPaidTag).length;
	const activeCount = countActiveAt(records, now);

	const paidCurrent = countInRange(records, currentStart, new Date(now.getTime() + 86400000), isPaidTag);
	const paidPrevious = countInRange(records, previousStart, previousEnd, isPaidTag);

	const activeCurrent = countActiveAt(records, now);
	const activePrevious = countActiveAt(records, previousStart);

	const allCurrent = countInRange(records, currentStart, new Date(now.getTime() + 86400000));
	const allPrevious = countInRange(records, previousStart, previousEnd);

	const conversionRate = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

	const currentConversion = allCurrent > 0 ? (paidCurrent / allCurrent) * 100 : 0;
	const previousConversion = allPrevious > 0 ? (paidPrevious / allPrevious) * 100 : 0;

	const premiumAdoptionRate = allCurrent > 0 ? Math.round((paidCurrent / allCurrent) * 100) : 0;
	const previousPremium = allPrevious > 0 ? (paidPrevious / allPrevious) * 100 : 0;

	return {
		totalCount,
		paidCount,
		activeCount,
		paidInPeriod: {
			current: paidCurrent,
			previous: paidPrevious,
			percentChange: percentChange(paidCurrent, paidPrevious),
		},
		activeSnapshot: {
			current: activeCurrent,
			previous: activePrevious,
			percentChange: percentChange(activeCurrent, activePrevious),
		},
		conversionRate,
		conversionRateTrend: percentChange(currentConversion, previousConversion),
		premiumAdoptionRate,
		premiumAdoptionTrend: percentChange(premiumAdoptionRate, Math.round(previousPremium)),
		newPaidInPeriod: {
			current: paidCurrent,
			previous: paidPrevious,
			percentChange: percentChange(paidCurrent, paidPrevious),
		},
	};
}

export function calculateLeaseYears(registeredAt?: string, expiresAt?: string): number | null {
	if (!registeredAt || !expiresAt) return null;
	const regDate = parseDateToDate(registeredAt);
	const expDate = parseDateToDate(expiresAt);
	if (!regDate || !expDate) return null;
	const diffMs = expDate.getTime() - regDate.getTime();
	return diffMs / (1000 * 60 * 60 * 24 * 365.25);
}
