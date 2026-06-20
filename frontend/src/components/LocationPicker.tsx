import { useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown, CheckCircle2 } from "lucide-react";

// All supported locations grouped by region — no hardcoded defaults, purely data
// eslint-disable-next-line react-refresh/only-export-components
export const LOCATION_GROUPS: { region: string; color: string; icon: string; cities: string[] }[] = [
  {
    region: "India – Urban",
    color: "#f59e0b",
    icon: "🇮🇳",
    cities: [
      "Mumbai, India", "Delhi, India", "Bangalore, India", "Chennai, India",
      "Hyderabad, India", "Pune, India", "Kolkata, India", "Ahmedabad, India",
      "Jaipur, India", "Noida, India", "Gurgaon, India", "Kochi, India",
      "Bhopal, India", "Indore, India", "Chandigarh, India", "Coimbatore, India",
      "Mysore, India", "Goa, India", "Surat, India", "Lucknow, India",
    ],
  },
  {
    region: "India – Rural",
    color: "#f59e0b",
    icon: "🌾",
    cities: ["Rural Rajasthan, India", "Rural Maharashtra, India", "Rural Bihar, India", "Village, India"],
  },
  {
    region: "United Kingdom",
    color: "#3b82f6",
    icon: "🇬🇧",
    cities: ["London, UK", "Manchester, UK", "Birmingham, UK", "Edinburgh, Scotland", "Cardiff, Wales"],
  },
  {
    region: "United States",
    color: "#3b82f6",
    icon: "🇺🇸",
    cities: ["New York, USA", "Los Angeles, USA", "Chicago, USA", "Houston, USA", "San Francisco, USA"],
  },
  {
    region: "European Union",
    color: "#6366f1",
    icon: "🇪🇺",
    cities: ["Berlin, Germany", "Paris, France", "Amsterdam, Netherlands", "Barcelona, Spain", "Rome, Italy", "Stockholm, Sweden"],
  },
  {
    region: "Asia Pacific",
    color: "#10b981",
    icon: "🌏",
    cities: ["Tokyo, Japan", "Seoul, South Korea", "Singapore", "Sydney, Australia", "Auckland, New Zealand"],
  },
  {
    region: "Rest of World",
    color: "#64748b",
    icon: "🌍",
    cities: ["São Paulo, Brazil", "Lagos, Nigeria", "Dubai, UAE", "Nairobi, Kenya", "Bangkok, Thailand", "Cairo, Egypt"],
  },
];

interface Props {
  value: string;
  onChange: (v: string) => void;
}

function detectRegionBadge(value: string): { label: string; color: string } | null {
  if (!value.trim()) return null;
  const v = value.toLowerCase();
  const indiaKeywords = ["india", "mumbai", "delhi", "bangalore", "chennai", "hyderabad", "pune",
    "kolkata", "ahmedabad", "jaipur", "noida", "gurgaon", "kochi", "bhopal", "indore", "chandigarh", "mysore", "goa", "surat", "lucknow"];
  if (indiaKeywords.some(k => v.includes(k))) {
    if (v.includes("rural") || v.includes("village")) return { label: "India Grid · 0.82 kg/kWh", color: "#f59e0b" };
    return { label: "India Grid · 0.82 kg/kWh", color: "#f59e0b" };
  }
  if (v.includes("uk") || v.includes("london") || v.includes("england") || v.includes("scotland") || v.includes("wales"))
    return { label: "UK Grid · 0.233 kg/kWh", color: "#3b82f6" };
  if (v.includes("usa") || v.includes("united states") || v.includes("america"))
    return { label: "US Grid · 0.386 kg/kWh", color: "#3b82f6" };
  if (["germany","france","spain","italy","netherlands","belgium","sweden","denmark","finland","ireland","austria","norway"].some(k => v.includes(k)))
    return { label: "EU Grid · 0.251 kg/kWh", color: "#6366f1" };
  if (["japan","south korea","singapore","australia","new zealand","canada"].some(k => v.includes(k)))
    return { label: "Developed · 0.386 kg/kWh", color: "#10b981" };
  return { label: "Global Average · 0.45 kg/kWh", color: "#64748b" };
}

export function LocationPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const allCities = LOCATION_GROUPS.flatMap(g => g.cities);
  const filtered = query.length > 1
    ? allCities.filter(c => c.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  const handleSelect = (city: string) => {
    setQuery(city);
    onChange(city);
    setOpen(false);
  };

  const handleInputChange = (v: string) => {
    setQuery(v);
    onChange(v);
    setOpen(true);
  };

  const badge = detectRegionBadge(value);

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 pointer-events-none" />
        <input
          type="text"
          className="input pl-9 pr-9"
          placeholder="Type your city — e.g. Mumbai, India"
          value={query}
          onChange={e => handleInputChange(e.target.value)}
          onFocus={() => setOpen(true)}
          autoComplete="off"
          required
        />
        <button
          type="button"
          aria-label="Toggle location dropdown"
          onClick={() => setOpen(o => !o)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Live region badge */}
      {badge && (
        <div className="flex items-center gap-2 mt-2 animate-slide-in">
          <CheckCircle2 className="w-3.5 h-3.5" style={{ color: badge.color }} />
          <span className="text-xs font-medium" style={{ color: badge.color }}>{badge.label}</span>
          <span className="text-xs text-gray-600">— customized to your region</span>
        </div>
      )}
      {!badge && query.length > 2 && (
        <div className="flex items-center gap-2 mt-2 animate-slide-in">
          <span className="text-xs text-gray-500">🌐 Defaulting to global average grid — results still fully accurate</span>
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl border border-gray-700 shadow-2xl overflow-hidden"
          style={{ background: "#0d111c", maxHeight: "340px", overflowY: "auto" }}>

          {/* Filtered results */}
          {filtered.length > 0 && (
            <div className="p-2 border-b border-gray-800">
              {filtered.map(city => (
                <button key={city} type="button" onClick={() => handleSelect(city)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  {city}
                </button>
              ))}
            </div>
          )}

          {/* Browse by region */}
          <div className="p-2">
            <p className="text-xs text-gray-600 px-3 py-1 font-semibold uppercase tracking-wider">Browse by Region</p>
            {LOCATION_GROUPS.map(group => (
              <div key={group.region}>
                <p className="text-xs px-3 py-1.5 mt-1 font-medium" style={{ color: group.color }}>
                  {group.icon} {group.region}
                </p>
                <div className="flex flex-wrap gap-1 px-3 pb-2">
                  {group.cities.slice(0, 5).map(city => (
                    <button key={city} type="button" onClick={() => handleSelect(city)}
                      className="text-xs px-2 py-1 rounded-md border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-colors">
                      {city.split(",")[0]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
