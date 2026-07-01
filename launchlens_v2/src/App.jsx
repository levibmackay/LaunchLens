import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  LayoutDashboard, PlusCircle, TrendingUp, Users, Kanban, CheckSquare,
  MessageSquare, BarChart3, FileText, Settings as SettingsIcon, Search,
  Sun, Moon, LogOut, ChevronRight, Sparkles, Target, AlertTriangle,
  DollarSign, Rocket, Send, Plus, X, Tag, Trash2, Download, Bell,
  User as UserIcon, Mail, Lock, ArrowRight, Loader2, Building2,
  TrendingDown, Shield, Lightbulb, HelpCircle, Calendar, Clock,
  MoreVertical, Edit3, Bold, Italic, List, GripVertical
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

/* ============================================================
   LaunchLens — Startup Idea Validation Platform
   Single-file production-style demo. All data lives in React
   state (no backend). AI features call the Anthropic API
   directly via fetch to /v1/messages, using the current idea
   as context.
   ============================================================ */

/* ---------- Theme tokens (Apple-inspired) ---------- */
const THEMES = {
  light: {
    bg: "#FFFFFF",
    bgSecondary: "#F5F5F7",
    surface: "#FFFFFF",
    surfaceRaised: "#FFFFFF",
    border: "#E5E5EA",
    borderLight: "#F0F0F2",
    text: "#1D1D1F",
    textSecondary: "#6E6E73",
    textTertiary: "#AEAEB2",
    accent: "#0071E3",
    accentHover: "#0077ED",
    accentBg: "#EAF2FE",
    success: "#1E9E58",
    successBg: "#E7F7ED",
    warning: "#C77700",
    warningBg: "#FFF3E0",
    danger: "#D93025",
    dangerBg: "#FDECEA",
    purple: "#7A5AF8",
    purpleBg: "#F1EDFE",
    shadow: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
  },
  dark: {
    bg: "#000000",
    bgSecondary: "#161618",
    surface: "#1C1C1E",
    surfaceRaised: "#232326",
    border: "#313134",
    borderLight: "#2A2A2D",
    text: "#F5F5F7",
    textSecondary: "#98989D",
    textTertiary: "#636366",
    accent: "#0A84FF",
    accentHover: "#3396FF",
    accentBg: "#0C2038",
    success: "#32D371",
    successBg: "#0E2818",
    warning: "#FFA419",
    warningBg: "#2E2108",
    danger: "#FF453A",
    dangerBg: "#301111",
    purple: "#9B87F5",
    purpleBg: "#221C3A",
    shadow: "0 1px 2px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.4)",
  },
};

const FONT = `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, "Segoe UI", Roboto, sans-serif`;

/* ---------- Claude API helper ----------
   Calls our own backend at /api/claude, which holds the real Anthropic
   API key server-side (see server.js) and forwards the request. The
   browser never sees the key. In dev, Vite proxies /api to the local
   Express server (see vite.config.js). */
async function askClaude({ system, messages, json = false }) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, messages, max_tokens: 1000 }),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || data?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  const text = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  if (json) {
    const clean = text.replace(/```json|```/g, "").trim();
    try {
      return JSON.parse(clean);
    } catch (e) {
      const match = clean.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      throw e;
    }
  }
  return text;
}

/* ---------- Mock seed data ---------- */
const SEED_IDEA = {
  id: "idea-1",
  name: "PantryPal",
  description:
    "An app that scans your fridge and pantry using your phone camera, tracks expiration dates, and suggests recipes to use up ingredients before they go bad.",
  targetCustomer: "Busy urban professionals aged 25-40 who cook at home 3+ times a week",
  problem:
    "People throw away food they forgot they had, wasting money and contributing to household food waste.",
  revenueModel: "Freemium with a $4.99/mo subscription for recipe AI and expiry alerts",
  stage: "Research",
  createdAt: "2026-05-02",
  validationScore: 62,
  analysis: {
    summary:
      "PantryPal targets a well-documented pain point (household food waste) with a computer-vision-first approach that differentiates it from manual pantry-tracking apps. Early traction will depend on scan accuracy and low-friction onboarding.",
    swot: {
      strengths: ["Clear, relatable problem", "Sticky daily-use habit loop", "Defensible CV/ML moat if accuracy is high"],
      weaknesses: ["Computer vision accuracy is hard at MVP stage", "Manual entry fallback needed early on"],
      opportunities: ["Partnerships with grocery delivery apps", "B2B angle for meal-kit companies", "Growing food-waste awareness"],
      threats: ["Well-funded incumbents (Fridgely, NoWaste)", "Low willingness to pay for utility apps", "Users abandon habit-forming apps quickly"],
    },
    tam: "$4.2B (global food-waste & kitchen-management software)",
    sam: "$620M (English-speaking urban households with smartphones)",
    som: "$8-12M (achievable 3-year share via app-store + content marketing)",
    competitors: [
      { name: "NoWaste", desc: "Manual pantry tracker, no computer vision, loyal niche audience" },
      { name: "Fridgely", desc: "Barcode-scan focused, weaker recipe engine" },
      { name: "Kitche", desc: "UK-based, receipt-scan onboarding, freemium" },
    ],
    risks: [
      "Scan accuracy below 80% could kill retention in week one",
      "Users may not maintain manual updates if scanning fails",
      "Grocery delivery partners could build this in-house",
    ],
    mvp: "A manual-entry pantry list with expiry-date reminders and 3 recipe suggestions/week, camera scanning added post-validation.",
    pricing: "Free tier: manual tracking + weekly digest. Pro ($4.99/mo): camera scan, unlimited recipes, expiry push alerts.",
    personas: [
      { name: "Busy Ben, 29", desc: "Software engineer, cooks 4x/week, hates throwing away produce, wants low-effort tracking." },
      { name: "Organized Olivia, 34", desc: "Meal-preps on Sundays, already uses 2-3 productivity apps, will pay for time savings." },
    ],
    questions: [
      "What scan accuracy is 'good enough' for early users to trust the app?",
      "Will users tolerate manual entry as a fallback, or does that kill adoption?",
      "Is the willingness to pay closer to $2 or $8/month?",
    ],
  },
};

const SEED_TASKS = [
  { id: "t1", ideaId: "idea-1", title: "Interview 5 target users", column: "Research" },
  { id: "t2", ideaId: "idea-1", title: "Sketch onboarding flow", column: "Ideas" },
  { id: "t3", ideaId: "idea-1", title: "Build manual-entry MVP", column: "Building" },
  { id: "t4", ideaId: "idea-1", title: "Landing page copy draft", column: "Ideas" },
  { id: "t5", ideaId: "idea-1", title: "Test $4.99 price point", column: "Testing" },
];

const SEED_NOTES = [
  {
    id: "n1",
    ideaId: "idea-1",
    title: "Interview takeaways — Week 1",
    content:
      "Most people said they check their fridge 'when something smells off.' Nobody currently uses an app for this. Price sensitivity is real below $5/mo.",
    tags: ["interviews", "pricing"],
    date: "2026-06-10",
  },
];

const SEED_INTERVIEWS = [
  {
    id: "i1",
    ideaId: "idea-1",
    question: "How do you currently keep track of what's in your fridge?",
    notes: "Mostly memory + occasional sticky notes. No one uses an app today.",
    date: "2026-06-08",
  },
  {
    id: "i2",
    ideaId: "idea-1",
    question: "Would you pay for an app that reminds you before food expires?",
    notes: "3 of 5 said yes, but only if under $5/mo and 'actually accurate.'",
    date: "2026-06-09",
  },
];

const CHECKLIST_ITEMS = [
  "Talked to 10 customers",
  "Built MVP",
  "Landing page",
  "Waitlist",
  "Pricing tested",
  "First paying customer",
];

const STAGES = ["Idea", "Research", "Building", "Testing", "Launched"];
const COLUMNS = ["Ideas", "Research", "Building", "Testing", "Launch"];

/* ============================================================
   Small reusable primitives
   ============================================================ */

function useTheme(mode) {
  return THEMES[mode];
}

