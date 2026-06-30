import { fetchJson } from "./client";

export interface PostcodeData {
  postcode: string;
  latitude: number;
  longitude: number;
  country: string;
  region: string;
  admin_district: string;
  admin_ward: string;
  parliamentary_constituency: string;
  outcode: string;
  incode: string;
  lsoa: string;
  msoa: string;
  eastings: number;
  northings: number;
}

interface PostcodesIoResponse {
  status: number;
  result: PostcodeData | null;
}

export async function lookupPostcode(
  postcode: string
): Promise<PostcodeData | null> {
  const normalised = postcode.replace(/\s+/g, "").toUpperCase();
  const data = await fetchJson<PostcodesIoResponse>(
    `https://api.postcodes.io/postcodes/${encodeURIComponent(normalised)}`,
    { revalidate: 86400 }
  );
  return data.result;
}

export function sectorFromPostcode(postcode: string): string {
  const parts = postcode.trim().toUpperCase().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1][0]}`;
  }
  return parts[0];
}
