import { FootprintResult } from "../lib/types";
import { formatNumber } from "../lib/format";
import html2canvas from "html2canvas";
import { useRef, useState } from "react";
import { Download } from "lucide-react";

export function CarbonCard({ result }: { result: FootprintResult }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0f1115",
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
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg text-gray-300">Share your impact</h3>
        <button onClick={downloadCard} disabled={downloading} className="btn py-1 px-3 flex items-center gap-2 text-sm">
          <Download className="w-4 h-4" /> {downloading ? "Saving..." : "Download Card"}
        </button>
      </div>

      <div 
        ref={cardRef} 
        className="w-full max-w-sm mx-auto bg-gradient-to-br from-surface to-bg border border-border rounded-2xl p-6 shadow-2xl relative overflow-hidden"
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold tracking-tight text-white">CarbonZero</h2>
            <span className="text-xs font-medium px-2 py-1 bg-primary/20 text-primary rounded-full">
              {result.insight_tag}
            </span>
          </div>

          <div className="text-center mb-8">
            <div className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-2">Annual Footprint</div>
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              {formatNumber(result.total_annual_tonnes, 2)}
            </div>
            <div className="text-gray-400 font-medium mt-1">tonnes CO₂e</div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Location</span>
              <span className="font-medium text-white">{result.location_context.region.replace('_', ' ').toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Largest Contributor</span>
              <span className="font-medium text-white capitalize">{result.largest_category}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">vs Global Avg</span>
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
