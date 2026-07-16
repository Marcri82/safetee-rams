# CLAUDE.md

Guidance for AI assistants working in this repository.

## What this is

**SAFETEE · RAMS-Generator** — an AI-assisted generator for **RAMS** (Risk
Assessment & Method Statement) documents for construction sites, styled in the
SAFETEE brand. A user fills in a form (company, site, trade, work description,
and ten site-variable sliders); the app calls the Claude API three times and
renders a print-ready RAMS document with a hazard/risk table, method statement,
PPE, responsibilities, emergency organisation, and signature blocks.

It is a single-page React app deployed on **Vercel** and embedded via `<iframe>`
into the Webflow site at `safetee.eu/Tools/rams`.

The product UI and all documentation/comments are in **German**; the app itself
is bilingual (DE/EN toggle). The legal framework referenced is German OSH law
(ArbSchG, BetrSichV, DGUV, TRBS, STOP-Prinzip).

## Architecture

```
Browser (React SPA)  ──POST /api/claude──▶  Vercel Serverless Function  ──▶  api.anthropic.com
  src/App.jsx                                api/claude.js (holds the key)
```

The **critical design point**: the Anthropic API key is never exposed to the
browser. The frontend calls the same-origin `/api/claude` proxy; only that
serverless function (running on Vercel) reads `ANTHROPIC_API_KEY` from the
environment and forwards the request to Anthropic. See `README.md` for the full
deployment rationale (in German).

### Key files

| Path | Role |
|------|------|
| `index.html` | Vite entry. Loads `/src/main.jsx` and Tailwind from CDN. |
| `src/main.jsx` | React root — mounts `<App/>` into `#root`. |
| `src/App.jsx` | **The entire app** (~575 lines): form, prompts, API calls, JSON parsing, and the rendered RAMS document. |
| `api/claude.js` | Vercel serverless proxy that holds the API key and forwards to Anthropic. |
| `webflow-embed-rams.html` | Code-embed snippet for the Webflow page — an `<iframe>` with auto-height via `postMessage`. |
| `vite.config.js` | Vite + `@vitejs/plugin-react`. |
| `vercel.json` | Vercel config: framework `vite`, build `vite build`, output `dist`. |
| `package.json` | Deps (React 18) and scripts. |
| `README.md` | Step-by-step deployment/embedding guide (German). |

### ⚠️ Duplicate/stale files at the repo root

There are **unused duplicates** of source files at the repository root:

- `App.jsx` (root) — byte-identical to `src/App.jsx`
- `main.jsx` (root) — byte-identical to `src/main.jsx`
- `claude.js` (root) — an **older, diverged** copy of `api/claude.js` (it lacks
  the origin-check block that `api/claude.js` has)

**The build ignores all three.** `index.html` imports `/src/main.jsx`, and
Vercel deploys `api/claude.js` as the function. Only edit files under `src/` and
`api/`. When you change `src/App.jsx` or `api/claude.js`, do **not** also update
the root copies — ideally they should be deleted, but confirm with the user
before removing them since they predate the `src/`+`api/` layout.

## Development workflow

```bash
npm install       # install deps
npm run dev       # Vite dev server (frontend only)
npm run build     # production build → dist/
npm run preview   # preview the built dist/
```

There is **no test suite, no linter, and no formatter** configured. There is no
`.gitignore` and no `node_modules` committed. Verify changes by running
`npm run build` and by loading the app in `npm run dev`.

### Local limitation: the `/api/claude` proxy

`npm run dev` serves only the frontend — it does **not** run the Vercel
serverless function, so clicking "RAMS erstellen" will 404 on `/api/claude`
locally. To exercise the full flow locally you need the Vercel CLI
(`vercel dev`) with `ANTHROPIC_API_KEY` set in the environment, or test against
a deployed preview. Frontend/layout work can be done with `npm run dev` alone.

## How generation works (`src/App.jsx`)

`generate()` runs **three sequential Claude calls** via `callClaude()`:

1. **Shell** (`shellPrompt`) → one JSON object: scope, work steps, PPE,
   responsibilities, emergency org, overall assessment, notes.
2. **Hazards part 1** (`hazPrompt(1, "")`) → JSON array of the 4 most important
   hazards.
3. **Hazards part 2** (`hazPrompt(2, exclude)`) → 3 further, different hazards,
   told to exclude those already returned. Failures here are swallowed (empty
   array) so a partial result still renders.

Because the model returns text that must be JSON, there is a **defensive loose
JSON parser** (`extractAndParse` / `parseObjLoose` / `parseArrLoose`) that:
strips code fences, finds the first `{`/`[`, walks the string tracking string
state, and repairs truncated/trailing-comma JSON. Preserve this robustness if
you touch prompts or parsing — the prompts explicitly instruct the model to
avoid line breaks inside values and to return JSON only, and the parser is the
safety net.

### Conventions inside `src/App.jsx`

- **JSON keys stay German** even in EN mode (`taetigkeit`, `gefaehrdung`,
  `massnahmen`, `restW`, `restS`, `arbeitsschritte`, `geltungsbereich`, etc.).
  The `langInstr()` prompt explicitly tells the model to keep German keys and
  translate only the values. Do not rename these keys.
- **i18n**: all UI strings live in the `L` object (`L.de` / `L.en`), keyed
  identically. Add new strings to both languages.
- **Branding**: colors are centralized in the `C` constant. Reuse them.
- **Risk model**: `R = W × S` (likelihood × severity, each 1–5). `riskMeta()`
  maps a score to a label/color band (≤4 low, ≤9 medium, ≤14 high, else very
  high). Site sliders (`SLIDERS`, 0–100) feed the prompt context.
- **Model id**: both the frontend (`callClaude`) and the proxy default use
  `claude-sonnet-4-6`. Keep them in sync if you change it.
- **Styling** is inline styles + Tailwind utility classes (Tailwind via CDN, so
  no build step / config for it). `data-noprint` hides elements from print, and
  `PRINT_CSS` controls the A4 print/PDF layout ("Als PDF speichern" → `window.print()`).
- **Iframe height**: a `ResizeObserver` posts `{type:"sfty-rams-height", height}`
  to the parent window so the Webflow embed can size the iframe. Keep this
  message contract in sync with `webflow-embed-rams.html`.

## The proxy (`api/claude.js`)

- POST only; returns 405 otherwise.
- Reads `ANTHROPIC_API_KEY` from env (500 if missing).
- Forwards `model` / `max_tokens` / `messages` / `system` to
  `https://api.anthropic.com/v1/messages` with `anthropic-version: 2023-06-01`.
- Has a **weak, opt-in origin check**: the `ALLOWED` array is empty by default
  (open). Populate it with the deployment URL(s) to restrict callers. As
  documented in `README.md`, this is not real abuse protection (headers are
  spoofable); the proxy is publicly reachable. If asked to harden it, the README
  suggests rate-limiting (Vercel KV / Upstash), a captcha, or a spend alarm.

## Deployment

Vercel auto-builds on push (framework Vite, output `dist`). The **only required
config** is the `ANTHROPIC_API_KEY` environment variable in the Vercel project;
env-var changes require a redeploy to take effect. The full walkthrough
(GitHub → Vercel → env var → Webflow embed) is in `README.md`.

## Git conventions

- Work on the branch assigned for the task; do not push to `main` without
  explicit permission.
- History so far uses short, plain commit messages (e.g. "Update App.jsx").
  Prefer clear, descriptive messages for new work.
- Do not create pull requests unless explicitly asked.
