import { NextRequest, NextResponse } from "next/server";
import { lookupPostcode } from "@/lib/api/postcodes";
import { parsePostcode } from "@/lib/local-area";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ postcode: string }> }
) {
  const { postcode: raw } = await params;
  const parsed = parsePostcode(decodeURIComponent(raw));

  if (!parsed.isValid) {
    return NextResponse.json({ error: "Invalid UK postcode" }, { status: 400 });
  }

  try {
    const result = await lookupPostcode(parsed.full);
    if (!result) {
      return NextResponse.json({ error: "Postcode not found" }, { status: 404 });
    }
    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=86400" },
    });
  } catch (error) {
    console.error("Postcode lookup error:", error);
    return NextResponse.json({ error: "Lookup failed" }, { status: 502 });
  }
}
