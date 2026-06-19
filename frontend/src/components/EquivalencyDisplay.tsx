import { Equivalencies } from "../lib/types";
import { TreePine, Plane, Car, Train } from "lucide-react";
import { formatNumber } from "../lib/format";

export function EquivalencyDisplay({ eq }: { eq: Equivalencies }) {
  const items = [
    { icon: TreePine, label: "Tree seedlings grown for 10 yrs", value: formatNumber(eq.trees_needed) },
    { icon: Plane, label: "Flights from Delhi to Mumbai", value: eq.flights_delhi_mumbai.toString() },
    { icon: Car, label: "km driven by avg petrol car", value: formatNumber(eq.km_petrol_car) },
    { icon: Train, label: "km by Indian Railways", value: formatNumber(eq.km_indian_rail) },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <div key={i} className="bg-surface border border-border rounded-lg p-4 flex flex-col items-center text-center">
            <div className="p-3 bg-bg rounded-full mb-3 text-primary">
              <Icon className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl">{item.value}</span>
            <span className="text-xs text-gray-400 mt-1 leading-tight">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
