import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";

function useInView(ref: React.RefObject<HTMLElement | null>, options?: { once?: boolean }) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        if (options?.once) obs.disconnect();
      } else if (!options?.once) {
        setInView(false);
      }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, options?.once]);
  return inView;
}
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { AnimatedNumber } from "./AnimatedNumber";
import { AILogger } from "./AILogger";

const C = {
  bg: "#030c09",
  surface: "#081510",
  card: "#0d1f16",
  cardHigh: "#112518",
  primary: "#00e87a",
  accent: "#00cef5",
  fg: "#e2f5e8",
  muted: "#5d8f72",
  border: "rgba(0, 232, 122, 0.08)",
  borderBright: "rgba(0, 232, 122, 0.18)",
};

interface Props {
  carbonData: { transport: number; food: number; housing: number; total: number };
  location: string;
  onReset: () => void;
}

const INDIA_AVG = 1.9;
const GLOBAL_AVG = 4.8;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function genTrendData(total: number) {
  return MONTHS.map((m, i) => ({
    month: m,
    you: +(total * (0.85 + Math.sin(i * 0.6) * 0.12 + Math.random() * 0.06)).toFixed(2),
    india: +(INDIA_AVG * (0.95 + Math.sin(i * 0.4) * 0.05)).toFixed(2),
    global: +(GLOBAL_AVG * (0.97 + Math.sin(i * 0.3) * 0.03)).toFixed(2),
  }));
}

const EQUIV = [
  { label: "Trees needed to offset", value: (total: number) => Math.round(total * 45), icon: "🌳", color: C.primary },
  { label: "Flights Delhi → Mumbai", value: (total: number) => Math.round(total * 3.8), icon: "✈️", color: C.accent },
  { label: "Km driven in avg car", value: (total: number) => Math.round(total * 2100), icon: "🚗", color: "#ffb347" },
  { label: "Kg of beef produced", value: (total: number) => Math.round(total * 105), icon: "🥩", color: "#ff6b6b" },
];

const ACTIONS = [
  { title: "Switch to Metro Rail", impact: -0.52, icon: "🚇", desc: "Replace 3 car trips/week with Nagpur Metro", color: C.primary },
  { title: "Go Flexitarian", impact: -0.55, icon: "🥗", desc: "Cut meat consumption to 2–3 days/week", color: "#7cffc4" },
  { title: "Install Solar Panels", impact: -0.73, icon: "☀️", desc: "4kW system covers avg Nagpur household", color: C.accent },
  { title: "LED + Smart Appliances", impact: -0.18, icon: "💡", desc: "Reduce energy consumption by 30%", color: "#ffd700" },
];

