import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Button } from './ui/button';
import { api, FilterOptions } from '../lib/api';
import { MultiSelectFilter } from './MultiSelectFilter';
import { Skeleton } from './ui/skeleton';

interface FilterBarProps {
    searchQuery?: string;
    selectedCities: string[];
    selectedBrands: string[];
    selectedProducts: string[];
    selectedSegments: string[];
    selectedRimAhs: string[];
    onCitiesChange: (cities: string[]) => void;
    onBrandsChange: (brands: string[]) => void;
    onProductsChange: (products: string[]) => void;
    onSegmentsChange: (segments: string[]) => void;
    onRimAhsChange: (rimAhs: string[]) => void;
    onClearAll: () => void;
    className?: string;
}

export function FilterBar({
    selectedCities,
    selectedBrands,
    selectedProducts,
    selectedSegments,
    selectedRimAhs,
    searchQuery,
    onCitiesChange,
    onBrandsChange,
    onProductsChange,
    onSegmentsChange,
    onRimAhsChange,
    onClearAll,
    className,
}: FilterBarProps) {
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        cities: [],
        brands: [],
        products: [],
        segments: [],
        rimAhs: [],
    });
    const [loading, setLoading] = useState(true);

    // Temporary state for pending filter changes
    const [pendingCities, setPendingCities] = useState<string[]>([]);
    const [pendingBrands, setPendingBrands] = useState<string[]>([]);
    const [pendingProducts, setPendingProducts] = useState<string[]>([]);
    const [pendingSegments, setPendingSegments] = useState<string[]>([]);
    const [pendingRimAhs, setPendingRimAhs] = useState<string[]>([]);

    // Initialize pending state with actual selected values
    useEffect(() => {
        setPendingCities(selectedCities);
        setPendingBrands(selectedBrands);
        setPendingProducts(selectedProducts);
        setPendingSegments(selectedSegments);
        setPendingRimAhs(selectedRimAhs);
    }, [selectedCities, selectedBrands, selectedProducts, selectedSegments, selectedRimAhs]);

    useEffect(() => {
        const loadFilterOptions = async () => {
            try {
                const options = await api.getFilterOptions({
                    search: searchQuery,
                    cities: selectedCities,
                    brands: selectedBrands,
                    products: selectedProducts,
                    segments: selectedSegments,
                    rimAhs: selectedRimAhs,
                });
                setFilterOptions(options);
            } catch (error) {
                console.error('Failed to load filter options:', error);
            } finally {
                setLoading(false);
            }
        };

        loadFilterOptions();
    }, [searchQuery, selectedCities, selectedBrands, selectedProducts, selectedSegments, selectedRimAhs]);

    const hasPendingChanges =
        JSON.stringify(pendingCities) !== JSON.stringify(selectedCities) ||
        JSON.stringify(pendingBrands) !== JSON.stringify(selectedBrands) ||
        JSON.stringify(pendingProducts) !== JSON.stringify(selectedProducts) ||
        JSON.stringify(pendingSegments) !== JSON.stringify(selectedSegments) ||
        JSON.stringify(pendingRimAhs) !== JSON.stringify(selectedRimAhs);

    const hasActiveFilters =
        selectedCities.length > 0 ||
        selectedBrands.length > 0 ||
        selectedProducts.length > 0 ||
        selectedSegments.length > 0 ||
        selectedRimAhs.length > 0;

    const handleApply = () => {
        onCitiesChange(pendingCities);
        onBrandsChange(pendingBrands);
        onProductsChange(pendingProducts);
        onSegmentsChange(pendingSegments);
        onRimAhsChange(pendingRimAhs);
    };

    const handleReset = () => {
        setPendingCities([]);
        setPendingBrands([]);
        setPendingProducts([]);
        setPendingSegments([]);
        setPendingRimAhs([]);
        onClearAll();
    };

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
                selectedValues={pendingCities}
                onSelectionChange={setPendingCities}
            />
            <MultiSelectFilter
                title="Brand"
                options={filterOptions.brands}
                selectedValues={pendingBrands}
                onSelectionChange={setPendingBrands}
            />
            <MultiSelectFilter
                title="Product"
                options={filterOptions.products}
                selectedValues={pendingProducts}
                onSelectionChange={setPendingProducts}
            />
            <MultiSelectFilter
                title="Segment"
                options={filterOptions.segments}
                selectedValues={pendingSegments}
                onSelectionChange={setPendingSegments}
            />
            <MultiSelectFilter
                title="RIM/AH"
                options={filterOptions.rimAhs}
                selectedValues={pendingRimAhs}
                onSelectionChange={setPendingRimAhs}
            />

            {hasPendingChanges && (
                <Button
                    variant="default"
                    size="sm"
                    onClick={handleApply}
                    className="h-8 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    <Check className="mr-1 h-4 w-4" />
                    Apply
                </Button>
            )}

            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="h-8 px-2 lg:px-3"
                >
                    Reset
                    <X className="ml-2 h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
