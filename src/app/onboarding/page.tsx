"use client";

import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

export default function OnboardingPage() {
  const router = useRouter();
  const { setUser } = useUser();

  const startDemo = async () => {
    const res = await fetch("/api/auth/demo", { method: "POST" });
    const data = await res.json();
    if (data.user) {
      setUser(data.user);
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-sm font-bold text-white">
            PP
          </div>
          <span className="text-lg font-semibold text-slate-900">PlotPulse</span>
        </Link>
        <button
          onClick={startDemo}
          className="text-sm font-medium text-teal-700 hover:text-teal-900"
        >
          Quick demo (SW11 4QR) →
        </button>
      </div>
      <div className="px-4 pb-16 pt-8">
        <OnboardingForm />
      </div>
    </div>
  );
}
