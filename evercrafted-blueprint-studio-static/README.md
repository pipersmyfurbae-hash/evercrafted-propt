# Evercrafted Blueprint Studio

Next.js App Router MVP for the Evercrafted weather-driven blueprint system.

## Included
- Canonical approved Evercrafted weather layout
- Deterministic clock/radius SVG renderer
- JSON-first blueprint contract
- Columbus weather intake
- CometAPI server-side generation
- Fall/Winter/Christmas + study filters
- Lock, edit placements, duplicate, save versions
- Local archive MVP
- Export JSON and standalone HTML
- Print/PDF
- Hooks for Krea render and Composition Studio handoff

## Run
1. Copy `.env.example` to `.env.local`
2. Add `COMETAPI_KEY`
3. Optionally change `COMETAPI_MODEL`
4. `npm install`
5. `npm run dev`

## Deploy
Add `COMETAPI_KEY` and `COMETAPI_MODEL` in Vercel project environment variables, then deploy.

## Next persistence step
Replace browser localStorage archive with Postgres/Supabase/Vercel Postgres and persist WeatherDay, Blueprint, Placement, and BlueprintVersion entities.
