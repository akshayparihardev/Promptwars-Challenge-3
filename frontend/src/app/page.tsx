"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { Dashboard } from "@/components/Dashboard";
import { calculateFootprint } from "@/lib/api";

gsap.registerPlugin(ScrollTrigger);

interface CarbonData {
  transport: number;
  food: number;
  housing: number;
  total: number;
}

interface OnboardingResult {
  location: string;
  transport: string[];
  diet: string;
  energy: string;
}

const TRANSPORT_CO2: Record<string, number> = {
  car_petrol: 0.876, car_diesel: 0.730, auto: 0.365, bus: 0.183,
  metro: 0.073, ebike: 0.018, bicycle: 0, wfh: 0,
};
const DIET_CO2: Record<string, number> = {
  meat_heavy: 2.628, mixed: 1.825, flexitarian: 1.278, vegetarian: 0.913, vegan: 0.548,
};
const ENERGY_CO2: Record<string, number> = {
  coal: 2.920, mixed: 1.825, solar_grid: 0.913, full_solar: 0.183,
};

function computeCarbonData(data: OnboardingResult, _rawTotal: number): CarbonData {
  const tArr = data.transport.map((t) => TRANSPORT_CO2[t] ?? 0);
  const transport = tArr.length > 0 ? tArr.reduce((a, b) => a + b, 0) / tArr.length : 0.365;
  const food = DIET_CO2[data.diet] ?? 1.825;
  const housing = ENERGY_CO2[data.energy] ?? 1.825;
  const total = +(transport + food + housing).toFixed(2);
  return { transport: +transport.toFixed(2), food: +food.toFixed(2), housing: +housing.toFixed(2), total };
}

export default function App() {
  const [view, setView] = useState<"onboarding" | "dashboard" | "loading">("onboarding");
  const [carbonData, setCarbonData] = useState<CarbonData | null>(null);
  const [location, setLocation] = useState("Nagpur");
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    lenis.on("scroll", () => ScrollTrigger.update());

    return () => {
      gsap.ticker.remove(() => {});
      lenis.destroy();
    };
  }, []);

  const handleOnboardingComplete = async (data: OnboardingResult, totalCO2: number) => {
    setView("loading");
    try {
      const dynamicFootprint = await calculateFootprint(data.location, data.transport, data.diet, data.energy);
      setCarbonData(dynamicFootprint);
    } catch (e) {
      console.error("Failed to fetch dynamic footprint, falling back to local computation:", e);
      setCarbonData(computeCarbonData(data, totalCO2));
    }
    setLocation(data.location);
    setView("dashboard");
  };

  const handleReset = () => {
    setView("onboarding");
    setCarbonData(null);
  };

  return (
    <div
      style={{ minHeight: "100vh", background: "#030c09", position: "relative" }}
      className="size-full dark"
    >
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #030c09; }
        ::-webkit-scrollbar { display: none; }
        * { scrollbar-width: none; }
        ::selection { background: rgba(0, 232, 122, 0.25); color: #e2f5e8; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .lenis.lenis-smooth { scroll-behavior: auto !important; }
        .lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
      `}</style>

      <AnimatePresence mode="wait">
        {view === "onboarding" && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ minHeight: "100vh" }}
          >
            <OnboardingFlow onComplete={handleOnboardingComplete} />
          </motion.div>
        )}

        {view === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#00e87a" }}
          >
            <div style={{ width: 40, height: 40, border: "4px solid rgba(0,232,122,0.2)", borderTopColor: "#00e87a", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: 20, fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>Calculating hyper-local footprint metrics...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </motion.div>
        )}

        {view === "dashboard" && carbonData && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 1.02, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Dashboard
              carbonData={carbonData}
              location={location}
              onReset={handleReset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
