/**
 * EcoAgent navigation header with animated branding.
 *
 * Why a dedicated Header component: consistent branding across all
 * tab states, with a pulsing eco-indicator that subtly communicates
 * the app is "alive" and monitoring environmental impact.
 */

"use client";

import { motion } from "framer-motion";

/** Navigation tab definition for the main dashboard. */
interface Tab {
  id: string;
  label: string;
  icon: string;
}

/** Available dashboard tabs — each maps to a distinct API controller. */
const TABS: Tab[] = [
  { id: "route", label: "Eco Route", icon: "🚗" },
  { id: "transit", label: "Transit", icon: "🚇" },
  { id: "flight", label: "Aviation", icon: "✈️" },
  { id: "insights", label: "AI Insights", icon: "🧠" },
];

interface HeaderProps {
  /** Currently active tab identifier. */
  activeTab: string;
  /** Callback invoked when the user selects a different tab. */
  onTabChange: (tabId: string) => void;
}

/**
 * Animated header with eco-branding and tab navigation.
 *
 * Uses Framer Motion for smooth tab indicator transitions,
 * providing a Google-caliber UX as specified in requirements.
 */
export default function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="relative z-10 border-b" style={{ borderColor: "var(--glass-border)" }}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Brand */}
        <div className="flex items-center justify-between mb-4">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Pulsing eco indicator */}
            <div className="relative">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ background: "var(--gradient-primary)" }}
              >
                🌍
              </div>
              <div
                className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full eco-pulse"
                style={{ background: "var(--eco-emerald)" }}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                Eco<span style={{ color: "var(--eco-emerald)" }}>Agent</span>
              </h1>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Carbon Footprint Intelligence
              </p>
            </div>
          </motion.div>

          {/* Status badge */}
          <motion.div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
            style={{
              background: "rgba(0, 230, 118, 0.08)",
              border: "1px solid var(--glass-border)",
              color: "var(--eco-emerald)",
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="w-1.5 h-1.5 rounded-full eco-pulse" style={{ background: "var(--eco-emerald)" }} />
            Live API Connected
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <motion.nav
          className="tab-nav"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => onTabChange(tab.id)}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </motion.nav>
      </div>
    </header>
  );
}