function Card({ t, children, style, onClick, hoverable }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 16,
        padding: 20,
        transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
        cursor: onClick ? "pointer" : "default",
        transform: hoverable && hover ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hoverable && hover ? t.shadow : "none",
        borderColor: hoverable && hover ? t.textTertiary : t.border,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Button({ t, children, onClick, variant = "primary", size = "md", icon: Icon, disabled, style, type = "button" }) {
  const [hover, setHover] = useState(false);
  const sizes = {
    sm: { padding: "6px 12px", fontSize: 13 },
    md: { padding: "10px 18px", fontSize: 14 },
    lg: { padding: "13px 24px", fontSize: 15 },
  };
  const variants = {
    primary: {
      background: disabled ? t.textTertiary : hover ? t.accentHover : t.accent,
      color: "#FFFFFF",
      border: "none",
    },
    secondary: {
      background: hover ? t.bgSecondary : "transparent",
      color: t.text,
      border: `1px solid ${t.border}`,
    },
    ghost: {
      background: hover ? t.bgSecondary : "transparent",
      color: t.textSecondary,
      border: "none",
    },
    danger: {
      background: hover ? "#B8261C" : t.danger,
      color: "#FFFFFF",
      border: "none",
    },
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        borderRadius: 980,
        fontWeight: 590,
        fontFamily: FONT,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.15s ease, transform 0.1s ease",
        transform: hover && !disabled ? "scale(1.015)" : "scale(1)",
        whiteSpace: "nowrap",
        ...sizes[size],
        ...variants[variant],
        ...style,
      }}
    >
      {Icon && <Icon size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
}

function Input({ t, label, ...props }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 590, color: t.textSecondary }}>{label}</label>
      )}
      <input
        {...props}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          fontFamily: FONT,
          fontSize: 15,
          padding: "11px 14px",
          borderRadius: 12,
          border: `1px solid ${focus ? t.accent : t.border}`,
          background: t.bgSecondary,
          color: t.text,
          outline: "none",
          boxShadow: focus ? `0 0 0 3px ${t.accentBg}` : "none",
          transition: "all 0.15s ease",
          width: "100%",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function TextArea({ t, label, rows = 3, ...props }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 590, color: t.textSecondary }}>{label}</label>
      )}
      <textarea
        {...props}
        rows={rows}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          fontFamily: FONT,
          fontSize: 15,
          padding: "11px 14px",
          borderRadius: 12,
          border: `1px solid ${focus ? t.accent : t.border}`,
          background: t.bgSecondary,
          color: t.text,
          outline: "none",
          boxShadow: focus ? `0 0 0 3px ${t.accentBg}` : "none",
          transition: "all 0.15s ease",
          width: "100%",
          resize: "vertical",
          boxSizing: "border-box",
          lineHeight: 1.5,
        }}
      />
    </div>
  );
}

function Select({ t, label, children, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 590, color: t.textSecondary }}>{label}</label>
      )}
      <select
        {...props}
        style={{
          fontFamily: FONT,
          fontSize: 15,
          padding: "11px 14px",
          borderRadius: 12,
          border: `1px solid ${t.border}`,
          background: t.bgSecondary,
          color: t.text,
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {children}
      </select>
    </div>
  );
}

function Badge({ t, children, color = "accent" }) {
  const map = {
    accent: { bg: t.accentBg, fg: t.accent },
    success: { bg: t.successBg, fg: t.success },
    warning: { bg: t.warningBg, fg: t.warning },
    danger: { bg: t.dangerBg, fg: t.danger },
    purple: { bg: t.purpleBg, fg: t.purple },
    gray: { bg: t.bgSecondary, fg: t.textSecondary },
  };
  const c = map[color] || map.accent;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 980,
        fontSize: 12,
        fontWeight: 600,
        background: c.bg,
        color: c.fg,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

/* Signature element: circular validation score ring */
function ScoreRing({ t, score = 0, size = 120, stroke = 10, label = true }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(timeout);
  }, [score]);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;
  const color = score >= 70 ? t.success : score >= 40 ? t.warning : t.danger;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={t.borderLight} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.65,0,0.35,1)" }}
        />
      </svg>
      {label && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: size * 0.26, fontWeight: 700, color: t.text, lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: size * 0.09, color: t.textSecondary, marginTop: 4 }}>/ 100</div>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ t, title, subtitle, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: t.text, margin: 0, letterSpacing: -0.5 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 15, color: t.textSecondary, margin: "6px 0 0" }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function EmptyState({ t, icon: Icon, title, body, action }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "64px 24px",
        border: `1px dashed ${t.border}`,
        borderRadius: 20,
        background: t.bgSecondary,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: t.accentBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
        }}
      >
        <Icon size={26} color={t.accent} />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 650, color: t.text, margin: "0 0 6px" }}>{title}</h3>
      <p style={{ fontSize: 14, color: t.textSecondary, margin: "0 0 20px", maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>{body}</p>
      {action}
    </div>
  );
}

/* ============================================================
   Auth screen
   ============================================================ */

function AuthScreen({ t, onLogin, dark, toggleDark }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLogin({ name: name || email.split("@")[0] || "Founder", email: email || "founder@launchlens.app" });
      setLoading(false);
    }, 600);
  };

  const googleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      onLogin({ name: "Jordan Rivera", email: "jordan@gmail.com" });
      setLoading(false);
    }, 600);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.bg,
        fontFamily: FONT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        position: "relative",
      }}
    >
      <button
        onClick={toggleDark}
        style={{
          position: "absolute",
          top: 24,
          right: 24,
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: `1px solid ${t.border}`,
          background: t.surface,
          color: t.text,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${t.accent}, ${t.purple})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={20} color="#fff" />
          </div>
          <span style={{ fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: -0.5 }}>LaunchLens</span>
        </div>

        <Card t={t} style={{ padding: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: t.text, margin: "0 0 4px", textAlign: "center" }}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p style={{ fontSize: 14, color: t.textSecondary, margin: "0 0 24px", textAlign: "center" }}>
            {mode === "login" ? "Sign in to keep validating your idea." : "Start validating your startup idea today."}
          </p>

          <Button t={t} variant="secondary" size="lg" style={{ width: "100%", justifyContent: "center", marginBottom: 12 }} onClick={googleLogin} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.78-2.4 3.63v3h3.89c2.28-2.1 3.56-5.2 3.56-8.82z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.89-3.02c-1.08.72-2.45 1.15-4.04 1.15-3.1 0-5.73-2.1-6.67-4.92H1.3v3.1C3.27 21.3 7.31 24 12 24z" />
              <path fill="#FBBC05" d="M5.33 14.31A7.2 7.2 0 0 1 4.96 12c0-.8.14-1.58.37-2.31v-3.1H1.3A11.96 11.96 0 0 0 0 12c0 1.93.46 3.76 1.3 5.41z" />
              <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.59 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.27 2.7 1.3 6.59l4.03 3.1c.94-2.82 3.57-4.92 6.67-4.92z" />
            </svg>
            Continue with Google
          </Button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
            <div style={{ flex: 1, height: 1, background: t.border }} />
            <span style={{ fontSize: 12, color: t.textTertiary }}>or</span>
            <div style={{ flex: 1, height: 1, background: t.border }} />
          </div>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "signup" && (
              <Input t={t} label="Full name" placeholder="Jane Founder" value={name} onChange={(e) => setName(e.target.value)} />
            )}
            <Input t={t} label="Email" type="email" placeholder="you@startup.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input t={t} label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button t={t} type="submit" size="lg" style={{ width: "100%", justifyContent: "center", marginTop: 6 }} disabled={loading}>
              {loading ? <Loader2 size={16} className="spin" /> : mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p style={{ fontSize: 13, color: t.textSecondary, textAlign: "center", marginTop: 20 }}>
            {mode === "login" ? "New to LaunchLens?" : "Already have an account?"}{" "}
            <span
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              style={{ color: t.accent, cursor: "pointer", fontWeight: 600 }}
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </span>
          </p>
        </Card>
        <p style={{ fontSize: 12, color: t.textTertiary, textAlign: "center", marginTop: 16 }}>
          Demo auth — no real credentials are stored or verified.
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   Sidebar & Topbar
   ============================================================ */

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "create", label: "New idea", icon: PlusCircle },
  { id: "market", label: "Market research", icon: TrendingUp },
  { id: "discovery", label: "Customer discovery", icon: Users },
  { id: "tasks", label: "Tasks", icon: Kanban },
  { id: "checklist", label: "Validation checklist", icon: CheckSquare },
  { id: "mentor", label: "AI mentor", icon: MessageSquare },
  { id: "progress", label: "Progress", icon: Target },
  { id: "notes", label: "Notes", icon: FileText },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

