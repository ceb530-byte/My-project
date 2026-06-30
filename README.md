# PlotPulse

**UK property & local intelligence** — what's changing around your home or investment property, and how can you benefit?

## Quick start

```bash
cp .env.example .env.local
npm install
npm run db:migrate   # or: npm run db:push
npm run db:seed
npm run dev
```

Open http://localhost:3000 → **Quick demo (SW11 4QR)** or sign up with your postcode.

## Features

### Live data (free public APIs)
| Source | Data |
|--------|------|
| postcodes.io | Geocoding, admin areas |
| planning.data.gov.uk | Planning applications (750m) |
| data.police.uk | Crime & ASB (750m) |
| Land Registry UK HPI | Area prices & trends |
| Land Registry Price Paid | Sale history |
| Environment Agency | Flood warnings |
| GIAS / Ofsted (seeded DB) | Nearby schools & ratings |
| Council tax | Estimated band (+ optional Homedata VOA) |

### Database (Prisma + SQLite/Postgres)
- **Users** — persisted signup with postcode verification
- **Community posts** — moderated, stored in DB
- **Alerts** — synced from live data, persisted per user
- **Subscriptions** — Stripe webhook → premium tier
- **Schools** — GIAS seed + `scripts/sync-schools.ts` for full England sync
- **Council tax cache** — Homedata or estimated bands

### Email alerts (Resend)
- Welcome email on signup
- Alert digest cron: `POST /api/cron/alerts` with `Authorization: Bearer $CRON_SECRET`
- User preferences at `/alerts` (planning, price, crime, flood toggles)

### Optional integrations
| Env var | Service |
|---------|---------|
| `HOMEDATA_API_KEY` | Verified council tax bands (VOA) |
| `EPC_API_EMAIL` + `EPC_API_KEY` | Live EPC certificates |
| `RESEND_API_KEY` | Email delivery |
| `STRIPE_*` | Premium billing |
| `CLERK_*` | Production auth |
| `OPENAI_API_KEY` | AI moderation |

## Production Postgres

```bash
docker compose up -d postgres
```

Update `prisma/schema.prisma` provider to `postgresql` and set:
```
DATABASE_URL="postgresql://plotpulse:plotpulse@localhost:5432/plotpulse"
```

Then `npm run db:migrate && npm run db:seed`.

## Document storage (`/documents`)

Upload property documents — PlotPulse detects the type and creates reminders automatically:

| Document type | Reminders created |
|---------------|-------------------|
| Insurance | 30 & 7 days before renewal |
| EPC | 60 & 30 days before expiry (10-year validity) |
| Gas safety (CP12) | 30 & 7 days before annual check |
| Utility contracts | 14 & 3 days before renewal |
| Mortgage | 60 & 30 days before rate review |

Free plan: 5 documents · Premium: unlimited. Reminders due within 30 days also appear in `/alerts`.

## API routes

| Route | Description |
|-------|-------------|
| `GET /api/property?postcode=` | Aggregated live intelligence + alert sync |
| `GET /api/alerts` | User's persisted alerts |
| `PATCH /api/alerts/preferences` | Email/alert toggles |
| `POST /api/cron/alerts` | Send email digests (cron) |
| `POST /api/community/posts` | Create moderated post |
| `POST /api/auth/session` | Signup (DB + welcome email) |
| `POST /api/documents` | Upload document (multipart form) |
| `GET /api/documents/[id]` | Download document |
| `GET /api/reminders` | List auto-generated to-dos |
| `POST /api/cron/reminders` | Email document reminder digest |

## Local area model

| Tier | Definition | Used for |
|------|------------|----------|
| Immediate | 500m | Neighbour planning |
| **Neighbourhood** | **750m + sector cap** | Feed, alerts, community |
| District | Outward postcode | Price trends |

## Scripts

```bash
npm run db:seed          # Seed schools + demo user
npx tsx scripts/sync-schools.ts  # Full GIAS sync (when accessible)
curl -X POST http://localhost:3000/api/cron/alerts -H "Authorization: Bearer $CRON_SECRET"
```

## Revenue model

Premium subscriptions · mortgage/conveyancing referrals · insurance commission · tradesperson ads · estate agent leads