export function Dashboard({ carbonData, location, onReset }: Props) {
  const trendData = genTrendData(carbonData.total);
  const [loggedSavings, setLoggedSavings] = useState(0);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(heroRef, { once: true });

  const pieData = [
    { name: "Transport", value: carbonData.transport, color: C.accent },
    { name: "Food", value: carbonData.food, color: C.primary },
    { name: "Housing", value: carbonData.housing, color: "#ffb347" },
  ];

  const scoreColor = carbonData.total < INDIA_AVG ? C.primary : carbonData.total < GLOBAL_AVG ? "#ffb347" : "#ff6b6b";

  const handleLogSaving = (amount: number) => {
    setLoggedSavings((s) => +(s + amount).toFixed(3));
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Outfit', sans-serif", color: C.fg, position: "relative" }}>
      <style>{`
        @media (max-width: 900px) {
          .bento-grid { grid-template-columns: 1fr 1fr !important; }
          .bento-grid > * { grid-column: span 2 !important; grid-row: span 1 !important; }
          .bento-equivs { grid-template-columns: 1fr 1fr !important; }
          .bento-actions { grid-template-columns: 1fr !important; }
          .dashboard-hero h1 { font-size: 5rem !important; }
          .dashboard-nav { padding: 16px 20px !important; }
          .dashboard-content { padding: 0 16px !important; }
        }
        @media (max-width: 600px) {
          .bento-grid { grid-template-columns: 1fr !important; }
          .bento-grid > * { grid-column: span 1 !important; }
          .bento-equivs { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* Fixed ambient glow */}
      <div style={{ position: "fixed", top: 0, left: "30%", width: 600, height: 600, background: `radial-gradient(circle, rgba(0,232,122,0.03) 0%, transparent 65%)`, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "20%", right: "10%", width: 400, height: 400, background: `radial-gradient(circle, rgba(0,206,245,0.04) 0%, transparent 65%)`, pointerEvents: "none", zIndex: 0 }} />

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(3,12,9,0.8)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 900, fontSize: 20, letterSpacing: "-0.03em" }}>
          <span style={{ color: C.primary }}>TERRA</span>
          <span style={{ color: C.accent }}>SCOPE</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.muted }}>📍 {location}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "rgba(0,232,122,0.08)", borderRadius: 100, border: `1px solid ${C.borderBright}` }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.primary, boxShadow: `0 0 8px ${C.primary}` }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.primary }}>LIVE TRACKING</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {loggedSavings > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              style={{ padding: "8px 16px", background: "rgba(0,232,122,0.1)", borderRadius: 100, border: `1px solid ${C.borderBright}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.primary }}
            >
              -{ loggedSavings.toFixed(2) }t logged
            </motion.div>
          )}
          <button
            onClick={onReset}
            style={{ padding: "8px 20px", borderRadius: 100, background: "transparent", border: `1px solid ${C.border}`, color: C.muted, fontSize: 13, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
          >
            Reset
          </button>
        </div>
      </nav>

      <div style={{ paddingTop: 100, paddingBottom: 120, position: "relative", zIndex: 1 }}>
        {/* HERO SCORE */}
        <div ref={heroRef} style={{ textAlign: "center", padding: "80px 40px 100px", position: "relative" }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: "0.15em", color: C.muted, marginBottom: 24 }}>
            ANNUAL CARBON FOOTPRINT · {new Date().getFullYear()}
          </p>

          <div style={{ position: "relative", display: "inline-block" }}>
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }} animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div style={{ fontSize: "clamp(5rem, 16vw, 12rem)", fontFamily: "'Urbanist', sans-serif", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.9, color: scoreColor, textShadow: `0 0 80px ${scoreColor}40` }}>
                {isInView && <AnimatedNumber value={carbonData.total} duration={2200} decimals={1} />}
              </div>
              <div style={{ fontSize: "clamp(1rem, 3vw, 1.8rem)", fontFamily: "'JetBrains Mono', monospace", color: C.muted, marginTop: 8 }}>
                TONNES CO₂e / YEAR
              </div>
            </motion.div>

            {/* Score ring */}
            <motion.div
              style={{ position: "absolute", inset: -40, borderRadius: "50%", border: `1px solid ${scoreColor}`, opacity: 0.1, pointerEvents: "none" }}
              animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              style={{ position: "absolute", inset: -60, borderRadius: "50%", border: `1px dashed ${scoreColor}`, opacity: 0.06, pointerEvents: "none" }}
              animate={{ rotate: -360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Comparison badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6, duration: 0.6 }}
            style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 48, flexWrap: "wrap" }}
          >
            <CompBadge label="India Average" value={INDIA_AVG} userVal={carbonData.total} color={C.primary} />
            <CompBadge label="Global Average" value={GLOBAL_AVG} userVal={carbonData.total} color={C.accent} />
            <CompBadge label="Paris 1.5°C Target" value={1.5} userVal={carbonData.total} color="#ffd700" />
          </motion.div>
        </div>

        {/* BENTO GRID */}
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 32px" }}>
          <BentoGrid carbonData={carbonData} pieData={pieData} scoreColor={scoreColor} />

          {/* EQUIVALENTS STRIP */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="bento-equivs" style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}
          >
            {EQUIV.map((eq) => (
              <EquivCard key={eq.label} icon={eq.icon} label={eq.label} value={eq.value(carbonData.total)} color={eq.color} />
            ))}
          </motion.div>

          {/* ACTIONS + COMPARISON */}
          <div className="bento-actions" style={{ display: "grid", gridTemplateColumns: "5fr 7fr", gap: 20, marginTop: 20 }}>
            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
              style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 24, padding: 32 }}
            >
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.1em", color: C.muted, marginBottom: 8 }}>RECOMMENDED ACTIONS</p>
              <h3 style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", marginBottom: 28 }}>
                Cut your footprint by <span style={{ color: C.primary }}>up to 50%</span>
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {ACTIONS.map((action) => (
                  <ActionCard key={action.title} action={action} />
                ))}
              </div>
            </motion.div>

            {/* Trend Chart */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
              style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 24, padding: 32 }}
            >
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.1em", color: C.muted, marginBottom: 8 }}>MONTHLY TREND COMPARISON</p>
              <h3 style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", marginBottom: 8 }}>Your Year in Carbon</h3>
              <div style={{ display: "flex", gap: 20, marginBottom: 28 }}>
                <LegendDot color={C.primary} label="You" />
                <LegendDot color={C.muted} label="India avg" />
                <LegendDot color="#ff6b6b" label="Global avg" />
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradYou" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.primary} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={C.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradIndia" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.muted} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={C.muted} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradGlobal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff6b6b" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#ff6b6b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.muted, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: C.card, border: `1px solid ${C.borderBright}`, borderRadius: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.fg }}
                    itemStyle={{ color: C.fg }}
                    labelStyle={{ color: C.muted }}
                  />
                  <Area type="monotone" dataKey="global" stroke="#ff6b6b" strokeWidth={1.5} fill="url(#gradGlobal)" strokeDasharray="4 4" dot={false} />
                  <Area type="monotone" dataKey="india" stroke={C.muted} strokeWidth={1.5} fill="url(#gradIndia)" strokeDasharray="4 4" dot={false} />
                  <Area type="monotone" dataKey="you" stroke={C.primary} strokeWidth={2.5} fill="url(#gradYou)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating AI Logger */}
      <AILogger onLogSaving={handleLogSaving} location={location} />
    </div>
  );
}

