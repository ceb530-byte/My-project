import { haversineDistanceMetres } from "../geometry";
import { prisma } from "../db";

export interface SchoolResult {
  name: string;
  type: "primary" | "secondary";
  ofstedRating: string;
  distanceMetres: number;
  inCatchment: boolean;
  urn: string;
  phase: string;
  pupils?: number;
  ageRange?: string;
}

const OFSTED_TO_CATCHMENT_KM: Record<string, number> = {
  Outstanding: 2.0,
  Good: 1.5,
  "Requires improvement": 1.0,
  Inadequate: 0.8,
};

export async function fetchSchoolsNearPoint(
  lat: number,
  lng: number,
  radiusMetres = 2000
): Promise<SchoolResult[]> {
  const schools = await prisma.school.findMany();

  return schools
    .map((school) => {
      const distanceMetres = Math.round(
        haversineDistanceMetres(lat, lng, school.latitude, school.longitude)
      );
      const catchmentKm =
        OFSTED_TO_CATCHMENT_KM[school.ofstedRating ?? "Good"] ?? 1.5;
      const inCatchment = distanceMetres <= catchmentKm * 1000;

      return {
        name: school.name,
        type: school.phase.toLowerCase().includes("primary")
          ? ("primary" as const)
          : ("secondary" as const),
        ofstedRating: school.ofstedRating ?? "Not inspected",
        distanceMetres,
        inCatchment,
        urn: school.urn,
        phase: school.phase,
        pupils: school.pupils ?? undefined,
        ageRange:
          school.ageLow && school.ageHigh
            ? `${school.ageLow}–${school.ageHigh}`
            : undefined,
      };
    })
    .filter((s) => s.distanceMetres <= radiusMetres)
    .sort((a, b) => a.distanceMetres - b.distanceMetres)
    .slice(0, 10);
}
