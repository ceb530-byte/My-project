import { haversineDistanceMetres } from "../geometry";
import { fetchJson } from "./client";

export interface CrimeRecord {
  category: string;
  month: string;
  street: string;
  latitude: number;
  longitude: number;
  distanceMetres: number;
}

interface PoliceCrime {
  category: string;
  month: string;
  location: {
    latitude: string;
    longitude: string;
    street: { name: string };
  };
}

export interface CrimeSummary {
  total: number;
  byCategory: Record<string, number>;
  antisocialCount: number;
  recent: CrimeRecord[];
  month: string;
}

export async function fetchCrimeNearPoint(
  lat: number,
  lng: number,
  radiusMetres = 750
): Promise<CrimeSummary> {
  const crimes = await fetchJson<PoliceCrime[]>(
    `https://data.police.uk/api/crimes-street/all-crime?lat=${lat}&lng=${lng}`,
    { revalidate: 86400 }
  );

  const month = crimes[0]?.month ?? new Date().toISOString().slice(0, 7);
  const byCategory: Record<string, number> = {};
  const recent: CrimeRecord[] = [];

  for (const crime of crimes) {
    const crimeLat = parseFloat(crime.location.latitude);
    const crimeLng = parseFloat(crime.location.longitude);
    const distanceMetres = Math.round(
      haversineDistanceMetres(lat, lng, crimeLat, crimeLng)
    );

    if (distanceMetres > radiusMetres) continue;

    byCategory[crime.category] = (byCategory[crime.category] ?? 0) + 1;
    recent.push({
      category: formatCrimeCategory(crime.category),
      month: crime.month,
      street: crime.location.street.name,
      latitude: crimeLat,
      longitude: crimeLng,
      distanceMetres,
    });
  }

  recent.sort((a, b) => a.distanceMetres - b.distanceMetres);

  return {
    total: recent.length,
    byCategory,
    antisocialCount: byCategory["anti-social-behaviour"] ?? 0,
    recent: recent.slice(0, 20),
    month,
  };
}

function formatCrimeCategory(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
