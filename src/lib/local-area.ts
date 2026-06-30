import type { LocalAreaConfig, LocalAreaTier, ParsedPostcode } from "./types";

const UK_POSTCODE_REGEX =
  /^([A-Z]{1,2}\d[A-Z\d]?)\s*(\d)([A-Z]{2})$/i;

export function parsePostcode(input: string): ParsedPostcode {
  const normalised = input.trim().toUpperCase().replace(/\s+/g, " ");
  const match = normalised.match(UK_POSTCODE_REGEX);

  if (!match) {
    return {
      full: normalised,
      outward: "",
      sector: "",
      unit: "",
      isValid: false,
    };
  }

  const outward = match[1];
  const sectorDigit = match[2];
  const unit = match[3];

  return {
    full: `${outward} ${sectorDigit}${unit}`,
    outward,
    sector: `${outward} ${sectorDigit}`,
    unit: `${sectorDigit}${unit}`,
    isValid: true,
  };
}

export const LOCAL_AREA_TIERS: Record<LocalAreaTier, LocalAreaConfig> = {
  immediate: {
    tier: "immediate",
    radiusMetres: 500,
    label: "Immediate area",
    description:
      "Within 500m — your street and immediate neighbours. Used for planning alerts, neighbour modifications, and hyperlocal changes.",
  },
  neighbourhood: {
    tier: "neighbourhood",
    radiusMetres: 750,
    label: "Neighbourhood",
    description:
      "750m radius capped to your postcode sector — typically 500–1,000 homes. Default for the intelligence feed and smart alerts.",
  },
  district: {
    tier: "district",
    radiusMetres: 2000,
    label: "Postcode district",
    description:
      "Your outward postcode area (e.g. SW1A) — used for price trends, investment comparisons, and area-level statistics.",
  },
};

export const RECOMMENDED_DEFAULT_TIER: LocalAreaTier = "neighbourhood";

export function getRecommendedLocalArea(postcode: string): {
  parsed: ParsedPostcode;
  defaultConfig: LocalAreaConfig;
  sectorLabel: string;
  userFacingSummary: string;
} {
  const parsed = parsePostcode(postcode);
  const defaultConfig = LOCAL_AREA_TIERS[RECOMMENDED_DEFAULT_TIER];

  const sectorLabel = parsed.isValid
    ? parsed.sector
    : "your postcode sector";

  return {
    parsed,
    defaultConfig,
    sectorLabel,
    userFacingSummary: parsed.isValid
      ? `We monitor a ${defaultConfig.radiusMetres}m radius around ${parsed.full}, capped to postcode sector ${parsed.sector} (~500–1,000 homes). Price trends use district ${parsed.outward}.`
      : "Enter a valid UK postcode to define your local monitoring area.",
  };
}

export function formatDistance(metres: number): string {
  if (metres < 1000) return `${metres}m`;
  return `${(metres / 1000).toFixed(1)}km`;
}
