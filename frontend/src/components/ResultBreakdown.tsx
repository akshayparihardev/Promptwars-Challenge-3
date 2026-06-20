import React from "react";
import { FootprintResult } from "../lib/types";
import { formatNumber } from "../lib/format";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { TreePine, Plane, Car, Train, TrendingDown, TrendingUp, Minus } from "lucide-react";

const CAT = {
  transport:   { color: "#22c55e", label: "Transport" },
  home:        { color: "#a78bfa", label: "Home Energy" },
  diet:        { color: "#f59e0b", label: "Diet" },
  consumption: { color: "#06b6d4", label: "Goods & Waste" },
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
    { name: "You",          value: +(total_t).toFixed(2),                              fill: "#22c55e" },
    { name: result.location_context.benchmark_label.replace(" average",""),
                            value: result.location_context.benchmark_t,                fill: "#f59e0b" },
    { name: "Target 2030",  value: 2.0,                                                fill: "#06b6d4" },
  ];

  const ratio = result.comparison.ratio_to_global_average;
  const RatioIcon = ratio < 0.9 ? TrendingDown : ratio > 1.1 ? TrendingUp : Minus;
  const ratioColor = ratio < 0.9 ? "#4ade80" : ratio > 1.1 ? "#f87171" : "#fbbf24";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── Hero number ── */}
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 6 }}>
          Annual Carbon Footprint
        </p>
        <motion.div
          key={total_t}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 8, marginBottom: 8 }}
        >
          <span style={{
            fontSize: 64, fontWeight: 800, lineHeight: 1,
            background: "linear-gradient(135deg, #22c55e 0%, #06b6d4 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            {formatNumber(total_t, 2)}
          </span>
          <span style={{ fontSize: 20, color: "var(--text-3)", fontWeight: 500 }}>t CO₂e</span>
        </motion.div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <InsightTag tag={result.insight_tag} />
          <span style={{ fontSize: 12, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 4 }}>
            <RatioIcon size={13} style={{ color: ratioColor }} />
            {ratio.toFixed(2)}× global avg
          </span>
        </div>
      </div>

      {/* ── Category breakdown + Pie ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 150px", gap: 20, alignItems: "start" }}>

        {/* Bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 0 }}>
            Breakdown
          </p>
          {cats.map((c, i) => {
            const pct = result.total_annual_kg > 0 ? (c.kg / result.total_annual_kg) * 100 : 0;
            return (
              <div key={c.key}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "var(--text-2)" }}>{c.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: c.color }}>{formatNumber(c.kg / 1000, 2)} t</span>
                </div>
                <div className="bar-track">
                  <motion.div className="bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, delay: i * 0.08, ease: "easeOut" }}
                    style={{ background: c.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Donut */}
        <div style={{ height: 150 }} role="img" aria-label={`Pie chart showing carbon footprint breakdown across ${cats.length} categories`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={64}
                paddingAngle={3} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`${formatNumber(v)} kg`]}
                contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Benchmark comparison ── */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 12 }}>
          How you compare
        </p>
        <div style={{ height: 130 }} role="img" aria-label={`Bar chart comparing your footprint of ${total_t.toFixed(2)} tonnes to regional and global benchmarks`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "var(--text-3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-3)", fontSize: 11 }} axisLine={false} tickLine={false} width={28} unit="t" />
              <Tooltip cursor={{ fill: "rgba(255,255,255,0.02)" }}
                contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}
                formatter={(v: number) => [`${v} t CO₂e`]} />
              <Bar dataKey="value" radius={[4,4,0,0]}>
                {barData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Equivalencies ── */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 12 }}>
          What this equals
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {[
            { icon: <TreePine size={16} color="#4ade80" />, value: formatNumber(result.equivalencies.trees_needed), label: "Trees to offset" },
            { icon: <Plane    size={16} color="#22d3ee" />, value: formatNumber(result.equivalencies.flights_delhi_mumbai, 1), label: "Del–Mum flights" },
            { icon: <Car      size={16} color="#fbbf24" />, value: formatNumber(result.equivalencies.km_petrol_car), label: "km by car" },
            { icon: <Train    size={16} color="#a78bfa" />, value: formatNumber(result.equivalencies.km_indian_rail), label: "km by rail" },
          ].map(({ icon, value, label }) => (
            <div key={label} className="stat-box">
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 5 }}>{icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{value}</div>
              <div style={{ fontSize: 10, color: "var(--text-3)", lineHeight: 1.3 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const ResultBreakdown = React.memo(ResultBreakdownInner);
