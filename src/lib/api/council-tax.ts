import { isHomedataEnabled } from "../env";
import { fetchJson } from "./client";
import { prisma } from "../db";

export interface CouncilTaxResult {
  band: string;
  address?: string;
  source: "homedata" | "estimate" | "cache";
  annualChargeEstimate?: number;
  note?: string;
}

// England 1991 band thresholds (approximate for estimation)
const BAND_THRESHOLDS_1991 = [
  { band: "A", max: 40000 },
  { band: "B", max: 52000 },
  { band: "C", max: 68000 },
  { band: "D", max: 88000 },
  { band: "E", max: 120000 },
  { band: "F", max: 160000 },
  { band: "G", max: 320000 },
  { band: "H", max: Infinity },
];

const ANNUAL_CHARGE_BY_BAND: Record<string, number> = {
  A: 1200,
  B: 1400,
  C: 1600,
  D: 1900,
  E: 2300,
  F: 2700,
  G: 3200,
  H: 3800,
};

function estimateBandFromPrice(currentPrice: number, hpiIndex = 93): string {
  // Rough deflation: UK HPI base ~100 in 2015; 1991 values ~15-20% of current in London
  const ratio1991 = 0.18 * (100 / hpiIndex);
  const estimated1991Value = currentPrice * ratio1991;

  for (const { band, max } of BAND_THRESHOLDS_1991) {
    if (estimated1991Value <= max) return band;
  }
  return "H";
}

export async function fetchCouncilTaxBand(
  postcode: string,
  options?: { buildingNumber?: string; averagePrice?: number; hpiIndex?: number }
): Promise<CouncilTaxResult> {
  const normalised = postcode.toUpperCase().replace(/\s+/g, " ");

  const cached = await prisma.councilTaxRecord.findFirst({
    where: { postcode: normalised },
    orderBy: { createdAt: "desc" },
  });
  if (cached && cached.source !== "estimate") {
    return {
      band: cached.band,
      address: cached.address ?? undefined,
      source: "cache",
      annualChargeEstimate: ANNUAL_CHARGE_BY_BAND[cached.band],
    };
  }

  if (isHomedataEnabled() && options?.buildingNumber) {
    try {
      const url = new URL("https://api.homedata.co.uk/api/council_tax_band/");
      url.searchParams.set("postcode", normalised);
      url.searchParams.set("building_number", options.buildingNumber);

      const data = await fetchJson<{
        council_tax_band: string;
        address: string;
      }>(url.toString(), {
        headers: { Authorization: `Api-Key ${process.env.HOMEDATA_API_KEY}` },
        revalidate: 86400 * 30,
      });

      await prisma.councilTaxRecord.create({
        data: {
          postcode: normalised,
          address: data.address,
          band: data.council_tax_band,
          source: "homedata",
        },
      });

      return {
        band: data.council_tax_band,
        address: data.address,
        source: "homedata",
        annualChargeEstimate: ANNUAL_CHARGE_BY_BAND[data.council_tax_band],
      };
    } catch {
      // fall through to estimate
    }
  }

  const band = estimateBandFromPrice(
    options?.averagePrice ?? 400000,
    options?.hpiIndex ?? 93
  );

  await prisma.councilTaxRecord.create({
    data: {
      postcode: normalised,
      band,
      source: "estimate",
    },
  });

  return {
    band,
    source: "estimate",
    annualChargeEstimate: ANNUAL_CHARGE_BY_BAND[band],
    note: "Estimated from area average price. Add HOMEDATA_API_KEY for verified VOA band.",
  };
}
