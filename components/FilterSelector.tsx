export const FILTERS = [
  { id: "normal", name: "Normal", className: "" },
  { id: "bw", name: "B&W", className: "grayscale" },
  { id: "vintage", name: "Vintage", className: "sepia-[.5] hue-rotate-[-30deg] contrast-125" },
  { id: "sepia", name: "Sepia", className: "sepia" },
  { id: "bright", name: "Bright", className: "brightness-125 contrast-110" },
  { id: "cool", name: "Cool", className: "hue-rotate-[15deg] saturate-150 contrast-110" },
  { id: "warm", name: "Warm", className: "sepia-[.3] hue-rotate-[-15deg] saturate-150" },
];

interface FilterSelectorProps {
  selectedFilter: string;
  onSelectFilter: (filterId: string) => void;
}

export function FilterSelector({ selectedFilter, onSelectFilter }: FilterSelectorProps) {
  return (
    <div className="w-full overflow-x-auto pb-4 pt-2 hide-scrollbar">
      <div className="flex gap-3 px-4">
        {FILTERS.map((filter) => {
          const isSelected = selectedFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => onSelectFilter(filter.id)}
              className={`flex-shrink-0 px-5 py-3 rounded-2xl border-2 transition-all font-medium text-sm ${
                isSelected
                  ? "border-pink-500 bg-pink-500/10 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                  : "border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {filter.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
