import { fetchJson } from "./client";

export interface FloodStatus {
  riskLevel: "very_low" | "low" | "medium" | "high";
  activeWarnings: FloodWarning[];
  floodAreasNearby: number;
}

export interface FloodWarning {
  description: string;
  severity: string;
  severityLevel: number;
  area: string;
}

interface FloodApiResponse {
  items?: Array<{
    description: string;
    severity: string;
    severityLevel: number;
    eaAreaName?: string;
  }>;
}

interface FloodAreaResponse {
  items?: unknown[];
}

export async function fetchFloodStatus(
  lat: number,
  lng: number
): Promise<FloodStatus> {
  const [warnings, areas] = await Promise.all([
    fetchJson<FloodApiResponse>(
      `https://environment.data.gov.uk/flood-monitoring/id/floods?lat=${lat}&long=${lng}&dist=5`,
      { revalidate: 900 }
    ),
    fetchJson<FloodAreaResponse>(
      `https://environment.data.gov.uk/flood-monitoring/id/floodAreas?lat=${lat}&long=${lng}&dist=2`,
      { revalidate: 86400 }
    ),
  ]);

  const activeWarnings: FloodWarning[] = (warnings.items ?? []).map((w) => ({
    description: w.description,
    severity: w.severity,
    severityLevel: w.severityLevel,
    area: w.eaAreaName ?? "Local area",
  }));

  const floodAreasNearby = areas.items?.length ?? 0;

  let riskLevel: FloodStatus["riskLevel"] = "very_low";
  if (activeWarnings.some((w) => w.severityLevel >= 3)) {
    riskLevel = "high";
  } else if (activeWarnings.length > 0) {
    riskLevel = "medium";
  } else if (floodAreasNearby > 0) {
    riskLevel = "low";
  }

  return { riskLevel, activeWarnings, floodAreasNearby };
}
