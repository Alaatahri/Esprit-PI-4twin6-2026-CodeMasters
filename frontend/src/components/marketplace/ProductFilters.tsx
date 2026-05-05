'use client';

interface ProductFiltersProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
}

export function ProductFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
}: ProductFiltersProps) {
  return (
    <div className="p-6 rounded-2xl border border-border dark:border-white/10 bg-black/5 dark:bg-white/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground dark:text-white">Filtres</h3>
        <button
          onClick={() => {
            onCategoryChange('');
            onPriceRangeChange([0, 1000]);
          }}
          className="text-xs text-amber-400 hover:text-amber-700 dark:text-amber-300 transition-colors"
        >
          Réinitialiser
        </button>
      </div>
      
      {/* Catégories */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-muted-foreground dark:text-gray-300 mb-3">
          Catégories
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onCategoryChange('')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              selectedCategory === ''
                ? 'bg-amber-500 text-gray-900'
                : 'bg-black/5 dark:bg-white/10 text-muted-foreground dark:text-gray-400 hover:bg-black/5 dark:bg-white/20'
            }`}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-gray-900'
                  : 'bg-black/5 dark:bg-white/10 text-muted-foreground dark:text-gray-400 hover:bg-black/5 dark:bg-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      
      {/* Prix */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground dark:text-gray-300 mb-3">
          Prix (TND) : {priceRange[0]} - {priceRange[1]}
        </label>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-foreground dark:text-gray-500 w-12">Min</span>
            <input
              type="range"
              min={0}
              max={1000}
              value={priceRange[0]}
              onChange={(e) => onPriceRangeChange([Number(e.target.value), priceRange[1]])}
              className="flex-1 h-2 rounded-lg appearance-none bg-black/5 dark:bg-white/20 accent-amber-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-foreground dark:text-gray-500 w-12">Max</span>
            <input
              type="range"
              min={0}
              max={1000}
              value={priceRange[1]}
              onChange={(e) => onPriceRangeChange([priceRange[0], Number(e.target.value)])}
              className="flex-1 h-2 rounded-lg appearance-none bg-black/5 dark:bg-white/20 accent-amber-500"
            />
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-foreground dark:text-gray-500">
          <span>0 TND</span>
          <span>250 TND</span>
          <span>500 TND</span>
          <span>750 TND</span>
          <span>1000+ TND</span>
        </div>
      </div>
    </div>
  );
}