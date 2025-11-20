import { X } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface ActiveFiltersProps {
  selectedCities: string[];
  selectedBrands: string[];
  selectedProducts: string[];
  onRemoveCity: (city: string) => void;
  onRemoveBrand: (brand: string) => void;
  onRemoveProduct: (product: string) => void;
  onClearAll: () => void;
}

export function ActiveFilters({
  selectedCities,
  selectedBrands,
  selectedProducts,
  onRemoveCity,
  onRemoveBrand,
  onRemoveProduct,
  onClearAll,
}: ActiveFiltersProps) {
  const totalFilters = selectedCities.length + selectedBrands.length + selectedProducts.length;

  if (totalFilters === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap py-4 px-6 bg-white/50 backdrop-blur-sm border-b border-slate-200/60">
      <span className="text-sm text-slate-600 font-medium mr-1">Active filters:</span>
      
      {selectedCities.map(city => (
        <Badge
          key={`city-${city}`}
          variant="secondary"
          className="pl-3 pr-2 py-1.5 gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60 transition-colors rounded-lg"
        >
          <span className="text-xs font-medium">City: {city}</span>
          <button
            onClick={() => onRemoveCity(city)}
            className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
            aria-label={`Remove ${city} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {selectedBrands.map(brand => (
        <Badge
          key={`brand-${brand}`}
          variant="secondary"
          className="pl-3 pr-2 py-1.5 gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/60 transition-colors rounded-lg"
        >
          <span className="text-xs font-medium">Brand: {brand}</span>
          <button
            onClick={() => onRemoveBrand(brand)}
            className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
            aria-label={`Remove ${brand} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {selectedProducts.map(product => (
        <Badge
          key={`product-${product}`}
          variant="secondary"
          className="pl-3 pr-2 py-1.5 gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 transition-colors rounded-lg"
        >
          <span className="text-xs font-medium">Product: {product}</span>
          <button
            onClick={() => onRemoveProduct(product)}
            className="hover:bg-emerald-200 rounded-full p-0.5 transition-colors"
            aria-label={`Remove ${product} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-8 px-3 ml-auto text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
      >
        Clear all
      </Button>
    </div>
  );
}