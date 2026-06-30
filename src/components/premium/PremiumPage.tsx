"use client";

import { useState } from "react";
import { Card, CardHeader, Badge } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { formatDistance } from "@/lib/local-area";
import { opportunities } from "@/lib/mock-data";
import {
  AreaComparisonTool,
  MortgageCalculator,
  RentalYieldCalculator,
} from "@/components/tools/Calculators";
import { useUser } from "@/context/UserContext";

const premiumFeatures = [
  {
    title: "Opportunity finder",
    description:
      "Expired planning permissions, development plots, extension potential, HMO conversions.",
    icon: "🔍",
  },
  {
    title: "Investment tools",
    description:
      "Rental yield calculator, mortgage calculator, area comparison, capital growth trends.",
    icon: "📈",
  },
  {
    title: "Homeowner tools",
    description:
      "Maintenance reminders, extension cost estimates, tradesperson recommendations.",
    icon: "🏠",
  },
  {
    title: "Document storage",
    description:
      "Upload deeds and certificates — auto-generates reminders and to-dos.",
    icon: "📄",
  },
];

export function PremiumPage() {
  const { user, property } = useUser();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const defaultPrice = property?.valuation.estimatedValue ?? 685000;

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setCheckoutLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-8 text-white">
        <span className="inline-flex rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white">
          PlotPulse Premium
        </span>
        <h1 className="mt-4 text-3xl font-bold">Turn local change into opportunity</h1>
        <p className="mt-2 max-w-2xl text-amber-100">
          Interactive investment tools powered by live area data from your
          dashboard.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={handleUpgrade}
            disabled={checkoutLoading}
            className="rounded-lg bg-white px-6 py-3 text-base font-medium text-teal-900 hover:bg-teal-50 disabled:opacity-50"
          >
            {checkoutLoading ? "Loading…" : "Upgrade · £9.99/month"}
          </button>
          {!user && (
            <LinkButton href="/onboarding" variant="secondary" size="lg">
              Sign up first
            </LinkButton>
          )}
        </div>
      </div>

      <RentalYieldCalculator defaultPrice={defaultPrice} />
      <MortgageCalculator defaultPrice={defaultPrice} />
      <AreaComparisonTool
        areaA={{
          name: property?.location.sector ?? "Your sector",
          averagePrice: property?.valuation.estimatedValue ?? 685000,
          changePercent: property?.valuation.valueChangePercent ?? 2.4,
        }}
        areaB={{
          name: "Adjacent district",
          averagePrice: (property?.valuation.estimatedValue ?? 685000) * 0.92,
          changePercent: (property?.valuation.valueChangePercent ?? 2.4) - 1.3,
        }}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {premiumFeatures.map((feature) => (
          <Card key={feature.title}>
            <span className="text-2xl">{feature.icon}</span>
            <h3 className="mt-3 font-semibold text-slate-900">{feature.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{feature.description}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="Opportunity finder preview" subtitle="Premium feature samples" />
        <div className="space-y-3">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h4 className="font-medium text-slate-900">{opp.title}</h4>
                <Badge variant="premium">
                  {formatDistance(opp.distanceMetres)}
                </Badge>
              </div>
              <p className="text-sm text-slate-500">{opp.address}</p>
              <p className="mt-1 text-sm text-slate-600">{opp.summary}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
