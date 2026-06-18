import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ParticleCanvas } from "./ParticleCanvas";

const COLORS = {
  bg: "#030c09",
  surface: "#081510",
  card: "#0d1f16",
  primary: "#00e87a",
  accent: "#00cef5",
  fg: "#e2f5e8",
  muted: "#5d8f72",
  border: "rgba(0, 232, 122, 0.1)",
};

const TRANSPORT_OPTIONS = [
  { id: "car_petrol", label: "Petrol Car", icon: "🚗", co2: 876, unit: "876 kg/yr" },
  { id: "car_diesel", label: "Diesel Car", icon: "🚙", co2: 730, unit: "730 kg/yr" },
  { id: "auto", label: "Auto-Rickshaw", icon: "🛺", co2: 365, unit: "365 kg/yr" },
  { id: "bus", label: "City Bus", icon: "🚌", co2: 183, unit: "183 kg/yr" },
  { id: "metro", label: "Metro Rail", icon: "🚇", co2: 73, unit: "73 kg/yr" },
  { id: "ebike", label: "E-Bike", icon: "⚡", co2: 18, unit: "18 kg/yr" },
  { id: "bicycle", label: "Bicycle", icon: "🚲", co2: 0, unit: "0 kg/yr" },
  { id: "wfh", label: "Work From Home", icon: "🏠", co2: 0, unit: "0 kg/yr" },
];

const DIET_OPTIONS = [
  { id: "meat_heavy", label: "Meat-Heavy", desc: "Daily red meat & poultry", co2: 2628, color: "#ff6b6b" },
  { id: "mixed", label: "Mixed Diet", desc: "Occasional meat, varied meals", co2: 1825, color: "#ffb347" },
  { id: "flexitarian", label: "Flexitarian", desc: "Mostly plant-based, some meat", co2: 1278, color: "#ffd700" },
  { id: "vegetarian", label: "Vegetarian", desc: "No meat, includes dairy & eggs", co2: 913, color: "#7cffc4" },
  { id: "vegan", label: "Vegan", desc: "100% plant-based lifestyle", co2: 548, color: "#00e87a" },
];

const ENERGY_OPTIONS = [
  { id: "coal", label: "Coal Grid", desc: "Standard fossil fuel electricity", co2: 2920, icon: "🏭" },
  { id: "mixed", label: "Mixed Grid", desc: "Partially renewable energy mix", co2: 1825, icon: "⚡" },
  { id: "solar_grid", label: "Solar + Grid", desc: "Rooftop solar with grid backup", co2: 913, icon: "☀️" },
  { id: "full_solar", label: "Full Renewable", desc: "Solar, wind, zero emissions", co2: 183, icon: "🌿" },
];

const CITIES = ["Nagpur", "Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad", "Jaipur"];

interface OnboardingData {
  location: string;
  transport: string[];
  diet: string;
  energy: string;
}

interface Props {
  onComplete: (data: OnboardingData, totalCO2: number) => void;
}

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0, filter: "blur(8px)" }),
  center: { x: 0, opacity: 1, filter: "blur(0px)", transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0, filter: "blur(8px)", transition: { duration: 0.35, ease: [0.55, 0, 0.78, 0] } }),
};

