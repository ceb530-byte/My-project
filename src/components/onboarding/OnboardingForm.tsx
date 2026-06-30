"use client";

import { useState } from "react";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  getRecommendedLocalArea,
  LOCAL_AREA_TIERS,
  parsePostcode,
} from "@/lib/local-area";

export function OnboardingForm() {
  const [postcode, setPostcode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const parsed = parsePostcode(postcode);
  const recommendation = getRecommendedLocalArea(postcode);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Where is your property?
        </h1>
        <p className="mt-2 text-slate-600">
          Enter your postcode to start monitoring what&apos;s changing around
          your home or investment.
        </p>
      </div>

      <Card>
        <label className="block text-sm font-medium text-slate-700">
          UK postcode
        </label>
        <input
          type="text"
          value={postcode}
          onChange={(e) => {
            setPostcode(e.target.value);
            setSubmitted(false);
          }}
          placeholder="e.g. SW11 4QR"
          className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-lg uppercase tracking-wider outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
        />
        {postcode && !parsed.isValid && (
          <p className="mt-2 text-sm text-red-600">
            Please enter a valid UK postcode
          </p>
        )}
      </Card>

      {parsed.isValid && (
        <Card className="border-teal-200 bg-teal-50/40">
          <h2 className="font-semibold text-teal-900">Your local area</h2>
          <p className="mt-2 text-sm leading-relaxed text-teal-800">
            {recommendation.userFacingSummary}
          </p>

          <div className="mt-4 space-y-2">
            {Object.values(LOCAL_AREA_TIERS).map((tier) => (
              <div
                key={tier.tier}
                className="rounded-lg border border-teal-100 bg-white px-3 py-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">
                    {tier.label}
                  </span>
                  <Badge
                    variant={
                      tier.tier === "neighbourhood" ? "success" : "default"
                    }
                  >
                    {tier.radiusMetres}m
                    {tier.tier === "neighbourhood" ? " · default" : ""}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {tier.description}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Button
        className="w-full"
        size="lg"
        disabled={!parsed.isValid}
        onClick={() => setSubmitted(true)}
      >
        {submitted ? "Redirecting to dashboard…" : "Start monitoring"}
      </Button>

      {submitted && parsed.isValid && (
        <p className="text-center text-sm text-slate-500">
          <a href="/dashboard" className="font-medium text-teal-700 underline">
            Continue to your property dashboard →
          </a>
        </p>
      )}
    </div>
  );
}
