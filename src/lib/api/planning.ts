import { circleToWktPolygon, haversineDistanceMetres } from "../geometry";
import { fetchJson } from "./client";

export interface PlanningApplication {
  reference: string;
  description: string;
  decisionDate?: string;
  distanceMetres?: number;
}

interface PlanningEntity {
  reference?: string;
  description?: string;
  "decision-date"?: string;
  point?: string;
}

interface PlanningResponse {
  entities?: PlanningEntity[];
}

export async function fetchPlanningNearPoint(
  lat: number,
  lng: number,
  radiusMetres = 750,
  limit = 20
): Promise<PlanningApplication[]> {
  const geometry = circleToWktPolygon(lat, lng, radiusMetres);
  const url = new URL("https://www.planning.data.gov.uk/entity.json");
  url.searchParams.set("dataset", "planning-application");
  url.searchParams.set("geometry", geometry);
  url.searchParams.set("geometry_relation", "intersects");
  url.searchParams.set("limit", String(limit));

  const data = await fetchJson<PlanningResponse>(url.toString(), {
    revalidate: 3600,
  });

  return (data.entities ?? [])
    .filter((e) => e.reference && e.description)
    .map((entity) => {
      let distanceMetres: number | undefined;
      if (entity.point) {
        const match = entity.point.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
        if (match) {
          const pointLng = parseFloat(match[1]);
          const pointLat = parseFloat(match[2]);
          distanceMetres = Math.round(
            haversineDistanceMetres(lat, lng, pointLat, pointLng)
          );
        }
      }
      return {
        reference: entity.reference!,
        description: entity.description!,
        decisionDate: entity["decision-date"],
        distanceMetres,
      };
    })
    .sort(
      (a, b) =>
        (a.distanceMetres ?? Infinity) - (b.distanceMetres ?? Infinity)
    );
}
