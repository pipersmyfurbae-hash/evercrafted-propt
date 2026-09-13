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
- Live Krea 2 Medium render integration with low creativity
- Cross-app Composition Studio handoff payload + receiver patch

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


## Render Image
`Render Image` POSTs the selected blueprint to `/api/krea-render`. The server compiles a concise placement-aware prompt and calls Krea 2 Medium with `creativity: low`. Set `KREA_API_TOKEN`. Optional moodboard env vars are supported.

## Composition Studio
`Open in Composition Studio` writes the compatibility localStorage keys and sends a base64url handoff in the URL fragment. Set `COMPOSITION_STUDIO_URL` to the deployed Evercrafted `/app/apps/studio` URL. Apply `COMPOSITION_STUDIO_RECEIVER_PATCH.md` to the Everfracted Design Studio receiver.
