"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  getRecommendedLocalArea,
  LOCAL_AREA_TIERS,
  parsePostcode,
} from "@/lib/local-area";
import { useUser } from "@/context/UserContext";

export function OnboardingForm() {
  const router = useRouter();
  const { setUser } = useUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [postcode, setPostcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const parsed = parsePostcode(postcode);
  const recommendation = getRecommendedLocalArea(postcode);

  const handleSubmit = async () => {
    if (!parsed.isValid || !name || !email) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, postcode: parsed.full }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Signup failed");
        return;
      }

      setUser(data.user);
      router.push("/dashboard");
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Where is your property?
        </h1>
        <p className="mt-2 text-slate-600">
          Enter your postcode to start monitoring live changes from official UK
          data sources.
        </p>
      </div>

      <Card>
        <label className="block text-sm font-medium text-slate-700">
          Your name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Alex Morgan"
          className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
        />
      </Card>

      <Card>
        <label className="block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
        />
      </Card>

      <Card>
        <label className="block text-sm font-medium text-slate-700">
          UK postcode
        </label>
        <input
          type="text"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
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

      {error && (
        <p className="text-center text-sm text-red-600">{error}</p>
      )}

      <Button
        className="w-full"
        size="lg"
        disabled={!parsed.isValid || !name || !email || loading}
        onClick={handleSubmit}
      >
        {loading ? "Verifying postcode…" : "Start monitoring"}
      </Button>
    </div>
  );
}
