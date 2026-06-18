import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

const C = {
  bg: "#030c09",
  surface: "#081510",
  card: "#0d1f16",
  primary: "#00e87a",
  accent: "#00cef5",
  fg: "#e2f5e8",
  muted: "#5d8f72",
  border: "rgba(0, 232, 122, 0.1)",
  borderBright: "rgba(0, 232, 122, 0.2)",
};

interface Message {
  id: number;
  role: "user" | "ai";
  text: string;
  impact?: number;
  timestamp: Date;
}

interface Props {
  onLogSaving: (amount: number) => void;
  location: string;
}

const QUICK_LOGS = [
  { label: "Metro to work", prompt: "Took Nagpur Metro to office today", saving: 0.002 },
  { label: "Veg lunch", prompt: "Had a vegetarian meal for lunch", saving: 0.003 },
  { label: "WFH day", prompt: "Working from home, skipped commute", saving: 0.005 },
  { label: "Cycled today", prompt: "Cycled to market instead of taking auto", saving: 0.004 },
];

function parseImpact(input: string, location: string): { response: string; saving: number } {
  const lower = input.toLowerCase();
  if (lower.includes("metro") || lower.includes("train") || lower.includes("rail")) {
    return { response: `Excellent choice! Taking the ${lower.includes("metro") ? `${location} Metro` : "train"} instead of a car saves approximately **2.1 kg CO₂** today. That's equivalent to planting 0.1 trees. Keep it up! 🚇`, saving: 0.0021 };
  }
  if (lower.includes("veg") || lower.includes("plant") || lower.includes("salad") || lower.includes("dal") || lower.includes("lentil")) {
    return { response: `Love that! A plant-based meal saves roughly **3.2 kg CO₂** compared to a beef meal. You're contributing to a greener ${location}. 🥗`, saving: 0.0032 };
  }
  if (lower.includes("cycle") || lower.includes("walk") || lower.includes("bike")) {
    return { response: `Zero-emission travel! Your cycling trip saved approximately **1.8 kg CO₂** compared to taking an auto-rickshaw. Every km counts! 🚲`, saving: 0.0018 };
  }
  if (lower.includes("wfh") || lower.includes("home") || lower.includes("remote")) {
    return { response: `Smart! Working from home eliminates your entire commute footprint — saving an estimated **4.8 kg CO₂** today for the average ${location} commuter. 🏡`, saving: 0.0048 };
  }
  if (lower.includes("solar") || lower.includes("renewable") || lower.includes("green energy")) {
    return { response: `Fantastic! Using renewable energy is one of the highest-impact actions. A full solar day at home saves **8+ kg CO₂** vs. the coal-heavy grid. ☀️`, saving: 0.008 };
  }
  if (lower.includes("car") || lower.includes("petrol") || lower.includes("diesel") || lower.includes("drove")) {
    return { response: `Logged your car trip. For future reference: the ${location} Metro covers the same corridor with 94% fewer emissions. Even one switch per week makes a measurable difference. 🚗`, saving: -0.001 };
  }
  if (lower.includes("flight") || lower.includes("flew") || lower.includes("airplane")) {
    return { response: `Flight logged. Air travel is carbon-intensive — a Delhi-Mumbai round trip emits ~0.25 tonnes CO₂. Consider offsetting via certified tree-planting initiatives. ✈️`, saving: -0.025 };
  }
  return {
    response: `I've logged your activity: "${input}". Our AI is analyzing the emission impact for ${location}. For best results, include transport mode, distance, or food type in your log. 🌿`,
    saving: 0.001,
  };
}

let msgId = 1;

