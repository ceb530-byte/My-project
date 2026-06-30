import { Card, CardHeader, Badge } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { formatDistance } from "@/lib/local-area";
import { opportunities } from "@/lib/mock-data";

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
      "Maintenance reminders, extension cost estimates, tradesperson recommendations, insurance renewals.",
    icon: "🏠",
  },
  {
    title: "Document storage",
    description:
      "Upload deeds, surveys, and certificates — auto-generates reminders and to-dos.",
    icon: "📄",
  },
  {
    title: "Utilities hub",
    description:
      "Contract renewal reminders and recommended supplier suggestions.",
    icon: "⚡",
  },
];

const revenuePartners = [
  "Mortgage referrals",
  "Conveyancing referrals",
  "Insurance commission",
  "Tradesperson advertising",
  "Estate agent leads",
];

export function PremiumPage() {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-8 text-white">
        <span className="inline-flex rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white">
          PlotPulse Premium
        </span>
        <h1 className="mt-4 text-3xl font-bold">Turn local change into opportunity</h1>
        <p className="mt-2 max-w-2xl text-amber-100">
          Go beyond alerts. Find investment angles, manage your home, and act
          before your neighbours do.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <LinkButton href="/onboarding" variant="secondary" size="lg">
            Start free trial
          </LinkButton>
          <span className="self-center text-sm text-amber-100">
            £9.99/month · cancel anytime
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {premiumFeatures.map((feature) => (
          <Card key={feature.title}>
            <span className="text-2xl">{feature.icon}</span>
            <h3 className="mt-3 font-semibold text-slate-900">
              {feature.title}
            </h3>
            <p className="mt-1 text-sm text-slate-600">{feature.description}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Opportunity finder preview"
          subtitle="Premium · sample opportunities near SW11 4QR"
        />
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
              {opp.estimatedUpside && (
                <p className="mt-2 text-sm font-medium text-teal-700">
                  {opp.estimatedUpside}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Investment tools" subtitle="Included with Premium" />
        <div className="grid gap-4 sm:grid-cols-2">
          <ToolPreview
            title="Rental yield calculator"
            fields={["Purchase price", "Monthly rent", "Costs"]}
            result="Gross yield: 5.8%"
          />
          <ToolPreview
            title="Mortgage calculator"
            fields={["Deposit", "Rate", "Term"]}
            result="Monthly: £2,847"
          />
          <ToolPreview
            title="Area comparison"
            fields={["SW11 vs SW12", "Price growth", "Yield"]}
            result="SW11 +2.4% vs SW12 +1.1%"
          />
          <ToolPreview
            title="Capital growth trends"
            fields={["5yr district trend", "Sector trend"]}
            result="District: +28% since 2021"
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="Partner revenue model" />
        <p className="mb-4 text-sm text-slate-600">
          Free tier drives engagement; Premium unlocks tools. Referrals and
          partner placements are contextual — shown when relevant to your
          property journey.
        </p>
        <div className="flex flex-wrap gap-2">
          {revenuePartners.map((partner) => (
            <Badge key={partner}>{partner}</Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ToolPreview({
  title,
  fields,
  result,
}: {
  title: string;
  fields: string[];
  result: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 p-4">
      <h4 className="font-medium text-slate-900">{title}</h4>
      <ul className="mt-2 space-y-1">
        {fields.map((f) => (
          <li key={f} className="text-xs text-slate-400">
            {f}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm font-semibold text-teal-700">{result}</p>
    </div>
  );
}
