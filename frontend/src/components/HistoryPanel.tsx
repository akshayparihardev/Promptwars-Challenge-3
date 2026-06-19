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
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Past Calculations</h3>
      </div>
      <div className="space-y-2">
        {entries.map((entry) => (
          <button
            key={entry.id}
            onClick={() => onSelectEntry(entry)}
            className="w-full text-left rounded-xl p-3 border border-gray-800 hover:border-gray-700 hover:bg-gray-800/40 transition-all flex justify-between items-center group"
          >
            <div>
              <p className="text-sm font-medium text-gray-300">{entry.input.location}</p>
              <p className="text-xs text-gray-600">{formatDate(entry.created_at)}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-400 text-sm">{formatNumber(entry.result.total_annual_tonnes, 2)}t</span>
              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