export function AILogger({ onLogSaving, location }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: msgId++,
      role: "ai",
      text: `Hello! I'm your carbon intelligence assistant for **${location}**. Tell me about your daily habits — transport, food, energy — and I'll calculate your real-time impact. Try: *"Took the Nagpur Metro to work today"*`,
      timestamp: new Date(),
    },
  ]);
  const [typing, setTyping] = useState(false);
  const [pulsing, setPulsing] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      inputRef.current?.focus();
    }
  }, [open, messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: msgId++, role: "user", text: input, timestamp: new Date() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    const { response, saving } = parseImpact(input, location);

    setTimeout(() => {
      setTyping(false);
      const aiMsg: Message = { id: msgId++, role: "ai", text: response, impact: saving, timestamp: new Date() };
      setMessages((m) => [...m, aiMsg]);
      if (saving > 0) onLogSaving(saving);
    }, 1200 + Math.random() * 800);
  };

  const handleQuick = (log: typeof QUICK_LOGS[0]) => {
    setInput(log.prompt);
    inputRef.current?.focus();
  };

  const formatTime = (d: Date) => d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const renderText = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#00e87a">$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
  };

  return (
    <>
      {/* FAB */}
      <motion.button
        onClick={() => { setOpen(true); setPulsing(false); }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.93 }}
        style={{
          position: "fixed", bottom: 32, right: 32, zIndex: 100,
          width: 60, height: 60, borderRadius: "50%", border: "none", cursor: "pointer",
          background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
          display: open ? "none" : "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, boxShadow: `0 8px 32px rgba(0,232,122,0.35)`,
        }}
      >
        {pulsing && (
          <motion.div
            animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ position: "absolute", inset: -4, borderRadius: "50%", background: C.primary, zIndex: -1 }}
          />
        )}
        🌿
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed", bottom: 32, right: 32, zIndex: 100,
              width: 420, height: 620,
              background: "rgba(8, 21, 16, 0.92)",
              backdropFilter: "blur(32px)",
              border: `1px solid ${C.borderBright}`,
              borderRadius: 28,
              display: "flex", flexDirection: "column",
              boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(0,232,122,0.06), inset 0 1px 0 rgba(255,255,255,0.05)`,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{
              padding: "20px 24px",
              borderBottom: `1px solid ${C.border}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "rgba(0,232,122,0.03)",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ position: "relative" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${C.primary}22, ${C.accent}22)`, border: `1px solid ${C.borderBright}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🌱</div>
                  <motion.div
                    animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
                    style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: C.primary, border: `2px solid ${C.surface}` }}
                  />
                </div>
                <div>
                  <p style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 700, fontSize: 15, color: C.fg }}>Terra AI</p>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.muted }}>CARBON INTELLIGENCE · {location.toUpperCase()}</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                ×
              </button>
            </div>

            {/* Quick logs */}
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 8, overflowX: "auto", flexShrink: 0 }}>
              {QUICK_LOGS.map((q) => (
                <motion.button
                  key={q.label}
                  whileHover={{ scale: 1.04, background: "rgba(0,232,122,0.12)" }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleQuick(q)}
                  style={{
                    flexShrink: 0, padding: "6px 14px", borderRadius: 100,
                    background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
                    color: C.muted, fontSize: 12, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
                    whiteSpace: "nowrap", transition: "all 0.15s",
                  }}
                >
                  {q.label}
                </motion.button>
              ))}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}
                >
                  <div style={{
                    maxWidth: "85%", padding: "12px 16px", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: msg.role === "user" ? `linear-gradient(135deg, ${C.primary}22, ${C.accent}15)` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${msg.role === "user" ? C.borderBright : C.border}`,
                    color: C.fg, fontSize: 13.5, lineHeight: 1.6,
                  }}>
                    <div dangerouslySetInnerHTML={{ __html: renderText(msg.text) }} />
                    {msg.impact !== undefined && msg.impact > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 6 }}
                      >
                        <span style={{ fontSize: 14 }}>🌿</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.primary }}>
                          −{(msg.impact * 1000).toFixed(1)} kg CO₂ logged
                        </span>
                      </motion.div>
                    )}
                  </div>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.muted, marginTop: 4, paddingLeft: 4 }}>
                    {formatTime(msg.timestamp)}
                  </p>
                </motion.div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {typing && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: "18px 18px 18px 4px", width: "fit-content" }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        style={{ width: 6, height: 6, borderRadius: "50%", background: C.primary }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 18, padding: "10px 14px", transition: "border-color 0.2s" }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Log a habit... e.g. 'Took metro to work'"
                  rows={1}
                  style={{
                    flex: 1, background: "transparent", border: "none", outline: "none",
                    color: C.fg, fontSize: 13.5, fontFamily: "'Outfit', sans-serif",
                    resize: "none", maxHeight: 80, lineHeight: 1.5, padding: 0,
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                  onClick={handleSend}
                  disabled={!input.trim() || typing}
                  style={{
                    width: 36, height: 36, borderRadius: "50%", border: "none",
                    background: input.trim() && !typing ? C.primary : "rgba(255,255,255,0.06)",
                    color: input.trim() && !typing ? C.bg : C.muted,
                    cursor: input.trim() && !typing ? "pointer" : "default",
                    fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, transition: "all 0.2s",
                  }}
                >
                  ↑
                </motion.button>
              </div>
              <p style={{ fontSize: 10, color: C.muted, textAlign: "center", marginTop: 8, fontFamily: "'JetBrains Mono', monospace" }}>
                ENTER to send · SHIFT+ENTER for new line
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
