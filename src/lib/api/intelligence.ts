import { fetchCouncilTaxBand } from "./council-tax";
import { fetchCrimeNearPoint } from "./crime";
import { fetchEpcForPostcode } from "./epc";
import { fetchFloodStatus } from "./flood";
import { fetchHpiForDistrict, fetchPricePaidForPostcode } from "./hpi";
import { fetchPlanningNearPoint } from "./planning";
import { lookupPostcode, sectorFromPostcode } from "./postcodes";
import { fetchSchoolsNearPoint } from "./schools";
import type { FeedItem } from "../types";
import { LOCAL_AREA_TIERS } from "../local-area";
import type { CouncilTaxResult } from "./council-tax";
import type { SchoolResult } from "./schools";

export interface PropertyIntelligence {
  postcode: string;
  location: {
    latitude: number;
    longitude: number;
    adminDistrict: string;
    adminWard: string;
    region: string;
    sector: string;
  };
  valuation: {
    estimatedValue: number;
    valueChangePercent: number;
    hpiMonth: string;
    region: string;
  };
  saleHistory: Array<{ amount: number; date: string; address: string }>;
  epc: {
    rating: string;
    score: number;
    records: Awaited<ReturnType<typeof fetchEpcForPostcode>>;
  };
  councilTax: CouncilTaxResult;
  schoolCatchments: SchoolResult[];
  flood: Awaited<ReturnType<typeof fetchFloodStatus>>;
  crime: Awaited<ReturnType<typeof fetchCrimeNearPoint>>;
  planning: Awaited<ReturnType<typeof fetchPlanningNearPoint>>;
  feed: FeedItem[];
}

export async function buildPropertyIntelligence(
  postcode: string
): Promise<PropertyIntelligence | null> {
  const geo = await lookupPostcode(postcode);
  if (!geo) return null;

  const radius = LOCAL_AREA_TIERS.neighbourhood.radiusMetres;
  const normalisedPostcode = geo.postcode;

  const [hpi, saleHistory, epcRecords, flood, crime, planning, schools] =
    await Promise.all([
      fetchHpiForDistrict(geo.admin_district),
      fetchPricePaidForPostcode(normalisedPostcode),
      fetchEpcForPostcode(normalisedPostcode),
      fetchFloodStatus(geo.latitude, geo.longitude),
      fetchCrimeNearPoint(geo.latitude, geo.longitude, radius),
      fetchPlanningNearPoint(geo.latitude, geo.longitude, radius, 15),
      fetchSchoolsNearPoint(geo.latitude, geo.longitude, 2000),
    ]);

  const councilTax = await fetchCouncilTaxBand(normalisedPostcode, {
    averagePrice: hpi?.averagePrice,
    hpiIndex: 93,
  });

  const topEpc = epcRecords[0];
  const latestSale = saleHistory[0];

  const feed = buildFeedFromLiveData({
    planning,
    crime,
    flood,
    hpi,
    geo,
    schools,
  });

  return {
    postcode: normalisedPostcode,
    location: {
      latitude: geo.latitude,
      longitude: geo.longitude,
      adminDistrict: geo.admin_district,
      adminWard: geo.admin_ward,
      region: geo.region,
      sector: sectorFromPostcode(normalisedPostcode),
    },
    valuation: {
      estimatedValue: hpi?.averagePrice ?? latestSale?.amount ?? 0,
      valueChangePercent: hpi?.percentageChange ?? 0,
      hpiMonth: hpi?.refMonth ?? "",
      region: hpi?.region ?? geo.admin_district,
    },
    saleHistory,
    epc: {
      rating: topEpc?.rating ?? "D",
      score: topEpc?.score ?? 0,
      records: epcRecords,
    },
    councilTax,
    schoolCatchments: schools,
    flood,
    crime,
    planning,
    feed,
  };
}

function buildFeedFromLiveData({
  planning,
  crime,
  flood,
  hpi,
  geo,
  schools,
}: {
  planning: Awaited<ReturnType<typeof fetchPlanningNearPoint>>;
  crime: Awaited<ReturnType<typeof fetchCrimeNearPoint>>;
  flood: Awaited<ReturnType<typeof fetchFloodStatus>>;
  hpi: Awaited<ReturnType<typeof fetchHpiForDistrict>>;
  geo: { admin_district: string };
  schools: SchoolResult[];
}): FeedItem[] {
  const items: FeedItem[] = [];
  let id = 1;

  for (const app of planning.slice(0, 5)) {
    items.push({
      id: `live-${id++}`,
      category: "planning",
      title: app.reference,
      summary: app.description.slice(0, 200),
      distanceMetres: app.distanceMetres ?? 0,
      publishedAt: app.decisionDate
        ? new Date(app.decisionDate).toISOString()
        : new Date().toISOString(),
      source: "planning.data.gov.uk",
      actionable:
        "Review if this sets precedent for extensions or affects local amenity.",
    });
  }

  if (crime.total > 0) {
    items.push({
      id: `live-${id++}`,
      category: "crime",
      title: `${crime.total} incidents reported within 750m (${crime.month})`,
      summary: `Antisocial behaviour: ${crime.antisocialCount}. Most recent near ${crime.recent[0]?.street ?? "local streets"}.`,
      distanceMetres: crime.recent[0]?.distanceMetres ?? 0,
      publishedAt: new Date(`${crime.month}-01`).toISOString(),
      source: "data.police.uk",
    });
  }

  if (flood.activeWarnings.length > 0) {
    items.push({
      id: `live-${id++}`,
      category: "development",
      title: flood.activeWarnings[0].description,
      summary: `Severity: ${flood.activeWarnings[0].severity}. Check long-term risk on GOV.UK.`,
      distanceMetres: 0,
      publishedAt: new Date().toISOString(),
      source: "Environment Agency",
      actionable: "Review flood insurance and property resilience measures.",
    });
  }

  if (hpi) {
    items.push({
      id: `live-${id++}`,
      category: "development",
      title: `${geo.admin_district} prices ${hpi.percentageChange >= 0 ? "rose" : "fell"} ${Math.abs(hpi.percentageChange).toFixed(1)}%`,
      summary: `Average price £${hpi.averagePrice.toLocaleString()} (${hpi.refMonth}). Annual change: ${hpi.percentageAnnualChange}%.`,
      distanceMetres: 0,
      publishedAt: new Date(`${hpi.refMonth}-01`).toISOString(),
      source: "HM Land Registry UK HPI",
      actionable:
        hpi.percentageChange > 0
          ? "Strong area momentum — review remortgage or sale timing."
          : "Softening market — negotiate harder on purchases or improvements.",
    });
  }

  const outstanding = schools.filter((s) => s.ofstedRating === "Outstanding");
  if (outstanding.length > 0) {
    items.push({
      id: `live-${id++}`,
      category: "schools",
      title: `${outstanding.length} Outstanding school${outstanding.length > 1 ? "s" : ""} within 2km`,
      summary: `Nearest: ${outstanding[0].name} (${outstanding[0].distanceMetres}m). ${schools.filter((s) => s.inCatchment).length} schools in likely catchment range.`,
      distanceMetres: outstanding[0].distanceMetres,
      publishedAt: new Date().toISOString(),
      source: "GIAS / Ofsted",
    });
  }

  return items;
}
