import { useEffect, useState } from "react";
import { Entry } from "../lib/types";
import { getHistory } from "../lib/api";
import { getDeviceId } from "../lib/deviceId";
import { formatDate, formatNumber } from "../lib/format";
import { Clock, ChevronRight } from "lucide-react";

export function HistoryPanel({ onSelectEntry }: { onSelectEntry: (entry: Entry) => void }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory(getDeviceId())
      .then(setEntries)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || entries.length === 0) return null;

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-3.5 h-3.5 text-zinc-500" />
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Past Calculations</h3>
      </div>
      <div className="space-y-1.5">
        {entries.map((entry) => (
          <button
            key={entry.id}
            onClick={() => onSelectEntry(entry)}
            className="w-full text-left rounded-lg p-2.5 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40 transition-all flex justify-between items-center group"
          >
            <div>
              <p className="text-sm font-medium text-zinc-300">{entry.input.location}</p>
              <p className="text-xs text-zinc-600">{formatDate(entry.created_at)}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-emerald-400 text-sm">{formatNumber(entry.result.total_annual_tonnes, 2)}t</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
