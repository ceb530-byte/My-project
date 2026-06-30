import { Card, CardHeader, Badge } from "@/components/ui/Card";
import {
  epcColor,
  floodRiskLabel,
  formatCurrency,
  formatDate,
  formatPercent,
} from "@/lib/format";
import type { Property } from "@/lib/types";

export function PropertyDashboard({ property }: { property: Property }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {property.address}
        </h1>
        <p className="text-slate-500">{property.postcode}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-teal-700 to-teal-800 text-white">
          <p className="text-sm text-teal-100">Estimated value</p>
          <p className="mt-1 text-3xl font-bold">
            {formatCurrency(property.estimatedValue)}
          </p>
          <p className="mt-2 text-sm text-teal-100">
            {formatPercent(property.valueChangePercent)} this quarter
          </p>
        </Card>

        <Card>
          <p className="text-sm text-slate-500">Last sold</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {property.lastSoldPrice
              ? formatCurrency(property.lastSoldPrice)
              : "—"}
          </p>
          {property.lastSoldDate && (
            <p className="mt-2 text-sm text-slate-500">
              {formatDate(property.lastSoldDate)}
            </p>
          )}
        </Card>

        <Card>
          <p className="text-sm text-slate-500">EPC rating</p>
          <div className="mt-2 flex items-center gap-3">
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-lg text-xl font-bold text-white ${epcColor(property.epcRating)}`}
            >
              {property.epcRating}
            </span>
            <div>
              <p className="font-semibold text-slate-900">
                Score {property.epcScore}
              </p>
              <p className="text-sm text-slate-500">Valid until 2031</p>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-sm text-slate-500">Council tax & flood</p>
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Band</span>
              <Badge>{property.councilTaxBand}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Flood risk</span>
              <Badge variant="success">
                {floodRiskLabel(property.floodRisk)}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="School catchments"
          subtitle="Based on published admission areas — always verify with schools"
        />
        <div className="space-y-3">
          {property.schoolCatchments.map((school) => (
            <div
              key={school.name}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3"
            >
              <div>
                <p className="font-medium text-slate-900">{school.name}</p>
                <p className="text-sm text-slate-500 capitalize">
                  {school.type} · {school.distanceMetres}m away
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    school.ofstedRating === "Outstanding" ? "success" : "default"
                  }
                >
                  {school.ofstedRating}
                </Badge>
                <Badge variant={school.inCatchment ? "success" : "warning"}>
                  {school.inCatchment ? "In catchment" : "Outside"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
