import { useState, lazy, Suspense } from 'react'
import { CalculatorForm } from './components/CalculatorForm'
import { HistoryPanel } from './components/HistoryPanel'
import { useFootprint } from './hooks/useFootprint'
import { Entry, emptyInput, CarbonInput } from './lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Zap, BarChart3, SlidersHorizontal } from 'lucide-react'

// Lazy-load heavy visualisation components for code-splitting
const ResultBreakdown = lazy(() => import('./components/ResultBreakdown').then(m => ({ default: m.ResultBreakdown })))
const InsightsPanel = lazy(() => import('./components/InsightsPanel').then(m => ({ default: m.InsightsPanel })))
const GamificationPanel = lazy(() => import('./components/GamificationPanel').then(m => ({ default: m.GamificationPanel })))
const WhatIfSimulator = lazy(() => import('./components/WhatIfSimulator').then(m => ({ default: m.WhatIfSimulator })))
const CarbonCard = lazy(() => import('./components/CarbonCard').then(m => ({ default: m.CarbonCard })))

function App() {
  const { calculate, loading, error, result, insights, gamification } = useFootprint()
  const [currentInput, setCurrentInput] = useState<CarbonInput>(emptyInput())

  const handleSubmit = (input: CarbonInput) => {
    setCurrentInput(input)
    calculate(input)
  }

  const handleSelectHistory = (entry: Entry) => {
    setCurrentInput(entry.input)
    calculate(entry.input)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Accessibility: skip link for keyboard users */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* ── Top nav ── */}
      <header>
      <nav aria-label="Main navigation" style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(2,4,8,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 24px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "rgba(0,200,150,0.12)",
            border: "1px solid rgba(0,200,150,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Leaf size={17} color="#00c896" />
          </div>
          <div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 16, color: "#f8fafc", letterSpacing: "-0.02em" }}>
              CarbonZero
            </div>
            <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: -1 }}>Hyper-local footprint analysis</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            padding: "5px 12px", borderRadius: 8,
            background: "rgba(0,200,150,0.08)", border: "1px solid rgba(0,200,150,0.15)",
            fontSize: 11, fontWeight: 600, color: "#00c896",
          }}>✦ Gemini AI Powered</span>
        </div>
      </nav>
      </header>

      {/* ── Split layout ── */}
      <main id="main-content" role="main" style={{ flex: 1, display: "grid", gridTemplateColumns: "420px 1fr", maxHeight: "calc(100vh - 60px)" }}>

        {/* LEFT — Form panel (sticky scroll) */}
        <div style={{
          borderRight: "1px solid rgba(255,255,255,0.06)",
          overflowY: "auto",
          padding: "32px 28px",
          background: "rgba(8,13,20,0.5)",
        }}>
          {/* Form header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontSize: 26, fontWeight: 800, lineHeight: 1.2,
              color: "#f8fafc", letterSpacing: "-0.02em", marginBottom: 8,
            }}>
              Calculate Your<br />
              <span style={{
                background: "linear-gradient(135deg, #00c896 0%, #06b6d4 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>Carbon Footprint</span>
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.6 }}>
              Enter your lifestyle data to get a personalised, hyper-local carbon analysis.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: 16, padding: "12px 16px",
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 12, fontSize: 13, color: "#f87171",
            }}>⚠️ {error}</div>
          )}

          <CalculatorForm onSubmit={handleSubmit} loading={loading} />

          <div style={{ marginTop: 24 }}>
            <HistoryPanel onSelectEntry={handleSelectHistory} />
          </div>

          {/* Footer credits */}
          <footer style={{ marginTop: 32, fontSize: 10, color: "var(--text-3)", lineHeight: 1.7, textAlign: "center" }}>
            <p>Factors: DEFRA 2023 · CEA 2023 · EPA · EMBER · IEA<br />
            PromptWars Challenge 3 Submission</p>
          </footer>
        </div>

        {/* RIGHT — Results panel */}
        <div aria-live="polite" aria-atomic="false" style={{ overflowY: "auto", padding: "32px 36px", background: "var(--bg)" }}>
          <AnimatePresence mode="wait">

            {/* Empty state */}
            {!result && !loading && (
              <motion.div key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", textAlign: "center" }}>

                {/* Big decorative circle */}
                <div style={{
                  width: 160, height: 160, borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(0,200,150,0.08) 0%, transparent 70%)",
                  border: "1px solid rgba(0,200,150,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 32, position: "relative",
                }}>
                  <div style={{
                    position: "absolute", inset: -1, borderRadius: "50%",
                    background: "conic-gradient(from 0deg, rgba(0,200,150,0.2), transparent, rgba(6,182,212,0.2), transparent, rgba(0,200,150,0.2))",
                    animation: "spin 8s linear infinite",
                  }} />
                  <Leaf size={48} color="rgba(0,200,150,0.4)" />
                </div>

                <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 700, color: "var(--text-2)", marginBottom: 10 }}>
                  Ready to analyse your footprint
                </h2>
                <p style={{ fontSize: 13, color: "var(--text-3)", maxWidth: 360, lineHeight: 1.7, marginBottom: 32 }}>
                  Fill in your location and lifestyle details on the left, then hit Calculate to see your personalised breakdown.
                </p>

                {/* Feature preview cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 420, width: "100%" }}>
                  {[
                    { icon: <BarChart3 size={18} color="#00c896" />, title: "Hyper-local analysis", desc: "Region-specific electricity grids & benchmarks" },
                    { icon: <Zap size={18} color="#fbbf24" />, title: "Gemini AI insights", desc: "Personalized reduction recommendations" },
                    { icon: <SlidersHorizontal size={18} color="#06b6d4" />, title: "What-If simulator", desc: "Model the impact of lifestyle changes" },
                    { icon: <Leaf size={18} color="#a78bfa" />, title: "Shareable card", desc: "Download & share your carbon footprint" },
                  ].map(f => (
                    <div key={f.title} className="glass" style={{ padding: "16px", textAlign: "left" }}>
                      <div style={{ marginBottom: 8 }}>{f.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 4 }}>{f.title}</div>
                      <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.5 }}>{f.desc}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Loading */}
            {loading && (
              <motion.div key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", gap: 16 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  border: "2px solid rgba(0,200,150,0.15)",
                  borderTopColor: "#00c896",
                }} className="animate-spin" />
                <p style={{ fontSize: 14, color: "var(--text-3)" }}>Calculating your footprint…</p>
                <p style={{ fontSize: 12, color: "var(--text-3)", opacity: 0.6 }}>Fetching AI-powered insights</p>
              </motion.div>
            )}

            {/* Results */}
            {result && !loading && (
              <motion.div key={`r-${result.total_annual_kg}`}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                {/* Main result card */}
                <Suspense fallback={<div style={{ textAlign: 'center', color: 'var(--text-3)', padding: 32 }}>Loading results…</div>}>
                <div className="glass" style={{ padding: 32 }}>
                  <ResultBreakdown result={result} />
                  {insights && <InsightsPanel insights={insights} />}
                  {gamification && <GamificationPanel data={gamification} />}
                </div>

                {/* What-If + Card */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <WhatIfSimulator baseInput={currentInput} />
                  <CarbonCard result={result} />
                </div>
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

export default App
