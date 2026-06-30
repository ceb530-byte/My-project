"use client";

import { Card, CardHeader, Badge } from "@/components/ui/Card";
import {
  epcColor,
  floodRiskLabel,
  formatCurrency,
  formatDate,
  formatPercent,
} from "@/lib/format";
import type { PropertyIntelligence } from "@/lib/api/intelligence";

export function PropertyDashboard({
  data,
  loading,
}: {
  data: PropertyIntelligence | null;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <p className="text-slate-600">
          No property data loaded. Complete onboarding with your postcode.
        </p>
      </Card>
    );
  }

  const latestSale = data.saleHistory[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {data.postcode}
        </h1>
        <p className="text-slate-500">
          {data.location.adminWard}, {data.location.adminDistrict} · Live data
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-teal-700 to-teal-800 text-white">
          <p className="text-sm text-teal-100">Area average (UK HPI)</p>
          <p className="mt-1 text-3xl font-bold">
            {formatCurrency(data.valuation.estimatedValue)}
          </p>
          <p className="mt-2 text-sm text-teal-100">
            {formatPercent(data.valuation.valueChangePercent)} ({data.valuation.hpiMonth})
          </p>
        </Card>

        <Card>
          <p className="text-sm text-slate-500">Latest sale in postcode</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {latestSale ? formatCurrency(latestSale.amount) : "—"}
          </p>
          {latestSale && (
            <>
              <p className="mt-1 text-sm text-slate-600">{latestSale.address}</p>
              <p className="text-sm text-slate-500">
                {formatDate(latestSale.date)}
              </p>
            </>
          )}
        </Card>

        <Card>
          <p className="text-sm text-slate-500">EPC rating</p>
          <div className="mt-2 flex items-center gap-3">
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-lg text-xl font-bold text-white ${epcColor(data.epc.rating)}`}
            >
              {data.epc.rating}
            </span>
            <div>
              <p className="font-semibold text-slate-900">
                {data.epc.score > 0 ? `Score ${data.epc.score}` : "No EPC data"}
              </p>
              <p className="text-sm text-slate-500">
                {data.epc.records.length > 0
                  ? `${data.epc.records.length} certificates found`
                  : "Add EPC_API_KEY for live data"}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-sm text-slate-500">Flood & crime</p>
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Flood risk</span>
              <Badge
                variant={
                  data.flood.riskLevel === "high" ? "danger" : "success"
                }
              >
                {floodRiskLabel(data.flood.riskLevel)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Crime (750m)</span>
              <Badge variant="default">{data.crime.total} incidents</Badge>
            </div>
          </div>
        </Card>
      </div>

      {data.saleHistory.length > 0 && (
        <Card>
          <CardHeader
            title="Sale history"
            subtitle="Land Registry Price Paid Data · this postcode"
          />
          <div className="space-y-2">
            {data.saleHistory.slice(0, 5).map((sale, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-2"
              >
                <span className="text-sm text-slate-700">{sale.address}</span>
                <div className="text-right">
                  <span className="font-medium text-slate-900">
                    {formatCurrency(sale.amount)}
                  </span>
                  <span className="ml-2 text-sm text-slate-500">
                    {formatDate(sale.date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {data.planning.length > 0 && (
        <Card>
          <CardHeader
            title="Nearby planning applications"
            subtitle="planning.data.gov.uk · within 750m"
          />
          <div className="space-y-2">
            {data.planning.slice(0, 5).map((app) => (
              <div
                key={app.reference}
                className="rounded-lg border border-slate-100 px-4 py-3"
              >
                <p className="font-medium text-slate-900">{app.reference}</p>
                <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                  {app.description}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
