"use client";

import { AppShell } from "@/components/layout/AppShell";
import {
  AreaComparisonTool,
  MortgageCalculator,
  RentalYieldCalculator,
} from "@/components/tools/Calculators";
import { useUser } from "@/context/UserContext";

export default function ToolsPage() {
  const { property } = useUser();
  const price = property?.valuation.estimatedValue ?? 685000;

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Investment tools</h1>
        <p className="text-slate-500">
          Calculators pre-filled with live area data from your property dashboard
        </p>
      </div>
      <div className="space-y-6">
        <RentalYieldCalculator defaultPrice={price} />
        <MortgageCalculator defaultPrice={price} />
        <AreaComparisonTool
          areaA={{
            name: property?.location.sector ?? "Your sector",
            averagePrice: price,
            changePercent: property?.valuation.valueChangePercent ?? 0,
          }}
          areaB={{
            name: property?.location.adminDistrict ?? "District",
            averagePrice: price * 0.95,
            changePercent: (property?.valuation.valueChangePercent ?? 0) - 0.5,
          }}
        />
      </div>
    </AppShell>
  );
}
