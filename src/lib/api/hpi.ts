import { fetchJson } from "./client";

export interface HpiData {
  region: string;
  refMonth: string;
  averagePrice: number;
  percentageChange: number;
  percentageAnnualChange: number;
}

interface HpiMonthResponse {
  result?: {
    primaryTopic?: {
      averagePrice?: number;
      percentageChange?: number;
      percentageAnnualChange?: number;
      refMonth?: string;
      refRegion?: { label?: Array<{ _value?: string }> };
    };
  };
}

function slugifyDistrict(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export async function fetchHpiForDistrict(
  adminDistrict: string
): Promise<HpiData | null> {
  const slug = slugifyDistrict(adminDistrict);
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  for (const tryMonth of [month, offsetMonth(month, -1), offsetMonth(month, -2)]) {
    try {
      const data = await fetchJson<HpiMonthResponse>(
        `https://landregistry.data.gov.uk/data/ukhpi/region/${slug}/month/${tryMonth}.json`,
        { revalidate: 86400 }
      );
      const topic = data.result?.primaryTopic;
      if (topic?.averagePrice) {
        return {
          region: topic.refRegion?.label?.[0]?._value ?? adminDistrict,
          refMonth: topic.refMonth ?? tryMonth,
          averagePrice: topic.averagePrice,
          percentageChange: topic.percentageChange ?? 0,
          percentageAnnualChange: topic.percentageAnnualChange ?? 0,
        };
      }
    } catch {
      continue;
    }
  }
  return null;
}

function offsetMonth(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

interface SparqlBinding {
  amount?: { value: string };
  date?: { value: string };
  paon?: { value: string };
  street?: { value: string };
}

interface SparqlResponse {
  results?: { bindings?: SparqlBinding[] };
}

export interface PricePaidRecord {
  amount: number;
  date: string;
  address: string;
}

export async function fetchPricePaidForPostcode(
  postcode: string
): Promise<PricePaidRecord[]> {
  const query = `
    PREFIX lrppi: <http://landregistry.data.gov.uk/def/ppi/>
    PREFIX lrcommon: <http://landregistry.data.gov.uk/def/common/>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    SELECT ?amount ?date ?paon ?street WHERE {
      ?transx lrppi:pricePaid ?amount .
      ?transx lrppi:transactionDate ?date .
      ?transx lrppi:propertyAddress ?addr .
      ?addr lrcommon:postcode "${postcode.toUpperCase()}"^^xsd:string .
      OPTIONAL { ?addr lrcommon:paon ?paon }
      OPTIONAL { ?addr lrcommon:street ?street }
    }
    ORDER BY DESC(?date)
    LIMIT 10
  `;

  const url = new URL("https://landregistry.data.gov.uk/landregistry/query");
  url.searchParams.set("query", query.replace(/\s+/g, " ").trim());

  const data = await fetchJson<SparqlResponse>(url.toString(), {
    revalidate: 86400,
    headers: { Accept: "application/sparql-results+json" },
  });

  return (data.results?.bindings ?? []).map((b) => ({
    amount: parseInt(b.amount?.value ?? "0", 10),
    date: b.date?.value ?? "",
    address: [b.paon?.value, b.street?.value].filter(Boolean).join(" "),
  }));
}
