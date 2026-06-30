# PlotPulse

**UK property & local intelligence** — what's changing around your home or investment property, and how can you benefit?

## Recommended name: **PlotPulse**

| Name | Why it works |
|------|--------------|
| **PlotPulse** ✓ | "Plot" = your property/land; "Pulse" = live monitoring of local change. Memorable, brandable, works for homeowners and investors. |
| PostPatch | Very British ("patch" = neighbourhood). Postcode-native but less distinctive. |
| Hearthscope | Warm, homeowner-focused. Less investor appeal. |

## Local area recommendation

| Tier | Definition | Use for |
|------|------------|---------|
| **Immediate** | 500m radius | Neighbour planning applications |
| **Neighbourhood** (default) | **750m radius, capped to postcode sector** | Feed, alerts, community |
| **District** | Outward postcode (e.g. SW11) | Price trends, investment stats |

## Live data integrations

| Source | Data | Auth required |
|--------|------|---------------|
| [postcodes.io](https://postcodes.io) | Geocoding, admin areas | No |
| [planning.data.gov.uk](https://planning.data.gov.uk) | Planning applications | No |
| [data.police.uk](https://data.police.uk) | Street-level crime | No |
| [Land Registry UK HPI](https://landregistry.data.gov.uk) | Area prices & trends | No |
| [Land Registry Price Paid](https://landregistry.data.gov.uk) | Sale history (SPARQL) | No |
| [Environment Agency](https://environment.data.gov.uk) | Flood warnings | No |
| [EPC Open Data](https://epc.opendatacommunities.org) | Energy ratings | API key (free) |
| Clerk | Authentication | Optional |
| Stripe | Premium billing | Optional |
| OpenAI | AI moderation | Optional |

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **Quick demo** or sign up with your postcode.

### Environment variables

See `.env.example` for all optional integrations. The app works out of the box with free public APIs — no keys required for core features.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Marketing landing |
| `/onboarding` | Postcode signup + demo mode |
| `/dashboard` | Live property dashboard |
| `/feed` | Local intelligence from real APIs |
| `/alerts` | Smart alerts from live data |
| `/tools` | Rental yield, mortgage, area comparison calculators |
| `/premium` | Premium features + Stripe checkout |
| `/community` | Moderated neighbour discussions |

## API routes

- `GET /api/property?postcode=SW114QR` — aggregated property intelligence
- `GET /api/postcode/[postcode]` — geocoding lookup
- `POST /api/auth/session` — dev signup (sets session cookie)
- `POST /api/auth/demo` — quick demo session
- `POST /api/community/posts` — create moderated community post
- `POST /api/stripe/checkout` — premium subscription checkout

## Architecture

```
postcode → postcodes.io (lat/lng)
         → parallel fetch:
            • Land Registry HPI + Price Paid
            • planning.data.gov.uk (750m polygon)
            • data.police.uk (750m filter)
            • Environment Agency floods
            • EPC (if API key set)
         → aggregated feed + alerts + dashboard
```

## Revenue model

- Premium subscriptions (Stripe)
- Mortgage & conveyancing referrals
- Insurance commission
- Tradesperson advertising
- Estate agent leads
