"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/dashboard", label: "Property" },
  { href: "/feed", label: "Local feed" },
  { href: "/alerts", label: "Alerts" },
  { href: "/premium", label: "Premium" },
  { href: "/community", label: "Community" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-sm font-bold text-white">
            PP
          </div>
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            PlotPulse
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href || pathname.startsWith(item.href + "/")
                  ? "bg-teal-50 text-teal-800"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/onboarding"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:inline"
          >
            SW11 4QR
          </Link>
          <Link
            href="/premium"
            className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:bg-amber-600"
          >
            Upgrade
          </Link>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium",
              pathname === item.href
                ? "bg-teal-50 text-teal-800"
                : "text-slate-600"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function MarketingNav() {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-sm font-bold text-white ring-1 ring-white/20">
            PP
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">
            PlotPulse
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-teal-100 hover:text-white"
          >
            View demo
          </Link>
          <Link
            href="/onboarding"
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-teal-900 hover:bg-teal-50"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