export function OnboardingFlow({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState<OnboardingData>({ location: "Nagpur", transport: [], diet: "", energy: "" });
  const [calculating, setCalculating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [citySearch, setCitySearch] = useState("Nagpur");
  const [showCities, setShowCities] = useState(false);

  const totalSteps = 5;

  const goNext = () => {
    setDir(1);
    setStep((s) => s + 1);
  };
  const goBack = () => {
    setDir(-1);
    setStep((s) => s - 1);
  };

  const calculateCO2 = () => {
    const tCO2 = TRANSPORT_OPTIONS.filter((t) => data.transport.includes(t.id)).reduce((acc, t) => acc + t.co2, 0) / Math.max(data.transport.length, 1);
    const dCO2 = DIET_OPTIONS.find((d) => d.id === data.diet)?.co2 ?? 1825;
    const eCO2 = ENERGY_OPTIONS.find((e) => e.id === data.energy)?.co2 ?? 1825;
    return (tCO2 + dCO2 + eCO2) / 1000;
  };

  const handleFinish = () => {
    setCalculating(true);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 18;
      if (p >= 100) {
        p = 100;
        clearInterval(iv);
        setTimeout(() => onComplete(data, calculateCO2()), 600);
      }
      setProgress(Math.min(p, 100));
    }, 80);
  };

  const toggleTransport = (id: string) => {
    setData((d) => ({
      ...d,
      transport: d.transport.includes(id) ? d.transport.filter((t) => t !== id) : [...d.transport, id],
    }));
  };

  return (
    <div
      style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'Outfit', sans-serif", color: COLORS.fg }}
      className="relative flex flex-col items-center justify-center overflow-hidden"
    >
      <ParticleCanvas />

      {/* Ambient glow */}
      <div style={{ position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: "radial-gradient(circle, rgba(0,232,122,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Top nav */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6">
        <div style={{ color: COLORS.primary, fontFamily: "'Urbanist', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: "-0.03em" }}>
          TERRA<span style={{ color: COLORS.accent }}>SCOPE</span>
        </div>
        {step > 0 && step < totalSteps && (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                style={{
                  height: 3,
                  borderRadius: 2,
                  background: i <= step ? COLORS.primary : "rgba(255,255,255,0.1)",
                }}
                animate={{ width: i === step ? 32 : 12 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait" custom={dir}>
        {/* STEP 0: WELCOME */}
        {step === 0 && (
          <motion.div key="welcome" custom={dir} variants={stepVariants} initial="enter" animate="center" exit="exit"
            className="flex flex-col items-center text-center px-6 max-w-3xl w-full"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{ marginBottom: 40 }}
            >
              <div style={{ width: 80, height: 80, margin: "0 auto 32px", position: "relative" }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1px solid ${COLORS.primary}`, opacity: 0.3 }}
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  style={{ position: "absolute", inset: 8, borderRadius: "50%", border: `1px solid ${COLORS.accent}`, opacity: 0.4 }}
                />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🌿</div>
              </div>

              <h1 style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "clamp(3rem, 8vw, 6rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, marginBottom: 24 }}>
                Know Your<br />
                <span style={{ color: COLORS.primary, textShadow: `0 0 40px rgba(0,232,122,0.4)` }}>Carbon</span>
              </h1>

              <p style={{ color: COLORS.muted, fontSize: "clamp(1rem, 2vw, 1.2rem)", maxWidth: 480, margin: "0 auto 48px", lineHeight: 1.7 }}>
                Hyper-local carbon intelligence for Nagpur and beyond. Quantify your footprint. Understand your impact. Act with precision.
              </p>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.04, boxShadow: `0 0 40px rgba(0,232,122,0.25)` }}
              whileTap={{ scale: 0.97 }}
              onClick={goNext}
              style={{
                background: COLORS.primary, color: COLORS.bg, padding: "18px 52px", borderRadius: 100,
                fontFamily: "'Urbanist', sans-serif", fontWeight: 700, fontSize: 18, border: "none",
                cursor: "pointer", letterSpacing: "-0.01em",
              }}
            >
              Begin Your Journey →
            </motion.button>

            <p style={{ color: COLORS.muted, fontSize: 13, marginTop: 20 }}>Takes about 2 minutes</p>
          </motion.div>
        )}

        {/* STEP 1: LOCATION */}
        {step === 1 && (
          <motion.div key="location" custom={dir} variants={stepVariants} initial="enter" animate="center" exit="exit"
            className="w-full max-w-2xl px-6"
          >
            <StepHeader step="01" title="Where do you call home?" sub="We'll use hyper-local emission factors for your city's grid and transport networks." />

            <div style={{ position: "relative" }}>
              <input
                value={citySearch}
                onChange={(e) => { setCitySearch(e.target.value); setShowCities(true); }}
                onFocus={() => setShowCities(true)}
                placeholder="Search your city..."
                style={{
                  width: "100%", padding: "20px 24px", background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${COLORS.border}`, borderRadius: 16, color: COLORS.fg,
                  fontSize: 18, fontFamily: "'Outfit', sans-serif", outline: "none",
                  transition: "border-color 0.2s",
                }}
                onBlur={() => setTimeout(() => setShowCities(false), 150)}
              />
              <AnimatePresence>
                {showCities && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    style={{
                      position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
                      background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                      borderRadius: 16, overflow: "hidden", zIndex: 100,
                    }}
                  >
                    {CITIES.filter((c) => c.toLowerCase().includes(citySearch.toLowerCase())).map((city) => (
                      <button
                        key={city}
                        onClick={() => { setData((d) => ({ ...d, location: city })); setCitySearch(city); setShowCities(false); }}
                        style={{
                          display: "block", width: "100%", padding: "14px 24px", textAlign: "left",
                          background: data.location === city ? "rgba(0,232,122,0.1)" : "transparent",
                          color: data.location === city ? COLORS.primary : COLORS.fg,
                          border: "none", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontSize: 16,
                          borderBottom: `1px solid ${COLORS.border}`,
                        }}
                      >
                        📍 {city}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {data.location && (
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: 24, padding: "16px 24px", background: "rgba(0,232,122,0.06)", borderRadius: 12, border: `1px solid rgba(0,232,122,0.15)` }}
              >
                <p style={{ color: COLORS.primary, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
                  📍 SELECTED → {data.location.toUpperCase()} · MAHARASHTRA · INDIA
                </p>
              </motion.div>
            )}

            <StepNav onBack={goBack} onNext={goNext} canNext={!!data.location} />
          </motion.div>
        )}

        {/* STEP 2: TRANSPORT */}
        {step === 2 && (
          <motion.div key="transport" custom={dir} variants={stepVariants} initial="enter" animate="center" exit="exit"
            className="w-full max-w-2xl px-6"
          >
            <StepHeader step="02" title="How do you move?" sub="Select all transport modes you regularly use. We'll calculate your blended emission rate." />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {TRANSPORT_OPTIONS.map((t) => {
                const sel = data.transport.includes(t.id);
                return (
                  <motion.button
                    key={t.id}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => toggleTransport(t.id)}
                    style={{
                      padding: "20px 12px", borderRadius: 16, cursor: "pointer",
                      background: sel ? "rgba(0,232,122,0.12)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${sel ? COLORS.primary : COLORS.border}`,
                      color: sel ? COLORS.primary : COLORS.muted,
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                      boxShadow: sel ? `0 0 20px rgba(0,232,122,0.1)` : "none",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span style={{ fontSize: 28 }}>{t.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>{t.label}</span>
                    <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", opacity: 0.7 }}>{t.unit}</span>
                  </motion.button>
                );
              })}
            </div>

            <StepNav onBack={goBack} onNext={goNext} canNext={data.transport.length > 0} />
          </motion.div>
        )}

        {/* STEP 3: DIET */}
        {step === 3 && (
          <motion.div key="diet" custom={dir} variants={stepVariants} initial="enter" animate="center" exit="exit"
            className="w-full max-w-2xl px-6"
          >
            <StepHeader step="03" title="What fuels you?" sub="Your dietary choices are one of the most significant drivers of your carbon footprint." />

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {DIET_OPTIONS.map((d, i) => {
                const sel = data.diet === d.id;
                return (
                  <motion.button
                    key={d.id}
                    whileHover={{ x: 8 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setData((prev) => ({ ...prev, diet: d.id }))}
                    style={{
                      display: "flex", alignItems: "center", gap: 20, padding: "20px 24px",
                      borderRadius: 16, cursor: "pointer", textAlign: "left",
                      background: sel ? `rgba(${hexToRgb(d.color)}, 0.08)` : "rgba(255,255,255,0.03)",
                      border: `1px solid ${sel ? d.color : COLORS.border}`,
                      transition: "all 0.2s ease",
                    }}
                  >
                    {/* Spectrum bar */}
                    <div style={{ width: 4, height: 44, borderRadius: 2, background: d.color, flexShrink: 0, opacity: sel ? 1 : 0.3 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ color: sel ? d.color : COLORS.fg, fontFamily: "'Urbanist', sans-serif", fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{d.label}</p>
                      <p style={{ color: COLORS.muted, fontSize: 13 }}>{d.desc}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: sel ? d.color : COLORS.muted }}>{(d.co2 / 1000).toFixed(1)}t</p>
                      <p style={{ fontSize: 11, color: COLORS.muted }}>CO₂/yr</p>
                    </div>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${sel ? d.color : COLORS.border}`, background: sel ? d.color : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {sel && <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.bg }} />}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <StepNav onBack={goBack} onNext={goNext} canNext={!!data.diet} />
          </motion.div>
        )}

        {/* STEP 4: ENERGY */}
        {step === 4 && !calculating && (
          <motion.div key="energy" custom={dir} variants={stepVariants} initial="enter" animate="center" exit="exit"
            className="w-full max-w-2xl px-6"
          >
            <StepHeader step="04" title="How does your home breathe?" sub="Residential energy is often the largest single source of household carbon emissions." />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {ENERGY_OPTIONS.map((e) => {
                const sel = data.energy === e.id;
                return (
                  <motion.button
                    key={e.id}
                    whileHover={{ scale: 1.02, y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setData((prev) => ({ ...prev, energy: e.id }))}
                    style={{
                      padding: "24px 20px", borderRadius: 20, cursor: "pointer", textAlign: "left",
                      background: sel ? "rgba(0,232,122,0.08)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${sel ? COLORS.primary : COLORS.border}`,
                      boxShadow: sel ? `0 0 30px rgba(0,232,122,0.08), inset 0 0 0 1px rgba(0,232,122,0.1)` : "none",
                      transition: "all 0.25s ease",
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 12 }}>{e.icon}</div>
                    <p style={{ color: sel ? COLORS.primary : COLORS.fg, fontFamily: "'Urbanist', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{e.label}</p>
                    <p style={{ color: COLORS.muted, fontSize: 12, lineHeight: 1.5, marginBottom: 12 }}>{e.desc}</p>
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: sel ? COLORS.primary : COLORS.muted }}>
                      {(e.co2 / 1000).toFixed(2)}t CO₂/yr
                    </p>
                  </motion.button>
                );
              })}
            </div>

            <StepNav onBack={goBack} onNext={handleFinish} canNext={!!data.energy} nextLabel="Calculate My Footprint" isLast />
          </motion.div>
        )}

        {/* CALCULATING */}
        {calculating && (
          <motion.div key="calc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center px-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{ width: 80, height: 80, borderRadius: "50%", border: `2px solid transparent`, borderTopColor: COLORS.primary, marginBottom: 40 }}
            />
            <h2 style={{ fontFamily: "'Urbanist', sans-serif", fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 12 }}>Calculating your footprint</h2>
            <p style={{ color: COLORS.muted, marginBottom: 40 }}>Crunching hyper-local emission factors for {data.location}...</p>
            <div style={{ width: 300, height: 2, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
              <motion.div style={{ height: "100%", background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.accent})`, borderRadius: 2 }} animate={{ width: `${progress}%` }} />
            </div>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: COLORS.primary, marginTop: 16 }}>{Math.round(progress)}%</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepHeader({ step, title, sub }: { step: string; title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: COLORS.primary, letterSpacing: "0.1em", marginBottom: 16 }}>
        STEP {step} / 04
      </p>
      <h2 style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>
        {title}
      </h2>
      <p style={{ color: COLORS.muted, fontSize: 15, lineHeight: 1.7, maxWidth: 480 }}>{sub}</p>
    </div>
  );
}

function StepNav({ onBack, onNext, canNext, nextLabel = "Continue →", isLast = false }: {
  onBack: () => void; onNext: () => void; canNext: boolean; nextLabel?: string; isLast?: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: 12, marginTop: 40, justifyContent: "space-between", alignItems: "center" }}>
      <motion.button
        whileHover={{ x: -4 }} whileTap={{ scale: 0.97 }}
        onClick={onBack}
        style={{ padding: "14px 24px", borderRadius: 100, background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.muted, fontFamily: "'Outfit', sans-serif", fontSize: 15, cursor: "pointer" }}
      >
        ← Back
      </motion.button>
      <motion.button
        whileHover={canNext ? { scale: 1.03, boxShadow: `0 0 30px rgba(0,232,122,0.2)` } : {}}
        whileTap={canNext ? { scale: 0.97 } : {}}
        onClick={canNext ? onNext : undefined}
        style={{
          padding: "16px 36px", borderRadius: 100, cursor: canNext ? "pointer" : "not-allowed",
          background: canNext ? (isLast ? `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})` : COLORS.primary) : "rgba(255,255,255,0.05)",
          color: canNext ? COLORS.bg : COLORS.muted,
          fontFamily: "'Urbanist', sans-serif", fontWeight: 700, fontSize: 16, border: "none",
          transition: "all 0.2s ease",
        }}
      >
        {nextLabel}
      </motion.button>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}
