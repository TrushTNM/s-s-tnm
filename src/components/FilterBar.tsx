import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { api, FilterOptions } from '../lib/api';
import { MultiSelectFilter } from './MultiSelectFilter';
import { Skeleton } from './ui/skeleton';

interface FilterBarProps {
    selectedCities: string[];
    selectedBrands: string[];
    selectedProducts: string[];
    onCitiesChange: (cities: string[]) => void;
    onBrandsChange: (brands: string[]) => void;
    onProductsChange: (products: string[]) => void;
    onClearAll: () => void;
    className?: string;
}

export function FilterBar({
    selectedCities,
    selectedBrands,
    selectedProducts,
    onCitiesChange,
    onBrandsChange,
    onProductsChange,
    onClearAll,
    className,
}: FilterBarProps) {
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

    const hasActiveFilters =
        selectedCities.length > 0 ||
        selectedBrands.length > 0 ||
        selectedProducts.length > 0;

    if (loading) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
            </div>
        );
    }

    return (
        <div className={`flex flex-wrap items-center gap-2 ${className}`}>
            <MultiSelectFilter
                title="City"
                options={filterOptions.cities}
                selectedValues={selectedCities}
                onSelectionChange={onCitiesChange}
            />
            <MultiSelectFilter
                title="Brand"
                options={filterOptions.brands}
                selectedValues={selectedBrands}
                onSelectionChange={onBrandsChange}
            />
            <MultiSelectFilter
                title="Product"
                options={filterOptions.products}
                selectedValues={selectedProducts}
                onSelectionChange={onProductsChange}
            />

            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="h-8 px-2 lg:px-3"
                >
                    Reset
                    <X className="ml-2 h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
