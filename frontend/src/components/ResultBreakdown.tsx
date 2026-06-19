import React from "react";
import { FootprintResult } from "../lib/types";
import { formatNumber } from "../lib/format";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { TreePine, Plane, Car, Train, TrendingDown, TrendingUp, Minus } from "lucide-react";

const CAT = {
  transport:   { color: "#00c896", label: "Transport",    emoji: "🚗" },
  home:        { color: "#a78bfa", label: "Home Energy",  emoji: "🏠" },
  diet:        { color: "#fbbf24", label: "Diet",         emoji: "🥗" },
  consumption: { color: "#06b6d4", label: "Goods & Waste",emoji: "🛍️" },
} as const;

function InsightTag({ tag }: { tag: string }) {
  const map: Record<string, string> = {
    "Exceptional":   "tag-green",
    "Below Average": "tag-cyan",
    "Average":       "tag-yellow",
    "Above Average": "tag-yellow",
    "High Impact":   "tag-red",
  };
  return <span className={`tag ${map[tag] ?? "tag-cyan"}`}>{tag}</span>;
}

function ResultBreakdownInner({ result }: { result: FootprintResult }) {
  const total_t = result.total_annual_tonnes;
  const cats = Object.entries(result.breakdown_kg)
    .map(([k, v]) => ({ ...CAT[k as keyof typeof CAT], key: k, kg: v }))
    .sort((a, b) => b.kg - a.kg);

  const pieData = cats.map(c => ({ name: c.label, value: c.kg, color: c.color }));

  const barData = [
    { name: "You",          value: +(total_t).toFixed(2),                              fill: "#00c896" },
    { name: result.location_context.benchmark_label.replace(" average",""),
                            value: result.location_context.benchmark_t,                fill: "#fbbf24" },
    { name: "Target 2030",  value: 2.0,                                                fill: "#06b6d4" },
  ];

  const ratio = result.comparison.ratio_to_global_average;
  const RatioIcon = ratio < 0.9 ? TrendingDown : ratio > 1.1 ? TrendingUp : Minus;
  const ratioColor = ratio < 0.9 ? "#00c896" : ratio > 1.1 ? "#f87171" : "#fbbf24";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

      {/* ── Hero number ── */}
      <div style={{ textAlign: "center", position: "relative" }}>
        {/* Glow orb behind number */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: 200, height: 200,
          background: "radial-gradient(circle, rgba(0,200,150,0.12) 0%, transparent 70%)",
          pointerEvents: "none", filter: "blur(20px)"
        }} />
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 8 }}>
          Annual Carbon Footprint
        </p>
        <motion.div
          key={total_t}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
          style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 10, marginBottom: 10 }}
        >
          <span style={{
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: 72, fontWeight: 800, lineHeight: 1,
            background: "linear-gradient(135deg, #00c896 0%, #06b6d4 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            {formatNumber(total_t, 2)}
          </span>
          <span style={{ fontSize: 22, color: "var(--text-3)", fontWeight: 500 }}>t CO₂e</span>
        </motion.div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <InsightTag tag={result.insight_tag} />
          <span style={{ fontSize: 12, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 4 }}>
            <RatioIcon size={13} style={{ color: ratioColor }} />
            {ratio.toFixed(2)}× global average
          </span>
        </div>
      </div>

      {/* ── Category breakdown + Pie ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 24, alignItems: "start" }}>

        {/* Bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 2 }}>
            Breakdown
          </p>
          {cats.map((c, i) => {
            const pct = result.total_annual_kg > 0 ? (c.kg / result.total_annual_kg) * 100 : 0;
            return (
              <div key={c.key}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: "var(--text-2)" }}>{c.emoji} {c.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: c.color }}>{formatNumber(c.kg / 1000, 2)} t</span>
                </div>
                <div className="bar-track">
                  <motion.div className="bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.9, delay: i * 0.1, ease: "easeOut" }}
                    style={{ background: `linear-gradient(90deg, ${c.color}cc, ${c.color})` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Donut */}
        <div style={{ height: 160 }} role="img" aria-label={`Pie chart showing carbon footprint breakdown across ${cats.length} categories`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={46} outerRadius={68}
                paddingAngle={4} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`${formatNumber(v)} kg`]}
                contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Benchmark comparison ── */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 14 }}>
          How you compare
        </p>
        <div style={{ height: 140 }} role="img" aria-label={`Bar chart comparing your footprint of ${total_t.toFixed(2)} tonnes to regional and global benchmarks`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "var(--text-3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-3)", fontSize: 11 }} axisLine={false} tickLine={false} width={30} unit="t" />
              <Tooltip cursor={{ fill: "rgba(255,255,255,0.03)" }}
                contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10 }}
                formatter={(v: number) => [`${v} t CO₂e`]} />
              <Bar dataKey="value" radius={[6,6,0,0]}>
                {barData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Equivalencies ── */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 14 }}>
          What this equals
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {[
            { icon: <TreePine size={18} color="#00c896" />, value: formatNumber(result.equivalencies.trees_needed), label: "Trees to offset" },
            { icon: <Plane     size={18} color="#06b6d4" />, value: formatNumber(result.equivalencies.flights_delhi_mumbai, 1), label: "Del→Mum flights" },
            { icon: <Car      size={18} color="#fbbf24" />, value: formatNumber(result.equivalencies.km_petrol_car), label: "km by petrol car" },
            { icon: <Train    size={18} color="#a78bfa" />, value: formatNumber(result.equivalencies.km_indian_rail), label: "km by Indian Rail" },
          ].map(({ icon, value, label }) => (
            <div key={label} className="stat-box">
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>{icon}</div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{value}</div>
              <div style={{ fontSize: 10, color: "var(--text-3)", lineHeight: 1.3 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const ResultBreakdown = React.memo(ResultBreakdownInner);
