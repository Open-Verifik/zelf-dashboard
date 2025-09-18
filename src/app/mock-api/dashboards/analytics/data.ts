/* eslint-disable */
import { DateTime } from "luxon";

/* Get the current instant */
const now = DateTime.now();

export const analytics = {
	visitors: {
		series: {
			"this-month": [
				{
					name: "Tag Domains",
					data: [
						// September 1-30, 2024 - More realistic data with variations
						{
							x: now.startOf("month").toJSDate(),
							y: 89,
						},
						{
							x: now.startOf("month").plus({ days: 1 }).toJSDate(),
							y: 124,
						},
						{
							x: now.startOf("month").plus({ days: 2 }).toJSDate(),
							y: 156,
						},
						{
							x: now.startOf("month").plus({ days: 3 }).toJSDate(),
							y: 142,
						},
						{
							x: now.startOf("month").plus({ days: 4 }).toJSDate(),
							y: 178,
						},
						{
							x: now.startOf("month").plus({ days: 5 }).toJSDate(),
							y: 203,
						},
						{
							x: now.startOf("month").plus({ days: 6 }).toJSDate(),
							y: 167,
						},
						{
							x: now.startOf("month").plus({ days: 7 }).toJSDate(),
							y: 189,
						},
						{
							x: now.startOf("month").plus({ days: 8 }).toJSDate(),
							y: 234,
						},
						{
							x: now.startOf("month").plus({ days: 9 }).toJSDate(),
							y: 198,
						},
						{
							x: now.startOf("month").plus({ days: 10 }).toJSDate(),
							y: 245,
						},
						{
							x: now.startOf("month").plus({ days: 11 }).toJSDate(),
							y: 267,
						},
						{
							x: now.startOf("month").plus({ days: 12 }).toJSDate(),
							y: 289,
						},
						{
							x: now.startOf("month").plus({ days: 13 }).toJSDate(),
							y: 234,
						},
						{
							x: now.startOf("month").plus({ days: 14 }).toJSDate(),
							y: 198,
						},
						{
							x: now.startOf("month").plus({ days: 15 }).toJSDate(),
							y: 256,
						},
						{
							x: now.startOf("month").plus({ days: 16 }).toJSDate(),
							y: 278,
						},
						{
							x: now.startOf("month").plus({ days: 17 }).toJSDate(),
							y: 312,
						},
						{
							x: now.startOf("month").plus({ days: 18 }).toJSDate(),
							y: 298,
						},
						{
							x: now.startOf("month").plus({ days: 19 }).toJSDate(),
							y: 267,
						},
						{
							x: now.startOf("month").plus({ days: 20 }).toJSDate(),
							y: 289,
						},
						{
							x: now.startOf("month").plus({ days: 21 }).toJSDate(),
							y: 334,
						},
						{
							x: now.startOf("month").plus({ days: 22 }).toJSDate(),
							y: 298,
						},
						{
							x: now.startOf("month").plus({ days: 23 }).toJSDate(),
							y: 356,
						},
						{
							x: now.startOf("month").plus({ days: 24 }).toJSDate(),
							y: 378,
						},
						{
							x: now.startOf("month").plus({ days: 25 }).toJSDate(),
							y: 345,
						},
						{
							x: now.startOf("month").plus({ days: 26 }).toJSDate(),
							y: 312,
						},
						{
							x: now.startOf("month").plus({ days: 27 }).toJSDate(),
							y: 367,
						},
						{
							x: now.startOf("month").plus({ days: 28 }).toJSDate(),
							y: 389,
						},
						{
							x: now.startOf("month").plus({ days: 29 }).toJSDate(),
							y: 356,
						},
						{
							x: now.endOf("month").toJSDate(),
							y: 412,
						},
					],
				},
			],
			"previous-month": [
				{
					name: "Tag Domains",
					data: [
						// August 1-31, 2024 - More realistic data with variations
						{
							x: now.minus({ months: 1 }).startOf("month").toJSDate(),
							y: 67,
						},
						{
							x: now.minus({ months: 1 }).startOf("month").plus({ days: 1 }).toJSDate(),
							y: 89,
						},
						{
							x: now.minus({ months: 1 }).startOf("month").plus({ days: 2 }).toJSDate(),
							y: 112,
						},
						{
							x: now.minus({ months: 1 }).startOf("month").plus({ days: 3 }).toJSDate(),
							y: 98,
						},
						{
							x: now.minus({ months: 1 }).startOf("month").plus({ days: 4 }).toJSDate(),
							y: 134,
						},
						{
							x: now.minus({ months: 1 }).startOf("month").plus({ days: 5 }).toJSDate(),
							y: 156,
						},
						{
							x: now.minus({ months: 1 }).startOf("month").plus({ days: 6 }).toJSDate(),
							y: 123,
						},
						{
							x: now.minus({ months: 1 }).startOf("month").plus({ days: 7 }).toJSDate(),
							y: 145,
						},
						{
							x: now.minus({ months: 1 }).startOf("month").plus({ days: 8 }).toJSDate(),
							y: 178,
						},
						{
							x: now.minus({ months: 1 }).startOf("month").plus({ days: 9 }).toJSDate(),
							y: 156,
						},
						{
							x: now.minus({ months: 1 }).startOf("month").plus({ days: 10 }).toJSDate(),
							y: 189,
						},
						{
							x: now.minus({ months: 1 }).startOf("month").plus({ days: 11 }).toJSDate(),
							y: 167,
						},
						{
							x: now.minus({ months: 1 }).startOf("month").plus({ days: 12 }).toJSDate(),
							y: 201,
						},
						{
							x: now.minus({ months: 1 }).startOf("month").plus({ days: 13 }).toJSDate(),
							y: 178,
						},
						{
							x: now.minus({ months: 1 }).startOf("month").plus({ days: 14 }).toJSDate(),
							y: 145,
						},
						{
							x: now.minus({ months: 1 }).startOf("month").plus({ days: 15 }).toJSDate(),
							y: 189,
						},
						{
							x: now.minus({ months: 1 }).startOf("month").plus({ days: 16 }).toJSDate(),
							y: 212,
						},
						{
							x: now.minus({ months: 1 }).startOf("month").plus({ days: 17 }).toJSDate(),
							y: 198,
						},
						{
							x: now.minus({ months: 1 }).startOf("month").plus({ days: 18 }).toJSDate(),
							y: 234,
						},
						{
							x: now.minus({ months: 1 }).startOf("month").plus({ days: 19 }).toJSDate(),
							y: 201,
						},
						{
							x: now.minus({ months: 1 }).startOf("month").plus({ days: 20 }).toJSDate(),
							y: 245,
						},
						{
							x: now.minus({ months: 1 }).startOf("month").plus({ days: 21 }).toJSDate(),
							y: 223,
						},
						{
							x: now.minus({ months: 1 }).startOf("month").plus({ days: 22 }).toJSDate(),
							y: 189,
						},
						{
							x: now.minus({ months: 1 }).startOf("month").plus({ days: 23 }).toJSDate(),
							y: 256,
						},
						{
							x: now.minus({ months: 1 }).startOf("month").plus({ days: 24 }).toJSDate(),
							y: 278,
						},
						{
							x: now.minus({ months: 1 }).startOf("month").plus({ days: 25 }).toJSDate(),
							y: 234,
						},
						{
							x: now.minus({ months: 1 }).startOf("month").plus({ days: 26 }).toJSDate(),
							y: 267,
						},
						{
							x: now.minus({ months: 1 }).startOf("month").plus({ days: 27 }).toJSDate(),
							y: 245,
						},
						{
							x: now.minus({ months: 1 }).startOf("month").plus({ days: 28 }).toJSDate(),
							y: 289,
						},
						{
							x: now.minus({ months: 1 }).startOf("month").plus({ days: 29 }).toJSDate(),
							y: 256,
						},
						{
							x: now.minus({ months: 1 }).endOf("month").toJSDate(),
							y: 298,
						},
					],
				},
			],
		},
	},
	conversions: {
		amount: 1247,
		labels: [
			now.minus({ days: 47 }).toFormat("dd MMM") + " - " + now.minus({ days: 40 }).toFormat("dd MMM"),
			now.minus({ days: 39 }).toFormat("dd MMM") + " - " + now.minus({ days: 32 }).toFormat("dd MMM"),
			now.minus({ days: 31 }).toFormat("dd MMM") + " - " + now.minus({ days: 24 }).toFormat("dd MMM"),
			now.minus({ days: 23 }).toFormat("dd MMM") + " - " + now.minus({ days: 16 }).toFormat("dd MMM"),
			now.minus({ days: 15 }).toFormat("dd MMM") + " - " + now.minus({ days: 8 }).toFormat("dd MMM"),
			now.minus({ days: 7 }).toFormat("dd MMM") + " - " + now.toFormat("dd MMM"),
		],
		series: [
			{
				name: "Paid Tags",
				data: [1189, 1245, 1321, 1287, 1198, 1247],
			},
		],
	},
	impressions: {
		amount: 2847,
		labels: [
			now.minus({ days: 31 }).toFormat("dd MMM") + " - " + now.minus({ days: 24 }).toFormat("dd MMM"),
			now.minus({ days: 23 }).toFormat("dd MMM") + " - " + now.minus({ days: 16 }).toFormat("dd MMM"),
			now.minus({ days: 15 }).toFormat("dd MMM") + " - " + now.minus({ days: 8 }).toFormat("dd MMM"),
			now.minus({ days: 7 }).toFormat("dd MMM") + " - " + now.toFormat("dd MMM"),
		],
		series: [
			{
				name: "ZelfKey Subscriptions",
				data: [712, 689, 723, 723],
			},
		],
	},
	visits: {
		amount: 3847,
		labels: [
			now.minus({ days: 31 }).toFormat("dd MMM") + " - " + now.minus({ days: 24 }).toFormat("dd MMM"),
			now.minus({ days: 23 }).toFormat("dd MMM") + " - " + now.minus({ days: 16 }).toFormat("dd MMM"),
			now.minus({ days: 15 }).toFormat("dd MMM") + " - " + now.minus({ days: 8 }).toFormat("dd MMM"),
			now.minus({ days: 7 }).toFormat("dd MMM") + " - " + now.toFormat("dd MMM"),
		],
		series: [
			{
				name: "Active Tags",
				data: [962, 961, 962, 962],
			},
		],
	},
	visitorsVsPageViews: {
		overallScore: 472,
		averageRatio: 45,
		predictedRatio: 55,
		series: [
			{
				name: "Active Usage",
				data: [
					{
						x: now.minus({ days: 65 }).toJSDate(),
						y: 4769,
					},
					{
						x: now.minus({ days: 64 }).toJSDate(),
						y: 4901,
					},
					{
						x: now.minus({ days: 63 }).toJSDate(),
						y: 4640,
					},
					{
						x: now.minus({ days: 62 }).toJSDate(),
						y: 5128,
					},
					{
						x: now.minus({ days: 61 }).toJSDate(),
						y: 5015,
					},
					{
						x: now.minus({ days: 60 }).toJSDate(),
						y: 5360,
					},
					{
						x: now.minus({ days: 59 }).toJSDate(),
						y: 5608,
					},
					{
						x: now.minus({ days: 58 }).toJSDate(),
						y: 5272,
					},
					{
						x: now.minus({ days: 57 }).toJSDate(),
						y: 5660,
					},
					{
						x: now.minus({ days: 56 }).toJSDate(),
						y: 6026,
					},
					{
						x: now.minus({ days: 55 }).toJSDate(),
						y: 5836,
					},
					{
						x: now.minus({ days: 54 }).toJSDate(),
						y: 5659,
					},
					{
						x: now.minus({ days: 53 }).toJSDate(),
						y: 5575,
					},
					{
						x: now.minus({ days: 52 }).toJSDate(),
						y: 5474,
					},
					{
						x: now.minus({ days: 51 }).toJSDate(),
						y: 5427,
					},
					{
						x: now.minus({ days: 50 }).toJSDate(),
						y: 5865,
					},
					{
						x: now.minus({ days: 49 }).toJSDate(),
						y: 5700,
					},
					{
						x: now.minus({ days: 48 }).toJSDate(),
						y: 6052,
					},
					{
						x: now.minus({ days: 47 }).toJSDate(),
						y: 5760,
					},
					{
						x: now.minus({ days: 46 }).toJSDate(),
						y: 5648,
					},
					{
						x: now.minus({ days: 45 }).toJSDate(),
						y: 5510,
					},
					{
						x: now.minus({ days: 44 }).toJSDate(),
						y: 5435,
					},
					{
						x: now.minus({ days: 43 }).toJSDate(),
						y: 5239,
					},
					{
						x: now.minus({ days: 42 }).toJSDate(),
						y: 5452,
					},
					{
						x: now.minus({ days: 41 }).toJSDate(),
						y: 5416,
					},
					{
						x: now.minus({ days: 40 }).toJSDate(),
						y: 5195,
					},
					{
						x: now.minus({ days: 39 }).toJSDate(),
						y: 5119,
					},
					{
						x: now.minus({ days: 38 }).toJSDate(),
						y: 4635,
					},
					{
						x: now.minus({ days: 37 }).toJSDate(),
						y: 4833,
					},
					{
						x: now.minus({ days: 36 }).toJSDate(),
						y: 4584,
					},
					{
						x: now.minus({ days: 35 }).toJSDate(),
						y: 4822,
					},
					{
						x: now.minus({ days: 34 }).toJSDate(),
						y: 4330,
					},
					{
						x: now.minus({ days: 33 }).toJSDate(),
						y: 4582,
					},
					{
						x: now.minus({ days: 32 }).toJSDate(),
						y: 4348,
					},
					{
						x: now.minus({ days: 31 }).toJSDate(),
						y: 4132,
					},
					{
						x: now.minus({ days: 30 }).toJSDate(),
						y: 4099,
					},
					{
						x: now.minus({ days: 29 }).toJSDate(),
						y: 3849,
					},
					{
						x: now.minus({ days: 28 }).toJSDate(),
						y: 4010,
					},
					{
						x: now.minus({ days: 27 }).toJSDate(),
						y: 4486,
					},
					{
						x: now.minus({ days: 26 }).toJSDate(),
						y: 4403,
					},
					{
						x: now.minus({ days: 25 }).toJSDate(),
						y: 4141,
					},
					{
						x: now.minus({ days: 24 }).toJSDate(),
						y: 3780,
					},
					{
						x: now.minus({ days: 23 }).toJSDate(),
						y: 3929,
					},
					{
						x: now.minus({ days: 22 }).toJSDate(),
						y: 3524,
					},
					{
						x: now.minus({ days: 21 }).toJSDate(),
						y: 3212,
					},
					{
						x: now.minus({ days: 20 }).toJSDate(),
						y: 3568,
					},
					{
						x: now.minus({ days: 19 }).toJSDate(),
						y: 3800,
					},
					{
						x: now.minus({ days: 18 }).toJSDate(),
						y: 3796,
					},
					{
						x: now.minus({ days: 17 }).toJSDate(),
						y: 3870,
					},
					{
						x: now.minus({ days: 16 }).toJSDate(),
						y: 3745,
					},
					{
						x: now.minus({ days: 15 }).toJSDate(),
						y: 3751,
					},
					{
						x: now.minus({ days: 14 }).toJSDate(),
						y: 3310,
					},
					{
						x: now.minus({ days: 13 }).toJSDate(),
						y: 3509,
					},
					{
						x: now.minus({ days: 12 }).toJSDate(),
						y: 3311,
					},
					{
						x: now.minus({ days: 11 }).toJSDate(),
						y: 3187,
					},
					{
						x: now.minus({ days: 10 }).toJSDate(),
						y: 2918,
					},
					{
						x: now.minus({ days: 9 }).toJSDate(),
						y: 3191,
					},
					{
						x: now.minus({ days: 8 }).toJSDate(),
						y: 3437,
					},
					{
						x: now.minus({ days: 7 }).toJSDate(),
						y: 3291,
					},
					{
						x: now.minus({ days: 6 }).toJSDate(),
						y: 3317,
					},
					{
						x: now.minus({ days: 5 }).toJSDate(),
						y: 3716,
					},
					{
						x: now.minus({ days: 4 }).toJSDate(),
						y: 3260,
					},
					{
						x: now.minus({ days: 3 }).toJSDate(),
						y: 3694,
					},
					{
						x: now.minus({ days: 2 }).toJSDate(),
						y: 3598,
					},
					{
						x: now.minus({ days: 1 }).toJSDate(),
						y: 3812,
					},
				],
			},
			{
				name: "Tag Domains",
				data: [
					{
						x: now.minus({ days: 65 }).toJSDate(),
						y: 1654,
					},
					{
						x: now.minus({ days: 64 }).toJSDate(),
						y: 1900,
					},
					{
						x: now.minus({ days: 63 }).toJSDate(),
						y: 1647,
					},
					{
						x: now.minus({ days: 62 }).toJSDate(),
						y: 1315,
					},
					{
						x: now.minus({ days: 61 }).toJSDate(),
						y: 1807,
					},
					{
						x: now.minus({ days: 60 }).toJSDate(),
						y: 1793,
					},
					{
						x: now.minus({ days: 59 }).toJSDate(),
						y: 1892,
					},
					{
						x: now.minus({ days: 58 }).toJSDate(),
						y: 1846,
					},
					{
						x: now.minus({ days: 57 }).toJSDate(),
						y: 1966,
					},
					{
						x: now.minus({ days: 56 }).toJSDate(),
						y: 1804,
					},
					{
						x: now.minus({ days: 55 }).toJSDate(),
						y: 1778,
					},
					{
						x: now.minus({ days: 54 }).toJSDate(),
						y: 2015,
					},
					{
						x: now.minus({ days: 53 }).toJSDate(),
						y: 1892,
					},
					{
						x: now.minus({ days: 52 }).toJSDate(),
						y: 1708,
					},
					{
						x: now.minus({ days: 51 }).toJSDate(),
						y: 1711,
					},
					{
						x: now.minus({ days: 50 }).toJSDate(),
						y: 1570,
					},
					{
						x: now.minus({ days: 49 }).toJSDate(),
						y: 1507,
					},
					{
						x: now.minus({ days: 48 }).toJSDate(),
						y: 1451,
					},
					{
						x: now.minus({ days: 47 }).toJSDate(),
						y: 1522,
					},
					{
						x: now.minus({ days: 46 }).toJSDate(),
						y: 1801,
					},
					{
						x: now.minus({ days: 45 }).toJSDate(),
						y: 1977,
					},
					{
						x: now.minus({ days: 44 }).toJSDate(),
						y: 2367,
					},
					{
						x: now.minus({ days: 43 }).toJSDate(),
						y: 2798,
					},
					{
						x: now.minus({ days: 42 }).toJSDate(),
						y: 3080,
					},
					{
						x: now.minus({ days: 41 }).toJSDate(),
						y: 2856,
					},
					{
						x: now.minus({ days: 40 }).toJSDate(),
						y: 2745,
					},
					{
						x: now.minus({ days: 39 }).toJSDate(),
						y: 2750,
					},
					{
						x: now.minus({ days: 38 }).toJSDate(),
						y: 2728,
					},
					{
						x: now.minus({ days: 37 }).toJSDate(),
						y: 2436,
					},
					{
						x: now.minus({ days: 36 }).toJSDate(),
						y: 2289,
					},
					{
						x: now.minus({ days: 35 }).toJSDate(),
						y: 2657,
					},
					{
						x: now.minus({ days: 34 }).toJSDate(),
						y: 2804,
					},
					{
						x: now.minus({ days: 33 }).toJSDate(),
						y: 2777,
					},
					{
						x: now.minus({ days: 32 }).toJSDate(),
						y: 3024,
					},
					{
						x: now.minus({ days: 31 }).toJSDate(),
						y: 2657,
					},
					{
						x: now.minus({ days: 30 }).toJSDate(),
						y: 2218,
					},
					{
						x: now.minus({ days: 29 }).toJSDate(),
						y: 1964,
					},
					{
						x: now.minus({ days: 28 }).toJSDate(),
						y: 1674,
					},
					{
						x: now.minus({ days: 27 }).toJSDate(),
						y: 1721,
					},
					{
						x: now.minus({ days: 26 }).toJSDate(),
						y: 2005,
					},
					{
						x: now.minus({ days: 25 }).toJSDate(),
						y: 1613,
					},
					{
						x: now.minus({ days: 24 }).toJSDate(),
						y: 1295,
					},
					{
						x: now.minus({ days: 23 }).toJSDate(),
						y: 1071,
					},
					{
						x: now.minus({ days: 22 }).toJSDate(),
						y: 799,
					},
					{
						x: now.minus({ days: 21 }).toJSDate(),
						y: 1133,
					},
					{
						x: now.minus({ days: 20 }).toJSDate(),
						y: 1536,
					},
					{
						x: now.minus({ days: 19 }).toJSDate(),
						y: 2016,
					},
					{
						x: now.minus({ days: 18 }).toJSDate(),
						y: 2256,
					},
					{
						x: now.minus({ days: 17 }).toJSDate(),
						y: 1934,
					},
					{
						x: now.minus({ days: 16 }).toJSDate(),
						y: 1832,
					},
					{
						x: now.minus({ days: 15 }).toJSDate(),
						y: 2075,
					},
					{
						x: now.minus({ days: 14 }).toJSDate(),
						y: 1709,
					},
					{
						x: now.minus({ days: 13 }).toJSDate(),
						y: 1932,
					},
					{
						x: now.minus({ days: 12 }).toJSDate(),
						y: 1831,
					},
					{
						x: now.minus({ days: 11 }).toJSDate(),
						y: 1434,
					},
					{
						x: now.minus({ days: 10 }).toJSDate(),
						y: 993,
					},
					{
						x: now.minus({ days: 9 }).toJSDate(),
						y: 1064,
					},
					{
						x: now.minus({ days: 8 }).toJSDate(),
						y: 618,
					},
					{
						x: now.minus({ days: 7 }).toJSDate(),
						y: 1032,
					},
					{
						x: now.minus({ days: 6 }).toJSDate(),
						y: 1280,
					},
					{
						x: now.minus({ days: 5 }).toJSDate(),
						y: 1344,
					},
					{
						x: now.minus({ days: 4 }).toJSDate(),
						y: 1835,
					},
					{
						x: now.minus({ days: 3 }).toJSDate(),
						y: 2287,
					},
					{
						x: now.minus({ days: 2 }).toJSDate(),
						y: 2226,
					},
					{
						x: now.minus({ days: 1 }).toJSDate(),
						y: 2692,
					},
				],
			},
		],
	},
	tagLeaseLengths: {
		uniqueVisitors: 2847,
		series: [35, 25, 20, 12, 5, 3],
		labels: ["1 Year", "2 Years", "3 Years", "4 Years", "5 Years", "Lifetime"],
	},
	domainLength: {
		uniqueVisitors: 2847,
		series: [15, 35, 30, 20],
		labels: ["1-3", "4-10", "11-20", "21-27"],
	},
	origin: {
		uniqueVisitors: 2847,
		series: [45, 30, 25],
		labels: ["Extension", "Android", "iOS"],
	},
};
