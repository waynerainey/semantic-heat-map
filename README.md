# Semantic Heat Map

**See your LinkedIn profile the way an AI hiring system reads it.**

The Career Cantina · by [Wayne Rainey](https://linkedin.com/in/wrainey)

`React 18` · `Vite 5` · `Netlify Functions` · `Anthropic API` · `JSON-LD structured data`

**Live tool:** https://thecareercantina.com/semantic-heat-map
**Framework:** DCR›O (Discovery › Categorization › Ranking › Output)

---

## What it does

Paste in a LinkedIn profile, pick a target role, and the tool renders a heat map of how a semantic hiring system would read that profile against the role. Phrases that pull the profile toward the role light up HOT. Phrases that pull it away read COLD. The result is a visual diagnostic of signal versus noise: not "is this a good profile" in the abstract, but "is this profile legible to the machine that decides whether you surface in a search."

It runs on the DCR›O Framework, which models the pipeline a candidate actually moves through inside an AI-mediated system: Discovery (can you be found), Categorization (are you filed under the right role), Ranking (where you land in the stack), and Output (what the system hands the recruiter).

## Why it exists

I am a talent acquisition consultant, not a software engineer by title. Thirty years in recruiting and HR, and most of that conversation right now is about AI changing how people get hired. Explaining how a semantic system reads a profile is hard in the abstract and obvious the moment you can watch it happen. So I built the thing that lets you watch it happen. The tool is the argument.

## How it's built

The architecture is deliberately small and the one part that matters is the key handling.

```
Browser (React SPA)
   │  POST profile + target role
   ▼
/.netlify/functions/claude   ← serverless proxy, holds ANTHROPIC_API_KEY
   │
   ▼
Anthropic API
```

The browser never sees the API key. A Netlify serverless function (`netlify/functions/claude.js`) sits between the front end and the Anthropic API and injects the key from a server-side environment variable. The key lives only in Netlify's environment: not in the bundle, not in git, not visible in any network request the browser makes. That is the correct pattern for calling a paid LLM API from a public single-page app, and it is the detail most client-side demos get wrong.

The rest of the stack: a React 18 front end built with Vite 5, a single-component application that handles the scoring, signal highlighting, and heat-map rendering, and a fully populated JSON-LD `SoftwareApplication` schema plus Open Graph and Twitter card metadata in `index.html` so the tool is itself discoverable by the systems it analyzes.

## Project structure

```
semantic-heat-map/
  src/
    main.jsx              React entry point
    App.jsx               Full application (scoring, signal highlighting, heat-map UI)
  netlify/
    functions/
      claude.js           Serverless proxy. Keeps the API key server-side.
  index.html              Entry point with full JSON-LD schema and social meta
  vite.config.js          Build config
  netlify.toml            Netlify build and function config
  package.json
  .env.example            Required environment variable template
  .gitignore
```

## Run it locally

```bash
npm install
npm run dev
```

To exercise the serverless function locally, use the Netlify CLI:

```bash
npm install -g netlify-cli
netlify dev
```

Copy `.env.example` to `.env` and add your Anthropic API key for local function testing. The real `.env` is gitignored and never committed.

## Deploy (GitHub to Netlify)

```bash
gh repo create semantic-heat-map --public --push
```

Then in Netlify: Add new site, Import from Git, select the repo. Build settings are pre-configured in `netlify.toml`, so no changes are needed. After the first deploy, set the API key under Site, Environment variables: add `ANTHROPIC_API_KEY` with your key from [console.anthropic.com](https://console.anthropic.com/settings/keys), then trigger a redeploy. Point a custom subdomain at Netlify through your DNS provider if you want a branded URL.

## Version history

| Version | Date | Notes |
|---------|------|-------|
| v1.0.0 | 2026-05-06 | Initial release |
| v1.0.1 | 2026-05-06 | Scoring calibration: recency weighting, transition penalty, score anchors |
| v1.0.2 | 2026-05-06 | UI legibility: tab bar contrast, gray text, copy fixes |
| v1.0.3 | 2026-05-07 | Mobile banner fix, "see how it works" demo mode |
| v1.0.4 | 2026-05-07 | Signal interpretation layer: column insights, 0% explanation, welcome vs noise framing |
| v1.0.5 | 2026-05-07 | Temperature context for secondary and tertiary roles, tab bar legibility, pulsing unlocked indicator |

## IP notice

The DCR›O Framework, the Semantic Signal Audit, and all related methodologies are original intellectual property of Wayne Rainey and The Career Cantina. All rights reserved. The source in this repository is published to show the work; the frameworks it implements remain proprietary.
