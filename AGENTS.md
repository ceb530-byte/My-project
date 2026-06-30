<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

PlotPulse is a single full-stack **Next.js 16 + React 19 + Prisma (SQLite)** app (frontend pages + API routes in one project, npm). Standard commands live in `README.md` and `package.json` scripts (`dev`, `build`, `lint`, `db:*`). There is **no automated test suite** — verify changes manually via the dev server and API routes.

Non-obvious setup/run caveats:

- **Two env files are needed.** Next.js loads `.env.local` (and `.env`), but the **Prisma CLI only reads `.env`**. The startup script keeps the Prisma client generated, but DB commands (`prisma migrate`/`db push`/`db seed`/`studio`) require a `.env` containing `DATABASE_URL`. If `.env`/`.env.local` are missing, recreate both from `.env.example` (`cp .env.example .env && cp .env.example .env.local`).
- **Seeding:** `npm run db:seed` runs `tsx prisma/seed.ts` directly and does **not** load env files, so it fails with "Environment variable not found: DATABASE_URL". Use `npx prisma db seed` instead (it loads `.env`), or export `DATABASE_URL` first.
- **Database:** defaults to SQLite at `file:./prisma/dev.db` — no DB server required. Apply migrations with `npx prisma migrate deploy` and seed with `npx prisma db seed`. Postgres (`docker compose up -d postgres`) is optional/production-only and requires switching the `schema.prisma` provider to `postgresql`.
- **Secrets are all optional.** Clerk, Stripe, Resend, OpenAI, EPC, and Homedata integrations degrade gracefully (dev session auth, mock checkout, rule-based moderation, estimated council tax) so the app runs fully with zero secrets. Live UK public data APIs (postcodes.io, police.uk, planning.data.gov.uk, Land Registry, Environment Agency) need outbound internet but no keys.
- **Hello-world / smoke check:** `npm run dev` → open `http://localhost:3000`, click "Quick demo (SW11 4QR)" (top-right) to load a full property intelligence dashboard; or `curl "http://localhost:3000/api/property?postcode=SW11+4QR"`.
