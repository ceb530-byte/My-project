# PlotPulse

**UK property & local intelligence** — what's changing around your home or investment property, and how can you benefit?

## Recommended name: PlotPulse

| Name | Why it works |
|------|--------------|
| **PlotPulse** ✓ | "Plot" = your property/land; "Pulse" = live monitoring of local change. Memorable, brandable, works for homeowners and investors. |
| PostPatch | Very British ("patch" = neighbourhood). Postcode-native but less distinctive. |
| Hearthscope | Warm, homeowner-focused. Less investor appeal. |
| LocaleSignal | Professional but generic. |

**PlotPulse** is the recommended name: short, catchy, and directly communicates continuous monitoring of your property's surroundings.

## Local area recommendation

Use a **tiered geography model** anchored to the user's postcode:

| Tier | Definition | Use for |
|------|------------|---------|
| **Immediate** | 500m radius | Neighbour planning applications, adjacent modifications |
| **Neighbourhood** (default) | **750m radius, capped to postcode sector** | Intelligence feed, smart alerts, community |
| **District** | Outward postcode (e.g. SW11) | Price trends, yield comparisons, capital growth |

### Why postcode sector + 750m?

- A **postcode sector** (e.g. `SW11 4`) typically covers 500–1,000 homes — large enough for meaningful data, small enough to feel "local".
- A **750m radius** matches walking distance and aligns with how people think about "nearby".
- **Capping to the sector** prevents bleed into adjacent areas with different character (e.g. main road vs quiet terrace).
- **District-level** data is too coarse for "neighbour applied for a loft" alerts but right for "prices in SW11 rose 2.4%".

Users see: *"We monitor a 750m radius around your home, within postcode sector SW11 4 (~500–1,000 homes)."*

## Features

### Free tier
- Property dashboard (value, sale history, EPC, council tax, flood risk, schools)
- Local intelligence feed (planning, developments, transport, crime, etc.)
- Smart alerts
- Verified community discussions

### Premium (£9.99/mo)
- Opportunity finder (expired planning, development plots, extensions, HMOs)
- Investment tools (yield, mortgage, area comparison, growth trends)
- Homeowner tools (maintenance, extension costs, tradesperson recs)
- Document storage with auto-reminders
- Utilities renewal hub

### Revenue streams
- Premium subscriptions
- Mortgage & conveyancing referrals
- Insurance commission
- Tradesperson advertising
- Estate agent leads

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Routes
- `/` — Marketing landing
- `/onboarding` — Postcode signup with local area preview
- `/dashboard` — Property dashboard
- `/feed` — Local intelligence feed
- `/alerts` — Smart alerts
- `/premium` — Premium features & opportunities
- `/community` — Neighbour discussions

## Data sources (production)

Integrate with: Land Registry Price Paid, EPC Open Data, planning.data.gov.uk, Police.uk, Ofsted, Environment Agency flood maps, council tax APIs, TfL/National Highways, and ONS postcode geography.
