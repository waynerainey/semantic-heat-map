# Semantic Heat Map
### The Career Cantina · by Wayne Rainey

A diagnostic tool that shows how AI-mediated hiring systems read your LinkedIn profile. Built on the DCR›O Framework.

**Live:** https://thecareercantina.com/semantic-heat-map  
**Author:** [Wayne Rainey](https://linkedin.com/in/wrainey)  
**Framework:** DCR›O — Discovery › Categorization › Ranking › Output

---

## Project Structure

```
semantic-heat-map/
  src/
    main.jsx              # React entry point
    App.jsx               # Full application (946 lines)
  netlify/
    functions/
      claude.js           # Serverless proxy — keeps API key server-side
  index.html              # Entry point with full JSON-LD schema
  vite.config.js          # Build config
  netlify.toml            # Netlify build + function config
  package.json
  .env.example            # Required environment variable
  .gitignore
```

---

## Deploy via Claude Code → GitHub → Netlify

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "feat: Semantic Heat Map v1.0.0"
gh repo create semantic-heat-map --public --push
```

### Step 2: Connect to Netlify
1. Log into [app.netlify.com](https://app.netlify.com)
2. **Add new site** → **Import from Git** → select this repo
3. Build settings are pre-configured in `netlify.toml` — no changes needed
4. Click **Deploy site**

### Step 3: Set the API Key
1. In Netlify: **Site → Environment variables → Add a variable**
2. Key: `ANTHROPIC_API_KEY`
3. Value: your Anthropic API key from [console.anthropic.com](https://console.anthropic.com/settings/keys)
4. **Trigger a redeploy** after setting the variable

### Step 4: Set custom domain (optional)
Point your subdomain at Netlify via your DNS provider.

---

## Local Development

```bash
npm install
npm run dev
```

For local dev with the Netlify function, use the Netlify CLI:
```bash
npm install -g netlify-cli
netlify dev
```

Create a `.env` file from `.env.example` with your API key for local function testing.

---

## How the API Key Works

The browser **never** sees your API key. Here's the flow:

```
Browser → /.netlify/functions/claude → Anthropic API
                 ↑
         reads ANTHROPIC_API_KEY
         from Netlify environment
```

The `netlify/functions/claude.js` function acts as a secure proxy. Your key lives only in Netlify's environment variables — not in the code, not in git, not visible in network requests from the browser's perspective.

---

## Version History

| Version | Date | Notes |
|---------|------|-------|
| v1.0.0 | 2026-05-06 | Initial release |
| v1.0.1 | 2026-05-06 | Scoring calibration — recency weighting, transition penalty, score anchors |
| v1.0.2 | 2026-05-06 | UI legibility — tab bar contrast, gray text, GOOD TO KNOW copy fix |
| v1.0.3 | 2026-05-07 | Mobile banner fix, See how it works demo mode |

---

## IP Notice

The DCR›O Framework, Semantic Signal Audit, and all related methodologies are original intellectual property of Wayne Rainey / The Career Cantina. All rights reserved.
