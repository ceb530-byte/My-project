"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import {
  calculateMortgage,
  calculateRentalYield,
  compareAreas,
} from "@/lib/calculators";
import { formatCurrency, formatPercent } from "@/lib/format";

function NumberInput({
  label,
  value,
  onChange,
  prefix,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="relative mt-1">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className={`w-full rounded-lg border border-slate-300 py-2 ${prefix ? "pl-7" : "pl-3"} pr-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

export function RentalYieldCalculator({
  defaultPrice = 685000,
}: {
  defaultPrice?: number;
}) {
  const [purchasePrice, setPurchasePrice] = useState(defaultPrice);
  const [monthlyRent, setMonthlyRent] = useState(2800);
  const [annualCosts, setAnnualCosts] = useState(3500);

  const result = calculateRentalYield({
    purchasePrice,
    monthlyRent,
    annualCosts,
  });

  return (
    <Card>
      <CardHeader title="Rental yield calculator" subtitle="Gross and net yield" />
      <div className="grid gap-4 sm:grid-cols-3">
        <NumberInput
          label="Purchase price"
          value={purchasePrice}
          onChange={setPurchasePrice}
          prefix="£"
        />
        <NumberInput
          label="Monthly rent"
          value={monthlyRent}
          onChange={setMonthlyRent}
          prefix="£"
        />
        <NumberInput
          label="Annual costs"
          value={annualCosts}
          onChange={setAnnualCosts}
          prefix="£"
        />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <ResultBox label="Gross yield" value={formatPercent(result.grossYield)} />
        <ResultBox label="Net yield" value={formatPercent(result.netYield)} highlight />
        <ResultBox
          label="Monthly profit"
          value={formatCurrency(result.monthlyProfit)}
        />
      </div>
    </Card>
  );
}

export function MortgageCalculator({
  defaultPrice = 685000,
}: {
  defaultPrice?: number;
}) {
  const [propertyPrice, setPropertyPrice] = useState(defaultPrice);
  const [deposit, setDeposit] = useState(137000);
  const [annualRate, setAnnualRate] = useState(4.5);
  const [termYears, setTermYears] = useState(25);

  const result = calculateMortgage({
    propertyPrice,
    deposit,
    annualRate,
    termYears,
  });

  return (
    <Card>
      <CardHeader title="Mortgage calculator" subtitle="Repayment estimate" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <NumberInput
          label="Property price"
          value={propertyPrice}
          onChange={setPropertyPrice}
          prefix="£"
        />
        <NumberInput
          label="Deposit"
          value={deposit}
          onChange={setDeposit}
          prefix="£"
        />
        <NumberInput
          label="Interest rate"
          value={annualRate}
          onChange={setAnnualRate}
          suffix="%"
        />
        <NumberInput
          label="Term"
          value={termYears}
          onChange={setTermYears}
          suffix="yrs"
        />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <ResultBox
          label="Monthly payment"
          value={formatCurrency(result.monthlyPayment)}
          highlight
        />
        <ResultBox label="Loan amount" value={formatCurrency(result.loanAmount)} />
        <ResultBox label="LTV" value={formatPercent(result.ltv, false)} />
        <ResultBox
          label="Total interest"
          value={formatCurrency(result.totalInterest)}
        />
      </div>
    </Card>
  );
}

export function AreaComparisonTool({
  areaA,
  areaB,
}: {
  areaA: { name: string; averagePrice: number; changePercent: number };
  areaB: { name: string; averagePrice: number; changePercent: number };
}) {
  const [rentA, setRentA] = useState(2800);
  const [rentB, setRentB] = useState(2400);

  const result = compareAreas({
    areaA,
    areaB,
    monthlyRentA: rentA,
    monthlyRentB: rentB,
  });

  return (
    <Card>
      <CardHeader
        title="Area comparison"
        subtitle={`${areaA.name} vs ${areaB.name}`}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          label={`Monthly rent (${areaA.name})`}
          value={rentA}
          onChange={setRentA}
          prefix="£"
        />
        <NumberInput
          label={`Monthly rent (${areaB.name})`}
          value={rentB}
          onChange={setRentB}
          prefix="£"
        />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ResultBox
          label="Price difference"
          value={formatCurrency(Math.abs(result.priceDifference))}
        />
        <ResultBox
          label="Growth difference"
          value={formatPercent(result.changeDifference)}
        />
        {result.yieldA !== undefined && (
          <ResultBox
            label={`Yield ${areaA.name}`}
            value={formatPercent(result.yieldA)}
          />
        )}
        {result.yieldB !== undefined && (
          <ResultBox
            label={`Yield ${areaB.name}`}
            value={formatPercent(result.yieldB)}
          />
        )}
      </div>
      <p className="mt-4 rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-800">
        {result.recommendation}
      </p>
    </Card>
  );
}

function ResultBox({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg px-4 py-3 ${highlight ? "bg-teal-700 text-white" : "bg-slate-50"}`}
    >
      <p
        className={`text-xs ${highlight ? "text-teal-100" : "text-slate-500"}`}
      >
        {label}
      </p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
