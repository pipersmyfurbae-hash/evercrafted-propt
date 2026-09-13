# Evercrafted Blueprint Studio — Vercel Static Build

This package is intentionally a zero-build static Vercel app with serverless API routes.

## Deploy to Vercel
Deploy THIS folder as the project root. At the root you should see:
- index.html
- app.js
- styles.css
- vercel.json
- api/

Do not deploy a parent folder that merely contains this folder.

## Environment variables
COMETAPI_KEY=...
COMETAPI_MODEL=gpt-5.6-sol
COMETAPI_REASONING_EFFORT=high
KREA_API_TOKEN=...
KREA_MODEL_ENDPOINT=https://api.krea.ai/generate/image/krea/krea-2/medium
KREA_MOODBOARD_ID=
KREA_MOODBOARD_STRENGTH=0.20
COMPOSITION_STUDIO_URL=/app/apps/studio

## Routes
- /
- /weather-studio
- /api/weather
- /api/generate
- /api/krea-render
