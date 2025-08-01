import { PlaceType } from "../Interfaces";
import { Utensils, Zap, Store, Hotel, Fuel, Bus } from "lucide-react";

interface SearchOptionsSelectorProps {
  selectedType: PlaceType;
  onTypeChange: (type: PlaceType) => void;
}

const SearchOptionsSelector = ({
  selectedType,
  onTypeChange,
}: SearchOptionsSelectorProps) => {
  const options = [
    {
      type: "restaurant" as PlaceType,
      label: "Restauranger",
      icon: Utensils,
      color: "from-blue-500 to-blue-600",
    },
    {
      type: "fast_food" as PlaceType,
      label: "Snabbmat",
      icon: Zap,
      color: "from-yellow-500 to-orange-600",
    },
    {
      type: "clothes" as PlaceType,
      label: "Butiker",
      icon: Store,
      color: "from-green-500 to-blue-600",
    },
    {
      type: "hotel" as PlaceType,
      label: "Boende",
      icon: Hotel,
      color: "from-purple-500 to-pink-600",
    },
    {
      type: "fuel" as PlaceType,
      label: "Bensinmackar",
      icon: Fuel,
      color: "from-red-500 to-red-600",
    },
    {
      type: "transport" as PlaceType,
      label: "Transport",
      icon: Bus,
      color: "from-indigo-500 to-indigo-600",
    },
  ];

  return (
    <div className="w-full max-w-[88rem] mx-auto px-4 md:px-8 mt-5 md:mt-0">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedType === option.type;

          return (
            <button
              key={option.type}
              onClick={() => onTypeChange(option.type)}
              className={`
                relative p-4 md:p-6 rounded-xl transition-all duration-300 transform w-full
                ${
                  isSelected
                    ? `bg-gradient-to-br ${option.color} scale-105 shadow-lg`
                    : "bg-slate-800/60 backdrop-blur-md border border-slate-600 hover:bg-slate-700/60 hover:scale-102"
                }
              `}
            >
              <div className="flex flex-col items-center space-y-2">
                <Icon
                  className={`w-6 h-6 md:w-8 md:h-8 ${
                    isSelected ? "text-white" : "text-slate-300"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isSelected ? "text-white" : "text-slate-300"
                  }`}
                >
                  {option.label}
                </span>
              </div>

              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-50 rounded-xl" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SearchOptionsSelector;
