# LaunchLens

Validate startup ideas before you spend months building them.

## Getting started

1. npm install
2. cp .env.example .env, then add your free Gemini key from https://aistudio.google.com/apikey
3. npm run dev
4. Open http://localhost:5173

Two processes run together: Vite (frontend, port 5173) and Express (backend proxy, port 3001) which holds your API key and forwards requests to Gemini.
