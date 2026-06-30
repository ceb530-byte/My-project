/** Approximate circle as WKT polygon for planning.data.gov.uk queries */
export function circleToWktPolygon(
  lat: number,
  lng: number,
  radiusMetres: number,
  points = 16
): string {
  const coords: string[] = [];
  const earthRadius = 6378137;

  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const dx = radiusMetres * Math.cos(angle);
    const dy = radiusMetres * Math.sin(angle);
    const dLat = (dy / earthRadius) * (180 / Math.PI);
    const dLng =
      (dx / (earthRadius * Math.cos((lat * Math.PI) / 180))) *
      (180 / Math.PI);
    coords.push(`${lng + dLng} ${lat + dLat}`);
  }

  return `POLYGON((${coords.join(", ")}))`;
}

export function haversineDistanceMetres(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6378137;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
