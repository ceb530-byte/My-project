/**
 * Sync schools from GIAS bulk CSV when accessible.
 * Run: npx tsx scripts/sync-schools.ts
 *
 * Source: https://get-information-schools.service.gov.uk/Downloads
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const OFSTED_MAP: Record<string, string> = {
  "1": "Outstanding",
  "2": "Good",
  "3": "Requires improvement",
  "4": "Inadequate",
};

async function main() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const url = `https://ea-edubase-api-prod.azurewebsites.net/edubase/edubasealldata${date}.csv`;

  console.log(`Fetching GIAS data from ${url}…`);

  const response = await fetch(url);
  if (!response.ok) {
    console.error(
      `GIAS download failed (${response.status}). Using seeded schools instead.`
    );
    console.log("Run npm run db:seed to populate Wandsworth schools.");
    return;
  }

  const text = await response.text();
  const lines = text.split("\n");
  const headers = lines[0]?.split(",") ?? [];
  const latIdx = headers.indexOf("Latitude");
  const lngIdx = headers.indexOf("Longitude");
  const nameIdx = headers.indexOf("EstablishmentName");
  const urnIdx = headers.indexOf("URN");
  const phaseIdx = headers.indexOf("PhaseOfEducation (name)");
  const ofstedIdx = headers.indexOf("OfstedRating (name)");
  const postcodeIdx = headers.indexOf("Postcode");
  const laIdx = headers.indexOf("LA (name)");
  const statusIdx = headers.indexOf("EstablishmentStatus (name)");

  let count = 0;
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    const cols = line.split(",");
    if (cols[statusIdx] !== "Open") continue;

    const lat = parseFloat(cols[latIdx]);
    const lng = parseFloat(cols[lngIdx]);
    if (isNaN(lat) || isNaN(lng)) continue;

    const urn = cols[urnIdx];
    if (!urn) continue;

    await prisma.school.upsert({
      where: { urn },
      update: {
        name: cols[nameIdx] ?? "Unknown",
        phase: cols[phaseIdx] ?? "Unknown",
        ofstedRating: cols[ofstedIdx] || undefined,
        latitude: lat,
        longitude: lng,
        postcode: cols[postcodeIdx],
        localAuthority: cols[laIdx],
      },
      create: {
        urn,
        name: cols[nameIdx] ?? "Unknown",
        phase: cols[phaseIdx] ?? "Unknown",
        ofstedRating: cols[ofstedIdx] || undefined,
        latitude: lat,
        longitude: lng,
        postcode: cols[postcodeIdx],
        localAuthority: cols[laIdx],
      },
    });
    count++;
    if (count % 1000 === 0) console.log(`Synced ${count} schools…`);
  }

  console.log(`Done. Synced ${count} open schools.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
