// LaunchLens API proxy
//
// This tiny server holds your real API key and forwards requests from
// the React app to Google's Gemini API. The key never touches the browser.
//
// Run with: npm run dev:server   (or `npm run dev` to run both)

import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const GEMINI_MODEL = "gemini-2.5-flash";

app.post("/api/claude", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "Missing GEMINI_API_KEY. Copy .env.example to .env and add a free key from https://aistudio.google.com/apikey",
    });
  }

  const { system, messages } = req.body || {};
  if (!messages) {
    return res.status(400).json({ error: "Request body must include 'messages'." });
  }

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  try {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + GEMINI_MODEL + ":generateContent?key=" + apiKey;
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        system_instruction: system ? { parts: [{ text: system }] } : undefined,
        contents: contents,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);
      return res.status(response.status).json({ error: (data && data.error && data.error.message) || "Gemini request failed" });
    }

    const parts = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [];
    const text = parts.map(function (p) { return p.text; }).join("\n");

    res.json({ content: [{ type: "text", text: text }] });
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, keyConfigured: Boolean(process.env.GEMINI_API_KEY) });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("LaunchLens API proxy running at http://localhost:" + PORT);
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not set - AI features will fail until you add it to .env");
  }
});
