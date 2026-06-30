import { NextRequest, NextResponse } from "next/server";
import { buildPropertyIntelligence } from "@/lib/api/intelligence";
import { parsePostcode } from "@/lib/local-area";

export async function GET(request: NextRequest) {
  const postcode = request.nextUrl.searchParams.get("postcode");
  if (!postcode) {
    return NextResponse.json(
      { error: "postcode query parameter required" },
      { status: 400 }
    );
  }

  const parsed = parsePostcode(postcode);
  if (!parsed.isValid) {
    return NextResponse.json({ error: "Invalid UK postcode" }, { status: 400 });
  }

  try {
    const data = await buildPropertyIntelligence(parsed.full);
    if (!data) {
      return NextResponse.json({ error: "Postcode not found" }, { status: 404 });
    }
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (error) {
    console.error("Property intelligence error:", error);
    return NextResponse.json(
      { error: "Failed to fetch property intelligence" },
      { status: 502 }
    );
  }
}
