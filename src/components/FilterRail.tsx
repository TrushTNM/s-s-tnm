import { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { api, FilterOptions } from '../lib/api';
import { Skeleton } from './ui/skeleton';

interface FilterRailProps {
  selectedCities: string[];
  selectedBrands: string[];
  selectedProducts: string[];
  onCitiesChange: (cities: string[]) => void;
  onBrandsChange: (brands: string[]) => void;
  onProductsChange: (products: string[]) => void;
  isCompact: boolean;
}

export function FilterRail({
  selectedCities,
  selectedBrands,
  selectedProducts,
  onCitiesChange,
  onBrandsChange,
  onProductsChange,
  isCompact,
}: FilterRailProps) {
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

  const FilterContent = () => (
    <div className="space-y-6">
      {/* City Filter */}
      <div>
        <Label className="mb-3 block text-xs uppercase tracking-wider text-gray-500">City</Label>
        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filterOptions.cities.map(city => (
              <div key={city} className="flex items-center space-x-2.5">
                <Checkbox
                  id={`city-${city}`}
                  checked={selectedCities.includes(city)}
                  onCheckedChange={() => handleToggle(city, selectedCities, onCitiesChange)}
                />
                <label
                  htmlFor={`city-${city}`}
                  className="text-sm cursor-pointer flex-1 select-none"
                >
                  {city}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Filter */}
      <div>
        <Label className="mb-3 block text-xs uppercase tracking-wider text-gray-500">Product</Label>
        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filterOptions.products.map(product => (
              <div key={product} className="flex items-center space-x-2.5">
                <Checkbox
                  id={`product-${product}`}
                  checked={selectedProducts.includes(product)}
                  onCheckedChange={() => handleToggle(product, selectedProducts, onProductsChange)}
                />
                <label
                  htmlFor={`product-${product}`}
                  className="text-sm cursor-pointer flex-1 select-none"
                >
                  {product}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Brand Filter */}
      <div>
        <Label className="mb-3 block text-xs uppercase tracking-wider text-gray-500">Brand</Label>
        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filterOptions.brands.map(brand => (
              <div key={brand} className="flex items-center space-x-2.5">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={() => handleToggle(brand, selectedBrands, onBrandsChange)}
                />
                <label
                  htmlFor={`brand-${brand}`}
                  className="text-sm cursor-pointer flex-1 select-none"
                >
                  {brand}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Mobile/Tablet: Sheet overlay
  if (isCompact) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            aria-label="Open filters"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
            <div className="pr-4">
              <FilterContent />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Persistent rail
  return (
    <aside 
      className="w-72 bg-white/60 backdrop-blur-sm border-r border-slate-200/60 flex-shrink-0" 
      role="complementary" 
      aria-label="Filters"
    >
      <div className="p-6 border-b border-slate-200/60">
        <h2 className="text-sm font-semibold text-slate-900">Filters</h2>
        <p className="text-xs text-slate-500 mt-1">Refine your search results</p>
      </div>

      <ScrollArea className="h-[calc(100vh-13rem)]">
        <div className="p-6">
          <FilterContent />
        </div>
      </ScrollArea>
    </aside>
  );
}