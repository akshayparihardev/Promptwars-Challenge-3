import { useState, lazy, Suspense, useEffect } from 'react'
import { CalculatorForm } from './components/CalculatorForm'
import { HistoryPanel } from './components/HistoryPanel'
import { useFootprint } from './hooks/useFootprint'
import { Entry, emptyInput, CarbonInput } from './lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Moon, Sun } from 'lucide-react'

// Lazy-load heavy visualisation components for code-splitting
const ResultBreakdown = lazy(() => import('./components/ResultBreakdown').then(m => ({ default: m.ResultBreakdown })))
const InsightsPanel = lazy(() => import('./components/InsightsPanel').then(m => ({ default: m.InsightsPanel })))
const GamificationPanel = lazy(() => import('./components/GamificationPanel').then(m => ({ default: m.GamificationPanel })))
const WhatIfSimulator = lazy(() => import('./components/WhatIfSimulator').then(m => ({ default: m.WhatIfSimulator })))
const CarbonCard = lazy(() => import('./components/CarbonCard').then(m => ({ default: m.CarbonCard })))

function App() {
  const { calculate, loading, error, result, insights, gamification } = useFootprint()
  const [currentInput, setCurrentInput] = useState<CarbonInput>(emptyInput())
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialDark = saved ? saved === 'dark' : prefersDark
    setIsDark(initialDark)
    if (initialDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

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

      {/* ── Minimal top bar ── */}
      <header>
      <nav aria-label="Main navigation" style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(var(--bg), 0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 24px", height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Leaf size={18} color="var(--accent)" />
          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", letterSpacing: "-0.02em" }}>
            CarbonZero
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button 
            onClick={toggleTheme}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-2)' }}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 500 }}>
            v1.0
          </span>
        </div>
      </nav>
      </header>

      {/* ── Split layout ── */}
      <main id="main-content" role="main" className="flex-1 flex flex-col md:grid md:grid-cols-[380px_1fr] lg:grid-cols-[460px_1fr] md:overflow-hidden md:h-[calc(100vh-52px)]">

        {/* LEFT — Form panel */}
        <div className="border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 p-6 lg:p-7 bg-[var(--bg-1)] md:overflow-y-auto">
          {/* Form header */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{
              fontSize: 22, fontWeight: 700, lineHeight: 1.3,
              color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 6,
            }}>
              Carbon Footprint Calculator
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.6 }}>
              Enter your lifestyle data for a personalised, location-aware analysis.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: 14, padding: "10px 14px",
              background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)",
              borderRadius: 8, fontSize: 13, color: "#f87171",
            }}>⚠ {error}</div>
          )}

          <CalculatorForm onSubmit={handleSubmit} loading={loading} />

          <div style={{ marginTop: 20 }}>
            <HistoryPanel onSelectEntry={handleSelectHistory} />
          </div>

          {/* Footer */}
          <footer style={{ marginTop: 28, fontSize: 11, color: "var(--text-3)", lineHeight: 1.7, textAlign: "center" }}>
            <p>Emission factors: DEFRA 2023 · CEA 2023 · EPA · IEA</p>
          </footer>
        </div>

        {/* RIGHT — Results panel */}
        <div aria-live="polite" aria-atomic="false" className="p-6 lg:p-8 bg-[var(--bg)] md:overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* Empty state — clean, no spinning orbs */}
            {!result && !loading && (
              <motion.div key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", textAlign: "center" }}>

                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: "var(--accent-dim)",
                  border: "1px solid rgba(34,197,94,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 20,
                }}>
                  <Leaf size={22} color="var(--accent)" />
                </div>

                <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-2)", marginBottom: 8 }}>
                  Ready to analyse your footprint
                </h2>
                <p style={{ fontSize: 13, color: "var(--text-3)", maxWidth: 340, lineHeight: 1.7 }}>
                  Fill in your location and lifestyle details, then press Calculate to see your personalised breakdown, AI insights, and reduction strategies.
                </p>
              </motion.div>
            )}

            {/* Loading — clean skeleton pulse */}
            {loading && (
              <motion.div key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  border: "2px solid rgba(34,197,94,0.12)",
                  borderTopColor: "var(--accent)",
                }} className="animate-spin" />
                <p style={{ fontSize: 13, color: "var(--text-3)" }}>Calculating your footprint…</p>
              </motion.div>
            )}

            {/* Results */}
            {result && !loading && (
              <motion.div key={`r-${result.total_annual_kg}`}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                <Suspense fallback={<div style={{ textAlign: 'center', color: 'var(--text-3)', padding: 32 }}>Loading results…</div>}>
                <div className="glass" style={{ padding: 28 }}>
                  <ResultBreakdown result={result} />
                  {insights && <InsightsPanel insights={insights} />}
                  {gamification && <GamificationPanel data={gamification} />}
                </div>

                {/* What-If + Card */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
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
