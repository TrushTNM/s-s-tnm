import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { api, FilterOptions } from '../lib/api';

interface FilterPanelProps {
  selectedCities: string[];
  selectedBrands: string[];
  selectedProducts: string[];
  onCitiesChange: (cities: string[]) => void;
  onBrandsChange: (brands: string[]) => void;
  onProductsChange: (products: string[]) => void;
  onClearAll: () => void;
}

export function FilterPanel({
  selectedCities,
  selectedBrands,
  selectedProducts,
  onCitiesChange,
  onBrandsChange,
  onProductsChange,
  onClearAll,
}: FilterPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    cities: [],
    brands: [],
    products: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const options = await api.getFilterOptions();
        setFilterOptions(options);
      } catch (error) {
        console.error('Failed to load filter options:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  const handleToggle = (
    value: string,
    selected: string[],
    onChange: (values: string[]) => void
  ) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const totalActiveFilters = selectedCities.length + selectedBrands.length + selectedProducts.length;

  if (isCollapsed) {
    return (
      <div className="w-12 border-r bg-gray-50 flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          aria-label="Expand filters"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        {totalActiveFilters > 0 && (
          <Badge className="mt-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
            {totalActiveFilters}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <aside className="w-64 border-r bg-gray-50 flex flex-col" role="complementary" aria-label="Filters">
      <div className="p-4 border-b bg-white flex items-center justify-between">
        <h2 className="font-semibold">Filters</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(true)}
          aria-label="Collapse filters"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {totalActiveFilters > 0 && (
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Active filters</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="h-6 px-2"
            >
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedCities.map(city => (
              <Badge key={city} variant="secondary" className="pl-2 pr-1 gap-1">
                {city}
                <button
                  onClick={() => handleToggle(city, selectedCities, onCitiesChange)}
                  className="hover:bg-gray-300 rounded-full"
                  aria-label={`Remove ${city} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {selectedBrands.map(brand => (
              <Badge key={brand} variant="secondary" className="pl-2 pr-1 gap-1">
                {brand}
                <button
                  onClick={() => handleToggle(brand, selectedBrands, onBrandsChange)}
                  className="hover:bg-gray-300 rounded-full"
                  aria-label={`Remove ${brand} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {selectedProducts.map(product => (
              <Badge key={product} variant="secondary" className="pl-2 pr-1 gap-1">
                {product}
                <button
                  onClick={() => handleToggle(product, selectedProducts, onProductsChange)}
                  className="hover:bg-gray-300 rounded-full"
                  aria-label={`Remove ${product} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* City Filter */}
          <div>
            <Label className="mb-3 block">City</Label>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-5 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filterOptions.cities.map(city => (
                  <div key={city} className="flex items-center space-x-2">
                    <Checkbox
                      id={`city-${city}`}
                      checked={selectedCities.includes(city)}
                      onCheckedChange={() => handleToggle(city, selectedCities, onCitiesChange)}
                    />
                    <label
                      htmlFor={`city-${city}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {city}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Brand Filter */}
          <div>
            <Label className="mb-3 block">Brand</Label>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-5 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filterOptions.brands.map(brand => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand}`}
                      checked={selectedBrands.includes(brand)}
                      onCheckedChange={() => handleToggle(brand, selectedBrands, onBrandsChange)}
                    />
                    <label
                      htmlFor={`brand-${brand}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Filter */}
          <div>
            <Label className="mb-3 block">Product</Label>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-5 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filterOptions.products.map(product => (
                  <div key={product} className="flex items-center space-x-2">
                    <Checkbox
                      id={`product-${product}`}
                      checked={selectedProducts.includes(product)}
                      onCheckedChange={() => handleToggle(product, selectedProducts, onProductsChange)}
                    />
                    <label
                      htmlFor={`product-${product}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {product}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
