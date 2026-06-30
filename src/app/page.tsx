import { MarketingNav } from "@/components/layout/Nav";
import { LinkButton } from "@/components/ui/Button";

const features = [
  {
    title: "Property dashboard",
    description:
      "Estimated value, sale history, EPC, council tax, flood risk, and school catchments in one view.",
  },
  {
    title: "Local intelligence feed",
    description:
      "Planning applications, developments, transport, schools, retail, crime, and road closures nearby.",
  },
  {
    title: "Smart alerts",
    description:
      "Neighbour planning apps, approved developments, postcode price movements, and renewal reminders.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900">
        <MarketingNav />
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-32 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-widest text-teal-300">
              UK property & local intelligence
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              What&apos;s changing around your home — and how can you benefit?
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-teal-100">
              PlotPulse monitors your postcode area and turns local changes into
              actionable insight for homeowners and investors.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <LinkButton href="/onboarding" size="lg">
                Enter your postcode
              </LinkButton>
              <LinkButton
                href="/dashboard"
                variant="secondary"
                size="lg"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                Explore demo
              </LinkButton>
            </div>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
              >
                <h3 className="font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-teal-100/80">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Hyperlocal by design
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              On signup, you enter your postcode. We define your &ldquo;local
              area&rdquo; as a <strong>750m radius capped to your postcode
              sector</strong> — roughly 500–1,000 homes. That&apos;s the sweet
              spot for neighbour planning alerts and nearby developments, without
              the noise of a whole town.
            </p>
            <p className="mt-4 leading-relaxed text-slate-600">
              Price trends and investment comparisons use your wider{" "}
              <strong>postcode district</strong> (e.g. SW11) for meaningful
              statistics.
            </p>
            <LinkButton href="/onboarding" className="mt-6">
              Get started free
            </LinkButton>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <LocalAreaDiagram />
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold text-slate-900">
            Free intelligence. Premium opportunity.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">Free</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>✓ Property dashboard</li>
                <li>✓ Local intelligence feed</li>
                <li>✓ Smart alerts</li>
                <li>✓ Community (verified locals)</li>
              </ul>
            </div>
            <div className="rounded-xl border-2 border-amber-400 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Premium · £9.99/mo
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>✓ Opportunity finder</li>
                <li>✓ Investment & mortgage calculators</li>
                <li>✓ Homeowner maintenance tools</li>
                <li>✓ Document storage & reminders</li>
                <li>✓ Utilities renewal hub</li>
              </ul>
              <LinkButton href="/premium" variant="premium" className="mt-4">
                See Premium
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        PlotPulse · UK property & local intelligence
      </footer>
    </div>
  );
}

function LocalAreaDiagram() {
  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="text-center">
        <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-full border-2 border-dashed border-teal-300 bg-teal-50">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-teal-500 bg-teal-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white">
              🏠
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2 text-slate-600">
        <p>
          <span className="inline-block w-3 h-3 rounded-full bg-teal-600 mr-2" />
          Your property
        </p>
        <p>
          <span className="inline-block w-3 h-3 rounded-full bg-teal-300 mr-2" />
          500m — immediate (planning neighbours)
        </p>
        <p>
          <span className="inline-block w-3 h-3 rounded-full border-2 border-teal-500 mr-2" />
          750m — neighbourhood default (feed & alerts)
        </p>
        <p>
          <span className="inline-block w-3 h-3 rounded-full border border-slate-400 mr-2" />
          District — price trends & investment
        </p>
      </div>
    </div>
  );
}
