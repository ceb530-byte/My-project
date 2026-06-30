import { isEpcEnabled } from "../env";
import { fetchJson } from "./client";

export interface EpcRecord {
  address: string;
  rating: string;
  score: number;
  propertyType: string;
  lodgementDate: string;
}

interface EpcSearchResponse {
  rows?: Array<Record<string, string>>;
}

export async function fetchEpcForPostcode(
  postcode: string
): Promise<EpcRecord[]> {
  if (!isEpcEnabled()) return [];

  const email = process.env.EPC_API_EMAIL!;
  const apiKey = process.env.EPC_API_KEY!;
  const token = Buffer.from(`${email}:${apiKey}`).toString("base64");

  const url = new URL(
    "https://epc.opendatacommunities.org/api/v1/domestic/search"
  );
  url.searchParams.set("postcode", postcode.replace(/\s+/g, ""));
  url.searchParams.set("size", "10");

  const data = await fetchJson<EpcSearchResponse>(url.toString(), {
    revalidate: 86400,
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${token}`,
    },
  });

  return (data.rows ?? []).map((row) => ({
    address: row.address ?? row["address1"] ?? "Unknown",
    rating: row["current-energy-rating"] ?? "?",
    score: parseInt(row["current-energy-efficiency"] ?? "0", 10),
    propertyType: row["property-type"] ?? "Unknown",
    lodgementDate: row["lodgement-date"] ?? "",
  }));
}
