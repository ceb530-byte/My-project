export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number, signed = true): string {
  const prefix = signed && value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return formatDate(iso);
}

export function floodRiskLabel(
  risk: "very_low" | "low" | "medium" | "high"
): string {
  const labels = {
    very_low: "Very low",
    low: "Low",
    medium: "Medium",
    high: "High",
  };
  return labels[risk];
}

export function epcColor(rating: string): string {
  const colors: Record<string, string> = {
    A: "bg-emerald-600",
    B: "bg-lime-500",
    C: "bg-yellow-400",
    D: "bg-amber-500",
    E: "bg-orange-500",
    F: "bg-red-500",
    G: "bg-red-700",
  };
  return colors[rating] ?? "bg-slate-400";
}