function Sidebar({ t, view, setView, user, onLogout, ideas, activeIdeaId, setActiveIdeaId, collapsed }) {
  return (
    <div
      style={{
        width: collapsed ? 76 : 240,
        flexShrink: 0,
        background: t.bgSecondary,
        borderRight: `1px solid ${t.border}`,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        transition: "width 0.2s ease",
      }}
    >
      <div style={{ padding: "20px 20px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: `linear-gradient(135deg, ${t.accent}, ${t.purple})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Sparkles size={16} color="#fff" />
        </div>
        {!collapsed && <span style={{ fontSize: 17, fontWeight: 700, color: t.text, letterSpacing: -0.3 }}>LaunchLens</span>}
      </div>

      {!collapsed && ideas.length > 0 && (
        <div style={{ padding: "0 16px 12px" }}>
          <select
            value={activeIdeaId || ""}
            onChange={(e) => setActiveIdeaId(e.target.value)}
            style={{
              width: "100%",
              fontFamily: FONT,
              fontSize: 13,
              fontWeight: 600,
              padding: "9px 10px",
              borderRadius: 10,
              border: `1px solid ${t.border}`,
              background: t.surface,
              color: t.text,
            }}
          >
            {ideas.map((i) => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </select>
        </div>
      )}

      <nav style={{ flex: 1, padding: "4px 12px", overflowY: "auto" }}>
        {NAV_ITEMS.map((item) => {
          const active = view === item.id;
          return (
            <NavButton key={item.id} t={t} item={item} active={active} collapsed={collapsed} onClick={() => setView(item.id)} />
          );
        })}
      </nav>

      <div style={{ padding: 16, borderTop: `1px solid ${t.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: t.accentBg,
              color: t.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            {(user?.name || "U").slice(0, 1).toUpperCase()}
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name}
              </div>
              <div style={{ fontSize: 11, color: t.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.email}
              </div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={onLogout}
              title="Log out"
              style={{ border: "none", background: "transparent", color: t.textSecondary, cursor: "pointer", padding: 6 }}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function NavButton({ t, item, active, collapsed, onClick }) {
  const [hover, setHover] = useState(false);
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={collapsed ? item.label : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        width: "100%",
        padding: "9px 12px",
        marginBottom: 2,
        borderRadius: 10,
        border: "none",
        background: active ? t.accentBg : hover ? t.borderLight : "transparent",
        color: active ? t.accent : t.text,
        fontFamily: FONT,
        fontSize: 13.5,
        fontWeight: active ? 650 : 500,
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.12s ease",
      }}
    >
      <Icon size={17} style={{ flexShrink: 0 }} />
      {!collapsed && <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>}
    </button>
  );
}

function TopBar({ t, dark, toggleDark, title, collapsed, setCollapsed }) {
  return (
    <div
      style={{
        height: 60,
        borderBottom: `1px solid ${t.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        background: `${t.bg}E6`,
        backdropFilter: "blur(12px)",
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{ border: "none", background: "transparent", color: t.textSecondary, cursor: "pointer", padding: 6, display: "flex" }}
        >
          <ChevronRight size={18} style={{ transform: collapsed ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.2s" }} />
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: t.bgSecondary,
            borderRadius: 10,
            padding: "7px 12px",
            width: 260,
          }}
        >
          <Search size={15} color={t.textTertiary} />
          <input
            placeholder="Search ideas, notes, tasks…"
            style={{ border: "none", outline: "none", background: "transparent", fontFamily: FONT, fontSize: 13, color: t.text, width: "100%" }}
          />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          style={{
            width: 36, height: 36, borderRadius: "50%", border: `1px solid ${t.border}`,
            background: t.surface, color: t.textSecondary, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}
        >
          <Bell size={16} />
        </button>
        <button
          onClick={toggleDark}
          style={{
            width: 36, height: 36, borderRadius: "50%", border: `1px solid ${t.border}`,
            background: t.surface, color: t.textSecondary, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   Dashboard
   ============================================================ */

function Dashboard({ t, ideas, tasks, interviews, setView, setActiveIdeaId, activeIdea }) {
  const totalTasks = tasks.filter((tk) => tk.ideaId === activeIdea?.id).length;
  const doneTasks = tasks.filter((tk) => tk.ideaId === activeIdea?.id && tk.column === "Launch").length;
  const interviewCount = interviews.filter((i) => i.ideaId === activeIdea?.id).length;

  return (
    <div>
      <SectionHeader
        t={t}
        title="My startup ideas"
        subtitle="Track validation across all the ideas you're exploring."
        action={<Button t={t} icon={PlusCircle} onClick={() => setView("create")}>New idea</Button>}
      />

      {ideas.length === 0 ? (
        <EmptyState
          t={t}
          icon={Lightbulb}
          title="No ideas yet"
          body="Add your first startup idea and LaunchLens will generate a full validation analysis for it."
          action={<Button t={t} icon={PlusCircle} onClick={() => setView("create")}>Create your first idea</Button>}
        />
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 32 }}>
            {ideas.map((idea) => (
              <Card
                key={idea.id}
                t={t}
                hoverable
                onClick={() => { setActiveIdeaId(idea.id); setView("ideaDetail"); }}
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 650, color: t.text, margin: "0 0 4px" }}>{idea.name}</h3>
                    <Badge t={t} color="gray">{idea.stage}</Badge>
                  </div>
                  <ScoreRing t={t} score={idea.validationScore} size={56} stroke={6} />
                </div>
                <p style={{ fontSize: 13, color: t.textSecondary, margin: 0, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {idea.description}
                </p>
              </Card>
            ))}
          </div>

          {activeIdea && (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 650, color: t.text, marginBottom: 16 }}>
                Focus: {activeIdea.name}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
                <StatCard t={t} icon={Target} label="Validation score" value={`${activeIdea.validationScore}/100`} color="accent" />
                <StatCard t={t} icon={Users} label="Interviews logged" value={interviewCount} color="purple" />
                <StatCard t={t} icon={Kanban} label="Tasks in progress" value={totalTasks} color="warning" />
                <StatCard t={t} icon={Rocket} label="Tasks launched" value={doneTasks} color="success" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
                <Card t={t}>
                  <h3 style={{ fontSize: 15, fontWeight: 650, color: t.text, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
                    <Sparkles size={16} color={t.accent} /> AI recommendations
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {(activeIdea.analysis?.questions || []).slice(0, 3).map((q, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", background: t.bgSecondary, borderRadius: 10 }}>
                        <HelpCircle size={15} color={t.accent} style={{ flexShrink: 0, marginTop: 1 }} />
                        <span style={{ fontSize: 13.5, color: t.text, lineHeight: 1.4 }}>{q}</span>
                      </div>
                    ))}
                  </div>
                  <Button t={t} variant="ghost" size="sm" style={{ marginTop: 12 }} onClick={() => setView("mentor")} icon={MessageSquare}>
                    Ask the AI mentor
                  </Button>
                </Card>

                <Card t={t}>
                  <h3 style={{ fontSize: 15, fontWeight: 650, color: t.text, margin: "0 0 12px" }}>Top competitor watch</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {(activeIdea.analysis?.competitors || []).slice(0, 3).map((c, i) => (
                      <div key={i}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: t.text }}>{c.name}</div>
                        <div style={{ fontSize: 12.5, color: t.textSecondary }}>{c.desc}</div>
                      </div>
                    ))}
                  </div>
                  <Button t={t} variant="ghost" size="sm" style={{ marginTop: 12 }} onClick={() => setView("market")} icon={TrendingUp}>
                    View market research
                  </Button>
                </Card>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ t, icon: Icon, label, value, color }) {
  const colors = { accent: t.accent, purple: t.purple, warning: t.warning, success: t.success };
  const bgs = { accent: t.accentBg, purple: t.purpleBg, warning: t.warningBg, success: t.successBg };
  return (
    <Card t={t} style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 11, background: bgs[color], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={18} color={colors[color]} />
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: t.text, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 12.5, color: t.textSecondary, marginTop: 2 }}>{label}</div>
      </div>
    </Card>
  );
}

/* ============================================================
   Create Idea + AI Analysis
   ============================================================ */

function CreateIdea({ t, onCreated }) {
  const [form, setForm] = useState({
    name: "", description: "", targetCustomer: "", problem: "", revenueModel: "", stage: "Idea",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const system = `You are a sharp, pragmatic startup analyst. Given a startup idea, respond ONLY with strict JSON (no prose, no markdown fences) matching exactly this shape:
{
  "summary": string,
  "swot": {"strengths": string[], "weaknesses": string[], "opportunities": string[], "threats": string[]},
  "tam": string, "sam": string, "som": string,
  "competitors": [{"name": string, "desc": string}],
  "risks": string[],
  "mvp": string,
  "pricing": string,
  "personas": [{"name": string, "desc": string}],
  "questions": string[],
  "validationScore": number
}
Keep each string concise (1-2 sentences). validationScore is 0-100 reflecting how validated/de-risked the idea currently sounds based on the info given, not how good the idea is. Give 3-4 items per array field.`;
      const userMsg = `Startup name: ${form.name}
Description: ${form.description}
Target customer: ${form.targetCustomer}
Problem being solved: ${form.problem}
Revenue model: ${form.revenueModel}
Current stage: ${form.stage}`;

      const analysis = await askClaude({
        system,
        messages: [{ role: "user", content: userMsg }],
        json: true,
      });

      onCreated({
        id: `idea-${Date.now()}`,
        ...form,
        createdAt: new Date().toISOString().slice(0, 10),
        validationScore: analysis.validationScore ?? 40,
        analysis,
      });
    } catch (err) {
      setError("Couldn't generate analysis right now. You can still save the idea and try again from its detail page.");
      onCreated({
        id: `idea-${Date.now()}`,
        ...form,
        createdAt: new Date().toISOString().slice(0, 10),
        validationScore: 30,
        analysis: null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 680 }}>
      <SectionHeader t={t} title="Create a new idea" subtitle="Tell LaunchLens about your startup — AI will generate a full validation analysis." />
      <Card t={t}>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Input t={t} label="Startup name" required placeholder="e.g. PantryPal" value={form.name} onChange={(e) => update("name", e.target.value)} />
          <TextArea t={t} label="Description" required rows={3} placeholder="What does your product do, in a couple sentences?" value={form.description} onChange={(e) => update("description", e.target.value)} />
          <Input t={t} label="Target customer" required placeholder="Who is this for?" value={form.targetCustomer} onChange={(e) => update("targetCustomer", e.target.value)} />
          <TextArea t={t} label="Problem being solved" required rows={2} placeholder="What pain point does this address?" value={form.problem} onChange={(e) => update("problem", e.target.value)} />
          <Input t={t} label="Revenue model" required placeholder="How will this make money?" value={form.revenueModel} onChange={(e) => update("revenueModel", e.target.value)} />
          <Select t={t} label="Current stage" value={form.stage} onChange={(e) => update("stage", e.target.value)}>
            {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>

          {error && (
            <div style={{ fontSize: 13, color: t.danger, background: t.dangerBg, padding: "10px 14px", borderRadius: 10 }}>{error}</div>
          )}

          <Button t={t} type="submit" size="lg" icon={loading ? undefined : Sparkles} disabled={loading} style={{ justifyContent: "center" }}>
            {loading ? (<><Loader2 size={16} className="spin" /> Analyzing your idea…</>) : "Generate AI analysis"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function IdeaDetail({ t, idea, updateIdea, setView }) {
  const [regenerating, setRegenerating] = useState(false);

  const regenerate = async () => {
    setRegenerating(true);
    try {
      const system = `You are a sharp, pragmatic startup analyst. Respond ONLY with strict JSON matching:
{"summary": string, "swot": {"strengths": string[], "weaknesses": string[], "opportunities": string[], "threats": string[]}, "tam": string, "sam": string, "som": string, "competitors": [{"name": string, "desc": string}], "risks": string[], "mvp": string, "pricing": string, "personas": [{"name": string, "desc": string}], "questions": string[], "validationScore": number}`;
      const userMsg = `Startup: ${idea.name}\nDescription: ${idea.description}\nTarget customer: ${idea.targetCustomer}\nProblem: ${idea.problem}\nRevenue model: ${idea.revenueModel}\nStage: ${idea.stage}`;
      const analysis = await askClaude({ system, messages: [{ role: "user", content: userMsg }], json: true });
      updateIdea(idea.id, { analysis, validationScore: analysis.validationScore ?? idea.validationScore });
    } catch (e) {
      // keep existing analysis on failure
    } finally {
      setRegenerating(false);
    }
  };

  if (!idea) return null;
  const a = idea.analysis;

  return (
    <div>
      <SectionHeader
        t={t}
        title={idea.name}
        subtitle={idea.description}
        action={
          <Button t={t} variant="secondary" icon={regenerating ? undefined : Sparkles} onClick={regenerate} disabled={regenerating}>
            {regenerating ? <><Loader2 size={14} className="spin" /> Regenerating…</> : "Regenerate analysis"}
          </Button>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24, marginBottom: 24 }}>
        <Card t={t} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <ScoreRing t={t} score={idea.validationScore} size={130} stroke={11} />
          <span style={{ fontSize: 13, fontWeight: 600, color: t.textSecondary }}>Validation score</span>
        </Card>
        <Card t={t}>
          <h3 style={{ fontSize: 15, fontWeight: 650, color: t.text, margin: "0 0 8px" }}>Business summary</h3>
          <p style={{ fontSize: 14, color: t.textSecondary, lineHeight: 1.6, margin: 0 }}>{a?.summary || "No analysis yet."}</p>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <Badge t={t} color="gray">{idea.stage}</Badge>
            <Badge t={t} color="accent">{idea.targetCustomer}</Badge>
          </div>
        </Card>
      </div>

      {!a ? (
        <EmptyState t={t} icon={Sparkles} title="No analysis yet" body="Generate an AI analysis to see SWOT, TAM/SAM/SOM, competitors, and more." action={<Button t={t} onClick={regenerate} icon={Sparkles}>Generate analysis</Button>} />
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 16 }}>
            <SwotCard t={t} title="Strengths" items={a.swot?.strengths} color="success" icon={Shield} />
            <SwotCard t={t} title="Weaknesses" items={a.swot?.weaknesses} color="danger" icon={TrendingDown} />
            <SwotCard t={t} title="Opportunities" items={a.swot?.opportunities} color="accent" icon={Lightbulb} />
            <SwotCard t={t} title="Threats" items={a.swot?.threats} color="warning" icon={AlertTriangle} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
            <Card t={t}><MetricBlock t={t} label="TAM" value={a.tam} /></Card>
            <Card t={t}><MetricBlock t={t} label="SAM" value={a.sam} /></Card>
            <Card t={t}><MetricBlock t={t} label="SOM" value={a.som} /></Card>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <Card t={t}>
              <h3 style={{ fontSize: 15, fontWeight: 650, color: t.text, margin: "0 0 12px" }}>Competitors</h3>
              {(a.competitors || []).map((c, i) => (
                <div key={i} style={{ padding: "10px 0", borderBottom: i < a.competitors.length - 1 ? `1px solid ${t.borderLight}` : "none" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: t.text }}>{c.name}</div>
                  <div style={{ fontSize: 12.5, color: t.textSecondary, marginTop: 2 }}>{c.desc}</div>
                </div>
              ))}
            </Card>
            <Card t={t}>
              <h3 style={{ fontSize: 15, fontWeight: 650, color: t.text, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
                <AlertTriangle size={15} color={t.warning} /> Risks
              </h3>
              {(a.risks || []).map((r, i) => (
                <div key={i} style={{ fontSize: 13.5, color: t.text, padding: "6px 0", display: "flex", gap: 8 }}>
                  <span style={{ color: t.warning }}>•</span> {r}
                </div>
              ))}
            </Card>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <Card t={t}>
              <h3 style={{ fontSize: 15, fontWeight: 650, color: t.text, margin: "0 0 8px", display: "flex", alignItems: "center", gap: 6 }}>
                <Rocket size={15} color={t.accent} /> Suggested MVP
              </h3>
              <p style={{ fontSize: 13.5, color: t.textSecondary, lineHeight: 1.6, margin: 0 }}>{a.mvp}</p>
            </Card>
            <Card t={t}>
              <h3 style={{ fontSize: 15, fontWeight: 650, color: t.text, margin: "0 0 8px", display: "flex", alignItems: "center", gap: 6 }}>
                <DollarSign size={15} color={t.success} /> Pricing recommendation
              </h3>
              <p style={{ fontSize: 13.5, color: t.textSecondary, lineHeight: 1.6, margin: 0 }}>{a.pricing}</p>
            </Card>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Card t={t}>
              <h3 style={{ fontSize: 15, fontWeight: 650, color: t.text, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
                <Users size={15} color={t.purple} /> Customer personas
              </h3>
              {(a.personas || []).map((p, i) => (
                <div key={i} style={{ padding: "8px 0" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: t.text }}>{p.name}</div>
                  <div style={{ fontSize: 12.5, color: t.textSecondary }}>{p.desc}</div>
                </div>
              ))}
            </Card>
            <Card t={t}>
              <h3 style={{ fontSize: 15, fontWeight: 650, color: t.text, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
                <HelpCircle size={15} color={t.accent} /> Questions to answer
              </h3>
              {(a.questions || []).map((q, i) => (
                <div key={i} style={{ fontSize: 13.5, color: t.text, padding: "6px 0", display: "flex", gap: 8 }}>
                  <span style={{ color: t.accent }}>{i + 1}.</span> {q}
                </div>
              ))}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function SwotCard({ t, title, items = [], color, icon: Icon }) {
  const map = { success: t.success, danger: t.danger, accent: t.accent, warning: t.warning };
  const bgMap = { success: t.successBg, danger: t.dangerBg, accent: t.accentBg, warning: t.warningBg };
  return (
    <Card t={t} style={{ background: bgMap[color] }}>
      <h3 style={{ fontSize: 14, fontWeight: 650, color: map[color], margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6 }}>
        <Icon size={15} /> {title}
      </h3>
      {items.map((it, i) => (
        <div key={i} style={{ fontSize: 13, color: t.text, padding: "4px 0" }}>• {it}</div>
      ))}
    </Card>
  );
}

function MetricBlock({ t, label, value }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: t.textSecondary, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
      <div style={{ fontSize: 17, color: t.text, fontWeight: 650, marginTop: 6 }}>{value}</div>
    </div>
  );
}

/* ============================================================
   Market Research
   ============================================================ */

function MarketResearch({ t, idea }) {
  const a = idea?.analysis;
  if (!idea) return <EmptyState t={t} icon={TrendingUp} title="No idea selected" body="Create or select an idea to see market research." />;
  return (
    <div>
      <SectionHeader t={t} title="Market research" subtitle={`Competitive landscape and trends for ${idea.name}`} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card t={t}>
          <h3 style={{ fontSize: 15, fontWeight: 650, color: t.text, margin: "0 0 12px" }}>Competitors</h3>
          {(a?.competitors || []).map((c, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: `1px solid ${t.borderLight}` }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: t.text }}>{c.name}</div>
                <div style={{ fontSize: 12.5, color: t.textSecondary, marginTop: 2 }}>{c.desc}</div>
              </div>
              <Badge t={t} color="gray">Direct</Badge>
            </div>
          ))}
          {!a && <p style={{ fontSize: 13, color: t.textSecondary }}>Generate an AI analysis on this idea to populate competitors.</p>}
        </Card>
        <Card t={t}>
          <h3 style={{ fontSize: 15, fontWeight: 650, color: t.text, margin: "0 0 12px" }}>Similar startups</h3>
          <p style={{ fontSize: 13.5, color: t.textSecondary, lineHeight: 1.6 }}>
            Adjacent products solving related problems, useful for positioning and pricing benchmarks.
          </p>
          {(a?.competitors || []).slice(0, 2).map((c, i) => (
            <div key={i} style={{ fontSize: 13, color: t.text, padding: "6px 0" }}>• {c.name} — {c.desc.split(",")[0]}</div>
          ))}
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card t={t}>
          <h3 style={{ fontSize: 15, fontWeight: 650, color: t.text, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
            <TrendingUp size={15} color={t.success} /> Opportunities
          </h3>
          {(a?.swot?.opportunities || []).map((o, i) => (
            <div key={i} style={{ fontSize: 13.5, color: t.text, padding: "6px 0" }}>• {o}</div>
          ))}
        </Card>
        <Card t={t}>
          <h3 style={{ fontSize: 15, fontWeight: 650, color: t.text, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={15} color={t.danger} /> Threats
          </h3>
          {(a?.swot?.threats || []).map((th, i) => (
            <div key={i} style={{ fontSize: 13.5, color: t.text, padding: "6px 0" }}>• {th}</div>
          ))}
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   Customer Discovery
   ============================================================ */

function CustomerDiscovery({ t, idea, interviews, setInterviews }) {
  const [question, setQuestion] = useState("");
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const ideaInterviews = interviews.filter((i) => i.ideaId === idea?.id);

  const addInterview = () => {
    if (!question.trim()) return;
    setInterviews((prev) => [
      { id: `iv-${Date.now()}`, ideaId: idea.id, question, notes, date: new Date().toISOString().slice(0, 10) },
      ...prev,
    ]);
    setQuestion("");
    setNotes("");
  };

  const summarize = async () => {
    if (ideaInterviews.length === 0) return;
    setLoading(true);
    try {
      const transcript = ideaInterviews.map((i) => `Q: ${i.question}\nNotes: ${i.notes}`).join("\n\n");
      const text = await askClaude({
        system: "You are a user-research analyst. Summarize customer interview notes into 3-5 concise bullet points identifying patterns, sentiment, and recurring objections. Plain text bullets starting with '- ', no headers.",
        messages: [{ role: "user", content: `Startup: ${idea.name}\n\nInterviews:\n${transcript}` }],
      });
      setSummary(text);
    } catch (e) {
      setSummary("Couldn't generate a summary right now — try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  if (!idea) return <EmptyState t={t} icon={Users} title="No idea selected" body="Create or select an idea first." />;

  return (
    <div>
      <SectionHeader t={t} title="Customer discovery" subtitle={`Interview questions and notes for ${idea.name}`} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 20 }}>
        <Card t={t}>
          <h3 style={{ fontSize: 15, fontWeight: 650, color: t.text, margin: "0 0 14px" }}>Log an interview</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input t={t} label="Question asked" placeholder="e.g. How do you solve this today?" value={question} onChange={(e) => setQuestion(e.target.value)} />
            <TextArea t={t} label="Notes / response" rows={4} placeholder="What did they say?" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Button t={t} icon={Plus} onClick={addInterview} style={{ justifyContent: "center" }}>Save interview</Button>
          </div>

          <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${t.borderLight}` }}>
            <Button t={t} variant="secondary" icon={loading ? undefined : Sparkles} onClick={summarize} disabled={loading || ideaInterviews.length === 0} style={{ width: "100%", justifyContent: "center" }}>
              {loading ? <><Loader2 size={14} className="spin" /> Summarizing…</> : "AI: summarize patterns"}
            </Button>
            {summary && (
              <div style={{ marginTop: 12, fontSize: 13, color: t.text, background: t.accentBg, padding: 14, borderRadius: 12, lineHeight: 1.6, whiteSpace: "pre-line" }}>
                {summary}
              </div>
            )}
          </div>
        </Card>

        <Card t={t}>
          <h3 style={{ fontSize: 15, fontWeight: 650, color: t.text, margin: "0 0 14px" }}>
            Interview log ({ideaInterviews.length})
          </h3>
          {ideaInterviews.length === 0 ? (
            <p style={{ fontSize: 13, color: t.textSecondary }}>No interviews logged yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 520, overflowY: "auto" }}>
              {ideaInterviews.map((iv) => (
                <div key={iv.id} style={{ padding: 14, background: t.bgSecondary, borderRadius: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: t.text }}>{iv.question}</span>
                    <span style={{ fontSize: 11, color: t.textTertiary, flexShrink: 0, marginLeft: 8 }}>{iv.date}</span>
                  </div>
                  {iv.notes && <p style={{ fontSize: 12.5, color: t.textSecondary, margin: "6px 0 0", lineHeight: 1.5 }}>{iv.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   Tasks / Kanban
   ============================================================ */

function Tasks({ t, idea, tasks, setTasks }) {
  const [dragTaskId, setDragTaskId] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  const ideaTasks = tasks.filter((tk) => tk.ideaId === idea?.id);

  const addTask = () => {
    if (!newTitle.trim() || !idea) return;
    setTasks((prev) => [...prev, { id: `task-${Date.now()}`, ideaId: idea.id, title: newTitle, column: "Ideas" }]);
    setNewTitle("");
  };

  const moveTask = (id, column) => {
    setTasks((prev) => prev.map((tk) => (tk.id === id ? { ...tk, column } : tk)));
  };

  const removeTask = (id) => setTasks((prev) => prev.filter((tk) => tk.id !== id));

  if (!idea) return <EmptyState t={t} icon={Kanban} title="No idea selected" body="Create or select an idea first." />;

  return (
    <div>
      <SectionHeader
        t={t}
        title="Tasks"
        subtitle={`Kanban board for ${idea.name}`}
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <Input t={t} placeholder="Quick add task…" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} style={{ width: 200 }} />
            <Button t={t} icon={Plus} onClick={addTask}>Add</Button>
          </div>
        }
      />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${COLUMNS.length}, 1fr)`, gap: 14, alignItems: "start" }}>
        {COLUMNS.map((col) => (
          <div
            key={col}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { if (dragTaskId) moveTask(dragTaskId, col); setDragTaskId(null); }}
            style={{
              background: t.bgSecondary,
              borderRadius: 14,
              padding: 12,
              minHeight: 320,
              border: `1px solid ${t.border}`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "0 4px" }}>
              <span style={{ fontSize: 12.5, fontWeight: 650, color: t.textSecondary, textTransform: "uppercase", letterSpacing: 0.4 }}>{col}</span>
              <Badge t={t} color="gray">{ideaTasks.filter((tk) => tk.column === col).length}</Badge>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ideaTasks.filter((tk) => tk.column === col).map((tk) => (
                <div
                  key={tk.id}
                  draggable
                  onDragStart={() => setDragTaskId(tk.id)}
                  style={{
                    background: t.surface,
                    border: `1px solid ${t.border}`,
                    borderRadius: 10,
                    padding: "10px 12px",
                    fontSize: 13,
                    color: t.text,
                    cursor: "grab",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: t.shadow,
                  }}
                >
                  <GripVertical size={13} color={t.textTertiary} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{tk.title}</span>
                  <X size={13} color={t.textTertiary} style={{ cursor: "pointer", flexShrink: 0 }} onClick={() => removeTask(tk.id)} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Validation Checklist
   ============================================================ */

function Checklist({ t, idea, checklist, setChecklist }) {
  if (!idea) return <EmptyState t={t} icon={CheckSquare} title="No idea selected" body="Create or select an idea first." />;
  const state = checklist[idea.id] || {};
  const doneCount = CHECKLIST_ITEMS.filter((_, i) => state[i]).length;
  const pct = Math.round((doneCount / CHECKLIST_ITEMS.length) * 100);

  const toggle = (i) => {
    setChecklist((prev) => ({
      ...prev,
      [idea.id]: { ...prev[idea.id], [i]: !prev[idea.id]?.[i] },
    }));
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <SectionHeader t={t} title="Validation checklist" subtitle={`Key milestones before you build too much of ${idea.name}`} />
      <Card t={t} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{doneCount} of {CHECKLIST_ITEMS.length} complete</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: t.accent }}>{pct}%</span>
        </div>
        <div style={{ height: 8, borderRadius: 980, background: t.borderLight, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: t.accent, borderRadius: 980, transition: "width 0.4s ease" }} />
        </div>
      </Card>
      <Card t={t}>
        {CHECKLIST_ITEMS.map((item, i) => (
          <div
            key={i}
            onClick={() => toggle(i)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "13px 4px",
              borderBottom: i < CHECKLIST_ITEMS.length - 1 ? `1px solid ${t.borderLight}` : "none",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 7,
                border: `2px solid ${state[i] ? t.success : t.border}`,
                background: state[i] ? t.success : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.15s ease",
              }}
            >
              {state[i] && <CheckSquare size={13} color="#fff" strokeWidth={3} />}
            </div>
            <span style={{ fontSize: 14.5, color: state[i] ? t.textSecondary : t.text, textDecoration: state[i] ? "line-through" : "none" }}>
              {item}
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ============================================================
   AI Mentor
   ============================================================ */

function AIMentor({ t, idea, messages, setMessages }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);
    try {
      const system = idea
        ? `You are LaunchLens's AI startup mentor — direct, encouraging but honest, and practical. You have context on the founder's current idea:
Name: ${idea.name}
Description: ${idea.description}
Target customer: ${idea.targetCustomer}
Problem: ${idea.problem}
Revenue model: ${idea.revenueModel}
Stage: ${idea.stage}
Validation score: ${idea.validationScore}/100
Give specific, actionable advice grounded in this context. Keep responses concise (under 150 words) unless asked for depth.`
        : "You are LaunchLens's AI startup mentor. No idea is selected yet — encourage the founder to create one, but still answer general startup questions helpfully and concisely.";

      const reply = await askClaude({
        system,
        messages: history.map((m) => ({ role: m.role, content: m.content })),
      });
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: "I couldn't reach the AI service just now — mind trying again?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 140px)" }}>
      <SectionHeader t={t} title="AI mentor" subtitle={idea ? `Chatting with context on ${idea.name}` : "Ask any startup question"} />
      <Card t={t} style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {messages.length === 0 && (
            <div style={{ margin: "auto", textAlign: "center", color: t.textSecondary, maxWidth: 340 }}>
              <MessageSquare size={28} color={t.textTertiary} style={{ marginBottom: 10 }} />
              <p style={{ fontSize: 14 }}>Ask about pricing, positioning, MVP scope, or anything else about {idea ? idea.name : "your startup"}.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div
                style={{
                  maxWidth: "72%",
                  padding: "10px 15px",
                  borderRadius: 16,
                  fontSize: 14,
                  lineHeight: 1.55,
                  background: m.role === "user" ? t.accent : t.bgSecondary,
                  color: m.role === "user" ? "#fff" : t.text,
                  whiteSpace: "pre-line",
                }}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ padding: "10px 15px", borderRadius: 16, background: t.bgSecondary, color: t.textSecondary, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                <Loader2 size={14} className="spin" /> Thinking…
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div style={{ borderTop: `1px solid ${t.border}`, padding: 14, display: "flex", gap: 10 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask your AI mentor…"
            style={{
              flex: 1, fontFamily: FONT, fontSize: 14, padding: "11px 16px", borderRadius: 980,
              border: `1px solid ${t.border}`, background: t.bgSecondary, color: t.text, outline: "none",
            }}
          />
          <Button t={t} icon={Send} onClick={send} disabled={loading} style={{ borderRadius: "50%", padding: 12 }} />
        </div>
      </Card>
    </div>
  );
}

/* ============================================================
   Progress
   ============================================================ */

function Progress({ t, idea, tasks, checklist }) {
  if (!idea) return <EmptyState t={t} icon={Target} title="No idea selected" body="Create or select an idea first." />;
  const ideaTasks = tasks.filter((tk) => tk.ideaId === idea.id);
  const stageIndex = STAGES.indexOf(idea.stage);
  const checklistState = checklist[idea.id] || {};
  const checklistPct = Math.round((CHECKLIST_ITEMS.filter((_, i) => checklistState[i]).length / CHECKLIST_ITEMS.length) * 100);
  const taskPct = ideaTasks.length ? Math.round((ideaTasks.filter((t2) => t2.column === "Launch").length / ideaTasks.length) * 100) : 0;
  const overall = Math.round((idea.validationScore + checklistPct + taskPct) / 3);

  return (
    <div>
      <SectionHeader t={t} title="Progress" subtitle={`From idea to launch — ${idea.name}`} />
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24, marginBottom: 24 }}>
        <Card t={t} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <ScoreRing t={t} score={overall} size={130} stroke={11} />
          <span style={{ fontSize: 13, fontWeight: 600, color: t.textSecondary }}>Overall completion</span>
        </Card>
        <Card t={t}>
          <h3 style={{ fontSize: 15, fontWeight: 650, color: t.text, margin: "0 0 20px" }}>Journey timeline</h3>
          <div style={{ display: "flex", alignItems: "center" }}>
            {STAGES.map((s, i) => (
              <React.Fragment key={s}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 30, height: 30, borderRadius: "50%",
                      background: i <= stageIndex ? t.accent : t.bgSecondary,
                      border: `2px solid ${i <= stageIndex ? t.accent : t.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: i <= stageIndex ? "#fff" : t.textTertiary, fontSize: 12, fontWeight: 700,
                    }}
                  >
                    {i < stageIndex ? "✓" : i + 1}
                  </div>
                  <span style={{ fontSize: 11.5, color: i <= stageIndex ? t.text : t.textTertiary, fontWeight: i === stageIndex ? 650 : 500 }}>{s}</span>
                </div>
                {i < STAGES.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: i < stageIndex ? t.accent : t.border, margin: "0 4px 20px" }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <ProgressStat t={t} label="Validation score" value={idea.validationScore} />
        <ProgressStat t={t} label="Checklist complete" value={checklistPct} />
        <ProgressStat t={t} label="Tasks launched" value={taskPct} />
      </div>
    </div>
  );
}

function ProgressStat({ t, label, value }) {
  return (
    <Card t={t}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: t.textSecondary, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 13, color: t.text, fontWeight: 650 }}>{value}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 980, background: t.borderLight, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, background: t.accent, borderRadius: 980, transition: "width 0.6s ease" }} />
      </div>
    </Card>
  );
}

/* ============================================================
   Notes (simple rich text via contentEditable)
   ============================================================ */

function Notes({ t, idea, notes, setNotes }) {
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState("");
  const editorRef = useRef(null);

  const ideaNotes = notes.filter((n) => n.ideaId === idea?.id);
  const filtered = ideaNotes.filter((n) => (n.title + n.content).toLowerCase().includes(search.toLowerCase()));
  const active = notes.find((n) => n.id === activeId);

  const createNote = () => {
    if (!idea) return;
    const n = { id: `note-${Date.now()}`, ideaId: idea.id, title: "Untitled note", content: "", tags: [], date: new Date().toISOString().slice(0, 10) };
    setNotes((prev) => [n, ...prev]);
    setActiveId(n.id);
  };

  const updateNote = (patch) => setNotes((prev) => prev.map((n) => (n.id === activeId ? { ...n, ...patch } : n)));
  const deleteNote = (id) => { setNotes((prev) => prev.filter((n) => n.id !== id)); if (activeId === id) setActiveId(null); };

  const exec = (cmd) => { document.execCommand(cmd); editorRef.current?.focus(); };

  if (!idea) return <EmptyState t={t} icon={FileText} title="No idea selected" body="Create or select an idea first." />;

  return (
    <div>
      <SectionHeader t={t} title="Notes" subtitle={`Freeform notes for ${idea.name}`} action={<Button t={t} icon={Plus} onClick={createNote}>New note</Button>} />
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
        <div>
          <Input t={t} placeholder="Search notes…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: 12 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => setActiveId(n.id)}
                style={{
                  padding: "12px 14px", borderRadius: 12, cursor: "pointer",
                  background: activeId === n.id ? t.accentBg : t.surface,
                  border: `1px solid ${activeId === n.id ? t.accent : t.border}`,
                }}
              >
                <div style={{ fontSize: 13.5, fontWeight: 600, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</div>
                <div style={{ fontSize: 11.5, color: t.textSecondary, marginTop: 4 }}>{n.date}</div>
                {n.tags?.length > 0 && (
                  <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                    {n.tags.map((tag) => <Badge key={tag} t={t} color="gray">{tag}</Badge>)}
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && <p style={{ fontSize: 13, color: t.textSecondary }}>No notes found.</p>}
          </div>
        </div>

        <Card t={t}>
          {!active ? (
            <div style={{ textAlign: "center", color: t.textSecondary, padding: 60 }}>Select or create a note to start writing.</div>
          ) : (
            <>
              <input
                value={active.title}
                onChange={(e) => updateNote({ title: e.target.value })}
                style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, border: "none", outline: "none", background: "transparent", color: t.text, width: "100%", marginBottom: 12 }}
              />
              <div style={{ display: "flex", gap: 6, marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${t.borderLight}` }}>
                <button onClick={() => exec("bold")} style={iconBtnStyle(t)}><Bold size={14} /></button>
                <button onClick={() => exec("italic")} style={iconBtnStyle(t)}><Italic size={14} /></button>
                <button onClick={() => exec("insertUnorderedList")} style={iconBtnStyle(t)}><List size={14} /></button>
              </div>
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => updateNote({ content: e.currentTarget.innerHTML })}
                dangerouslySetInnerHTML={{ __html: active.content }}
                style={{ minHeight: 240, fontSize: 14.5, color: t.text, lineHeight: 1.7, outline: "none" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 16, borderTop: `1px solid ${t.borderLight}` }}>
                <TagEditor t={t} tags={active.tags || []} onChange={(tags) => updateNote({ tags })} />
                <Button t={t} variant="danger" size="sm" icon={Trash2} onClick={() => deleteNote(active.id)}>Delete</Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function iconBtnStyle(t) {
  return { border: `1px solid ${t.border}`, background: t.bgSecondary, color: t.text, borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };
}

function TagEditor({ t, tags, onChange }) {
  const [input, setInput] = useState("");
  const addTag = () => { if (input.trim()) { onChange([...tags, input.trim()]); setInput(""); } };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      <Tag size={13} color={t.textSecondary} />
      {tags.map((tag, i) => (
        <span key={i} style={{ fontSize: 11.5, background: t.bgSecondary, color: t.textSecondary, padding: "3px 8px", borderRadius: 980, display: "flex", alignItems: "center", gap: 4 }}>
          {tag}
          <X size={10} style={{ cursor: "pointer" }} onClick={() => onChange(tags.filter((_, ix) => ix !== i))} />
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && addTag()}
        placeholder="Add tag…"
        style={{ fontFamily: FONT, fontSize: 12, border: "none", outline: "none", background: "transparent", color: t.text, width: 70 }}
      />
    </div>
  );
}

/* ============================================================
   Analytics
   ============================================================ */

function Analytics({ t, idea, tasks, interviews, checklist }) {
  if (!idea) return <EmptyState t={t} icon={BarChart3} title="No idea selected" body="Create or select an idea first." />;

  const validationHistory = useMemo(() => {
    const base = Math.max(10, idea.validationScore - 40);
    return Array.from({ length: 6 }).map((_, i) => ({
      week: `Wk ${i + 1}`,
      score: Math.round(base + ((idea.validationScore - base) * (i + 1)) / 6),
    }));
  }, [idea.validationScore]);

  const ideaTasks = tasks.filter((tk) => tk.ideaId === idea.id);
  const taskByColumn = COLUMNS.map((c) => ({ name: c, count: ideaTasks.filter((tk) => tk.column === c).length }));

  const interviewCount = interviews.filter((i) => i.ideaId === idea.id).length;
  const weeklyProductivity = [
    { day: "Mon", tasks: 2 }, { day: "Tue", tasks: 4 }, { day: "Wed", tasks: 1 },
    { day: "Thu", tasks: 5 }, { day: "Fri", tasks: 3 }, { day: "Sat", tasks: 0 }, { day: "Sun", tasks: 2 },
  ];

  const checklistState = checklist[idea.id] || {};
  const checklistData = [
    { name: "Complete", value: CHECKLIST_ITEMS.filter((_, i) => checklistState[i]).length },
    { name: "Remaining", value: CHECKLIST_ITEMS.filter((_, i) => !checklistState[i]).length },
  ];
  const PIE_COLORS = [t.accent, t.borderLight];

  return (
    <div>
      <SectionHeader t={t} title="Analytics" subtitle={`Performance overview for ${idea.name}`} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card t={t}>
          <h3 style={{ fontSize: 14, fontWeight: 650, color: t.text, margin: "0 0 14px" }}>Validation progress</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={validationHistory}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={t.accent} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={t.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight} vertical={false} />
              <XAxis dataKey="week" stroke={t.textTertiary} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={t.textTertiary} fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, fontSize: 12 }} />
              <Area type="monotone" dataKey="score" stroke={t.accent} strokeWidth={2} fill="url(#scoreGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card t={t}>
          <h3 style={{ fontSize: 14, fontWeight: 650, color: t.text, margin: "0 0 14px" }}>Task completion by stage</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={taskByColumn}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight} vertical={false} />
              <XAxis dataKey="name" stroke={t.textTertiary} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke={t.textTertiary} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="count" fill={t.accent} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card t={t}>
          <h3 style={{ fontSize: 14, fontWeight: 650, color: t.text, margin: "0 0 14px" }}>Weekly productivity ({interviewCount} interviews total)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyProductivity}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight} vertical={false} />
              <XAxis dataKey="day" stroke={t.textTertiary} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={t.textTertiary} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, fontSize: 12 }} />
              <Line type="monotone" dataKey="tasks" stroke={t.purple} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card t={t}>
          <h3 style={{ fontSize: 14, fontWeight: 650, color: t.text, margin: "0 0 14px" }}>Checklist completion</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={checklistData} dataKey="value" innerRadius={50} outerRadius={78} paddingAngle={3}>
                {checklistData.map((entry, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   Settings
   ============================================================ */

function Settings({ t, user, setUser, dark, toggleDark, allData }) {
  const [notif, setNotif] = useState({ email: true, weekly: true, taskReminders: false });

  const exportData = () => {
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "launchlens-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <SectionHeader t={t} title="Settings" subtitle="Manage your account and preferences." />

      <Card t={t} style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 650, color: t.text, margin: "0 0 14px" }}>Profile</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input t={t} label="Full name" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
          <Input t={t} label="Email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} />
        </div>
      </Card>

      <Card t={t} style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 650, color: t.text, margin: "0 0 14px" }}>Notifications</h3>
        <ToggleRow t={t} label="Email updates" desc="Product news and validation tips" value={notif.email} onChange={(v) => setNotif({ ...notif, email: v })} />
        <ToggleRow t={t} label="Weekly digest" desc="Summary of your progress every Monday" value={notif.weekly} onChange={(v) => setNotif({ ...notif, weekly: v })} />
        <ToggleRow t={t} label="Task reminders" desc="Nudges for tasks sitting untouched" value={notif.taskReminders} onChange={(v) => setNotif({ ...notif, taskReminders: v })} last />
      </Card>

      <Card t={t} style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 650, color: t.text, margin: "0 0 14px" }}>Theme</h3>
        <div style={{ display: "flex", gap: 10 }}>
          <ThemeOption t={t} label="Light" active={!dark} icon={Sun} onClick={() => dark && toggleDark()} />
          <ThemeOption t={t} label="Dark" active={dark} icon={Moon} onClick={() => !dark && toggleDark()} />
        </div>
      </Card>

      <Card t={t}>
        <h3 style={{ fontSize: 15, fontWeight: 650, color: t.text, margin: "0 0 6px" }}>Export your data</h3>
        <p style={{ fontSize: 13, color: t.textSecondary, margin: "0 0 14px" }}>Download all your ideas, notes, tasks, and interviews as JSON.</p>
        <Button t={t} variant="secondary" icon={Download} onClick={exportData}>Export all data</Button>
      </Card>
    </div>
  );
}

function ToggleRow({ t, label, desc, value, onChange, last }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: last ? "none" : `1px solid ${t.borderLight}` }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{label}</div>
        <div style={{ fontSize: 12.5, color: t.textSecondary }}>{desc}</div>
      </div>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: 44, height: 26, borderRadius: 980, background: value ? t.success : t.border,
          position: "relative", cursor: "pointer", transition: "background 0.2s ease", flexShrink: 0,
        }}
      >
        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: value ? 21 : 3, transition: "left 0.2s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
      </div>
    </div>
  );
}

function ThemeOption({ t, label, active, icon: Icon, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1, padding: "16px 12px", borderRadius: 12, border: `2px solid ${active ? t.accent : t.border}`,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer",
        background: active ? t.accentBg : "transparent",
      }}
    >
      <Icon size={20} color={active ? t.accent : t.textSecondary} />
      <span style={{ fontSize: 13, fontWeight: 600, color: active ? t.accent : t.text }}>{label}</span>
    </div>
  );
}

/* ============================================================
   Root App
   ============================================================ */

export default function LaunchLens() {
  const [dark, setDark] = useState(false);
  const t = useTheme(dark ? "dark" : "light");

  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  const [ideas, setIdeas] = useState([SEED_IDEA]);
  const [activeIdeaId, setActiveIdeaId] = useState(SEED_IDEA.id);
  const [tasks, setTasks] = useState(SEED_TASKS);
  const [notes, setNotes] = useState(SEED_NOTES);
  const [interviews, setInterviews] = useState(SEED_INTERVIEWS);
  const [checklist, setChecklist] = useState({ [SEED_IDEA.id]: { 0: true, 1: false, 2: false, 3: false, 4: false, 5: false } });
  const [mentorMessages, setMentorMessages] = useState([]);

  const activeIdea = ideas.find((i) => i.id === activeIdeaId) || null;

  const updateIdea = (id, patch) => setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const handleIdeaCreated = (idea) => {
    setIdeas((prev) => [...prev, idea]);
    setActiveIdeaId(idea.id);
    setChecklist((prev) => ({ ...prev, [idea.id]: {} }));
    setView("ideaDetail");
  };

  if (!user) {
    return (
      <>
        <GlobalStyle />
        <AuthScreen t={t} onLogin={setUser} dark={dark} toggleDark={() => setDark((d) => !d)} />
      </>
    );
  }

  const viewTitles = Object.fromEntries(NAV_ITEMS.map((i) => [i.id, i.label]));

  return (
    <div style={{ fontFamily: FONT, background: t.bg, minHeight: "100vh", display: "flex" }}>
      <GlobalStyle />
      <Sidebar
        t={t} view={view} setView={setView} user={user} onLogout={() => setUser(null)}
        ideas={ideas} activeIdeaId={activeIdeaId} setActiveIdeaId={setActiveIdeaId} collapsed={collapsed}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <TopBar t={t} dark={dark} toggleDark={() => setDark((d) => !d)} title={viewTitles[view]} collapsed={collapsed} setCollapsed={setCollapsed} />
        <div style={{ padding: 28, maxWidth: 1280, margin: "0 auto" }}>
          {view === "dashboard" && (
            <Dashboard t={t} ideas={ideas} tasks={tasks} interviews={interviews} setView={setView} setActiveIdeaId={setActiveIdeaId} activeIdea={activeIdea} />
          )}
          {view === "create" && <CreateIdea t={t} onCreated={handleIdeaCreated} />}
          {view === "ideaDetail" && <IdeaDetail t={t} idea={activeIdea} updateIdea={updateIdea} setView={setView} />}
          {view === "market" && <MarketResearch t={t} idea={activeIdea} />}
          {view === "discovery" && <CustomerDiscovery t={t} idea={activeIdea} interviews={interviews} setInterviews={setInterviews} />}
          {view === "tasks" && <Tasks t={t} idea={activeIdea} tasks={tasks} setTasks={setTasks} />}
          {view === "checklist" && <Checklist t={t} idea={activeIdea} checklist={checklist} setChecklist={setChecklist} />}
          {view === "mentor" && <AIMentor t={t} idea={activeIdea} messages={mentorMessages} setMessages={setMentorMessages} />}
          {view === "progress" && <Progress t={t} idea={activeIdea} tasks={tasks} checklist={checklist} />}
          {view === "notes" && <Notes t={t} idea={activeIdea} notes={notes} setNotes={setNotes} />}
          {view === "analytics" && <Analytics t={t} idea={activeIdea} tasks={tasks} interviews={interviews} checklist={checklist} />}
          {view === "settings" && <Settings t={t} user={user} setUser={setUser} dark={dark} toggleDark={() => setDark((d) => !d)} allData={{ ideas, tasks, notes, interviews, checklist }} />}
        </div>
      </div>
    </div>
  );
}

function GlobalStyle() {
  return (
    <style>{`
      * { box-sizing: border-box; }
      body { margin: 0; }
      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.35); border-radius: 8px; }
      .spin { animation: spin 0.8s linear infinite; }
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @media (prefers-reduced-motion: reduce) {
        * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
      }
      input:focus, textarea:focus, select:focus { outline: none; }
      button { font-family: inherit; }
    `}</style>
  );
}
