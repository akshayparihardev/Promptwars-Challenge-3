import React from "react";
import { FootprintResult } from "../lib/types";
import { formatNumber } from "../lib/format";
import html2canvas from "html2canvas";
import { useRef, useState } from "react";
import { Download } from "lucide-react";

function CarbonCardInner({ result }: { result: FootprintResult }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#09090b",
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `my-carbon-footprint.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-300">Share your impact</h3>
        <button onClick={downloadCard} disabled={downloading} className="btn py-1.5 px-3 flex items-center gap-2 text-xs">
          <Download className="w-3.5 h-3.5" /> {downloading ? "Saving..." : "Download"}
        </button>
      </div>

      <div 
        ref={cardRef} 
        className="w-full max-w-sm mx-auto rounded-xl p-5 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #18181b, #09090b)", border: "1px solid var(--border)" }}
      >
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-5">
            <h2 className="text-base font-bold tracking-tight text-white">CarbonZero</h2>
            <span className="tag tag-green text-xs">
              {result.insight_tag}
            </span>
          </div>

          <div className="text-center mb-6">
            <div className="text-zinc-500 text-xs uppercase tracking-widest font-semibold mb-2">Annual Footprint</div>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              {formatNumber(result.total_annual_tonnes, 2)}
            </div>
            <div className="text-zinc-500 font-medium mt-1 text-sm">tonnes CO₂e</div>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Region</span>
              <span className="font-medium text-zinc-200">{result.location_context.region.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Largest source</span>
              <span className="font-medium text-zinc-200 capitalize">{result.largest_category}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">vs Global avg</span>
              <span className={`font-medium ${result.comparison.ratio_to_global_average > 1 ? 'text-red-400' : 'text-emerald-400'}`}>
                {((result.comparison.ratio_to_global_average - 1) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const CarbonCard = React.memo(CarbonCardInner);
