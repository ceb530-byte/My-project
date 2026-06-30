import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import Link from "next/link";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-sm font-bold text-white">
            PP
          </div>
          <span className="text-lg font-semibold text-slate-900">PlotPulse</span>
        </Link>
      </div>
      <div className="px-4 pb-16 pt-8">
        <OnboardingForm />
      </div>
    </div>
  );
}