function BentoGrid({ carbonData, pieData, scoreColor }: { carbonData: any; pieData: any[]; scoreColor: string }) {
  return (
    <div className="bento-grid" style={{
      display: "grid",
      gridTemplateColumns: "repeat(12, 1fr)",
      gridTemplateRows: "auto auto",
      gap: 20,
    }}>
      {/* Transport Card - 5 cols */}
      <BentoCard style={{ gridColumn: "span 5", gridRow: "span 1" }} delay={0}>
        <BreakdownCard
          category="Transport"
          value={carbonData.transport}
          total={carbonData.total}
          color={C.accent}
          icon="🚗"
          detail="Avg across your transport modes"
        />
      </BentoCard>

      {/* Pie / Breakdown - 4 cols */}
      <BentoCard style={{ gridColumn: "span 4", gridRow: "span 2" }} delay={0.1} noPad>
        <div style={{ padding: "28px 28px 0" }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.1em", color: C.muted, marginBottom: 6 }}>BREAKDOWN</p>
          <h3 style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em" }}>Footprint by Source</h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" strokeWidth={0}>
              {pieData.map((entry, i) => <Cell key={i} fill={entry.color} opacity={0.9} />)}
            </Pie>
            <Tooltip
              contentStyle={{ background: C.card, border: `1px solid ${C.borderBright}`, borderRadius: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.fg }}
              formatter={(v: number) => [`${v.toFixed(2)}t`, ""]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ padding: "0 28px 28px", display: "flex", flexDirection: "column", gap: 10 }}>
          {pieData.map((d) => (
            <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                <span style={{ fontSize: 13, color: C.muted }}>{d.name}</span>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: C.fg }}>{d.value.toFixed(2)}t</span>
            </div>
          ))}
        </div>
      </BentoCard>

      {/* Score gauge - 3 cols */}
      <BentoCard style={{ gridColumn: "span 3", gridRow: "span 1" }} delay={0.15}>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.1em", color: C.muted, marginBottom: 6 }}>SCORE RATING</p>
        <h3 style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em", marginBottom: 20 }}>Global Percentile</h3>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 52, fontFamily: "'Urbanist', sans-serif", fontWeight: 900, color: scoreColor, lineHeight: 1 }}>
            {carbonData.total < 1.5 ? "A+" : carbonData.total < INDIA_AVG ? "A" : carbonData.total < GLOBAL_AVG ? "B" : "C"}
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>
            {carbonData.total < INDIA_AVG ? "Below India average" : carbonData.total < GLOBAL_AVG ? "Above India average" : "Above global average"}
          </div>
        </div>
        <ScoreBar value={carbonData.total} max={GLOBAL_AVG * 1.5} color={scoreColor} />
      </BentoCard>

      {/* Food Card - 3 cols */}
      <BentoCard style={{ gridColumn: "span 3", gridRow: "span 1" }} delay={0.2}>
        <BreakdownCard
          category="Food & Diet"
          value={carbonData.food}
          total={carbonData.total}
          color={C.primary}
          icon="🥗"
          detail="Based on your dietary choices"
        />
      </BentoCard>

      {/* Housing Card - 2 cols */}
      <BentoCard style={{ gridColumn: "span 2", gridRow: "span 1" }} delay={0.25}>
        <BreakdownCard
          category="Housing"
          value={carbonData.housing}
          total={carbonData.total}
          color="#ffb347"
          icon="🏠"
          detail="Home energy use"
        />
      </BentoCard>
    </div>
  );
}

