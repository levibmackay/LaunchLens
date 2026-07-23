# LaunchLens

LaunchLens is a startup idea validation workspace. You describe a startup idea and it uses AI (Google's Gemini) to generate a structured validation analysis — SWOT, market sizing, competitors, risks, MVP scope, pricing, and personas — then gives you a workspace (Kanban tasks, a validation checklist, customer interview logs, notes, and an AI mentor chat) to work the idea from research through launch.

It's a single-page React app (all data lives in browser state, nothing is persisted to a database) backed by a small Express proxy that keeps the Gemini API key server-side.

## Features

- **AI idea analysis** — submit a name, description, target customer, problem, and revenue model; get back a summary, SWOT, TAM/SAM/SOM estimates, competitor list, risks, a suggested MVP, pricing recommendation, target personas, and open questions. Analyses can be regenerated at any time.
- **Dashboard** — overview of all ideas with a validation-score ring, per-idea stats, AI recommendations, and a competitor watchlist.
- **Market research** view built from the AI analysis (TAM/SAM/SOM, competitors).
- **Customer discovery** — log interview questions and notes per idea.
- **Tasks** — a Kanban board (Ideas / Research / Building / Testing / Launch) per idea.
- **Validation checklist** — track standard validation milestones (customer interviews, MVP, landing page, waitlist, pricing test, first paying customer).
- **AI mentor** — freeform chat with the AI, scoped to the current idea.
- **Progress and analytics** views summarizing task, checklist, and interview activity, with charts (Recharts).
- **Settings** — theme (light/dark) and profile.
- Demo email/password and "Continue with Google" auth screens — no real credentials are checked or stored.

## Tech stack

- **Frontend**: React 18 + Vite, [lucide-react](https://lucide.dev/) icons, [Recharts](https://recharts.org/) for charts. No router or state library — a single `App.jsx` drives the whole UI with React state.
- **Backend**: a minimal Express server (`server.js`) that proxies chat requests to the Gemini API so the API key never reaches the browser.
- **AI provider**: Google Gemini (`gemini-2.5-flash` via the Generative Language API).

## Project structure

```
launchlens_v2/
├── server.js          # Express proxy: holds GEMINI_API_KEY, forwards chat requests to Gemini
├── vite.config.js      # Dev server on :5173, proxies /api to the Express server on :3001
├── index.html
└── src/
    ├── main.jsx        # React entry point
    └── App.jsx         # Entire application: theming, auth screen, dashboard, idea workspace, all views
```

There is no router, no global state library, and no database — `App.jsx` holds all UI and state (ideas, tasks, checklist items, interview notes, chat history) in React `useState`.

## Environment variables

Set these in `launchlens_v2/.env` (not committed):

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes | Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey). Without it, `/api/claude` returns a 500 and AI features fail. |
| `PORT` | No (defaults to 3001) | Port the Express proxy listens on. |

## Setup

The app lives in `launchlens_v2/`.

1. Install dependencies:
   ```bash
   cd launchlens_v2
   npm install
   ```
2. Create a `.env` file in `launchlens_v2/` with:
   ```
   GEMINI_API_KEY=
   PORT=3001
   ```
   Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).
3. Start the dev servers:
   ```bash
   npm run dev
   ```
   This runs Vite (frontend, `http://localhost:5173`) and the Express proxy (`http://localhost:3001`) concurrently. Vite proxies `/api` requests to the Express server in dev.
4. Open `http://localhost:5173`.

## Usage

Sign in with any email/password (or "Continue with Google") — auth is a demo flow, no account is actually created. From the dashboard, create a new idea to get an AI-generated validation analysis, then use the sidebar to move through market research, customer discovery, tasks, the validation checklist, the AI mentor, progress, notes, and analytics for that idea.

Data is kept in memory only; refreshing the page resets it.

## Scripts

Run from `launchlens_v2/`:

- `npm run dev` — run frontend and backend together
- `npm run dev:client` — Vite dev server only
- `npm run dev:server` — Express proxy only
- `npm run build` — production build of the frontend
- `npm run preview` — preview the production build

## Author

Levi B Mackay ([@levibmackay](https://github.com/levibmackay))

_Last reviewed: 2026-07-20 19:33 MDT_

---
_Last updated: July 22, 2026_

---

Maintained by [Levi Mackay](https://github.com/levibmackay)

**Last updated:** 2026-07-23