function BentoCard({ children, style, delay = 0, noPad = false }: { children: React.ReactNode; style?: React.CSSProperties; delay?: number; noPad?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, boxShadow: `0 20px 60px rgba(0,0,0,0.3), 0 0 30px rgba(0,232,122,0.05)` }}
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 24,
        padding: noPad ? 0 : "28px",
        overflow: "hidden",
        transition: "box-shadow 0.3s ease",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

function BreakdownCard({ category, value, total, color, icon, detail }: { category: string; value: number; total: number; color: string; icon: string; detail: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.1em", color: C.muted, marginBottom: 4 }}>{category.toUpperCase()}</p>
          <h3 style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 800, fontSize: 28, color, letterSpacing: "-0.03em" }}>
            {value.toFixed(2)}
            <span style={{ fontSize: 14, color: C.muted, fontWeight: 400, marginLeft: 4 }}>t CO₂</span>
          </h3>
        </div>
        <div style={{ fontSize: 36, lineHeight: 1 }}>{icon}</div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        <div style={{ marginBottom: 8 }}>
          <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }} whileInView={{ width: `${pct}%` }}
              viewport={{ once: true }} transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: "100%", background: color, borderRadius: 2 }}
            />
          </div>
        </div>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.muted }}>{pct}% OF TOTAL · {detail}</p>
      </div>
    </div>
  );
}

function EquivCard({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: `0 20px 40px rgba(0,0,0,0.3), 0 0 20px ${color}15` }}
      style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: "24px 20px", cursor: "default" }}
    >
      <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 900, fontSize: 32, color, letterSpacing: "-0.03em", marginBottom: 4 }}>
        {value.toLocaleString()}
      </div>
      <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.4 }}>{label}</div>
    </motion.div>
  );
}

function ActionCard({ action }: { action: typeof ACTIONS[0] }) {
  return (
    <motion.div
      whileHover={{ x: 6, background: "rgba(255,255,255,0.04)" }}
      style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, cursor: "pointer", transition: "background 0.2s" }}
    >
      <span style={{ fontSize: 24, flexShrink: 0 }}>{action.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, color: C.fg }}>{action.title}</p>
        <p style={{ fontSize: 12, color: C.muted }}>{action.desc}</p>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: action.color, fontWeight: 600 }}>{action.impact.toFixed(2)}t</p>
        <p style={{ fontSize: 10, color: C.muted }}>CO₂/yr</p>
      </div>
    </motion.div>
  );
}

function ScoreBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden", position: "relative" }}>
        <motion.div
          initial={{ width: 0 }} whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: "100%", background: `linear-gradient(90deg, ${color}, ${color}aa)`, borderRadius: 3 }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.muted }}>0t</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.muted }}>{max.toFixed(1)}t</span>
      </div>
    </div>
  );
}

function CompBadge({ label, value, userVal, color }: { label: string; value: number; userVal: number; color: string }) {
  const better = userVal < value;
  return (
    <div style={{ padding: "10px 20px", borderRadius: 100, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, display: "flex", gap: 10, alignItems: "center" }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color }}>
        {value.toFixed(1)}t
      </span>
      <span style={{ fontSize: 12, color: C.muted }}>{label}</span>
      <span style={{ fontSize: 11, color: better ? C.primary : "#ff6b6b" }}>
        {better ? `▼ ${(value - userVal).toFixed(1)}t below` : `▲ ${(userVal - value).toFixed(1)}t above`}
      </span>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
      <span style={{ fontSize: 12, color: C.muted, fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
    </div>
  );
}
