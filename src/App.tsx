import { useState, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'sonner';
import { Search } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { FilterBar } from './components/FilterBar';
import { EnhancedDataTable } from './components/EnhancedDataTable';
import { Pagination } from './components/Pagination';
import { EnhancedColumnManager } from './components/EnhancedColumnManager';
import { DensityControl, TableDensity } from './components/DensityControl';
import { ViewOptions } from './components/ViewOptions';
import { api, StockItem, COLUMN_SCHEMA } from './lib/api';

interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
}

const DEFAULT_COLUMNS: ColumnConfig[] = COLUMN_SCHEMA.map(schema => ({
  key: schema.key,
  label: schema.label,
  visible: schema.defaultVisible,
}));

export default function App() {
  // Responsive state
  const [isCompactView, setIsCompactView] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [selectedRimAhs, setSelectedRimAhs] = useState<string[]>([]);

  // Table state
  const [data, setData] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  // Sorting state
  const [sortBy, setSortBy] = useState<string | null>('sku');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // View state
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [density, setDensity] = useState<TableDensity>('comfortable');
  const [infiniteScroll, setInfiniteScroll] = useState(false);

  // Responsive breakpoint handling
  useEffect(() => {
    const checkViewport = () => {
      setIsCompactView(window.innerWidth < 1024);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.fetchStockData({
        search: debouncedSearch,
        cities: selectedCities,
        brands: selectedBrands,
        products: selectedProducts,
        segments: selectedSegments,
        rimAhs: selectedRimAhs,
        page: currentPage,
        pageSize: infiniteScroll ? 50 : pageSize,
        sortBy: sortBy || undefined,
        sortOrder,
      });

      if (infiniteScroll && currentPage > 1) {
        setData(prev => [...prev, ...response.data]);
      } else {
        setData(response.data);
      }
      setTotalItems(response.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCities, selectedBrands, selectedProducts, selectedSegments, selectedRimAhs, currentPage, pageSize, sortBy, sortOrder, infiniteScroll]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCities, selectedBrands, selectedProducts, selectedSegments, selectedRimAhs]);

  // Reset infinite scroll data when switching modes
  useEffect(() => {
    setCurrentPage(1);
    setData([]);
  }, [infiniteScroll]);

  // Handlers
  const handleClearAllFilters = () => {
    setSelectedCities([]);
    setSelectedBrands([]);
    setSelectedProducts([]);
    setSelectedSegments([]);
    setSelectedRimAhs([]);
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(data.map(item => item.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleToggleColumn = (key: string) => {
    setColumns(columns.map(col =>
      col.key === key ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleReorderColumns = (newColumns: ColumnConfig[]) => {
    setColumns(newColumns);
  };

  const handleExport = async () => {
    try {
      const loadingToast = toast.loading('Preparing export...');
      const blob = await api.exportData(Array.from(selectedRows));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stock-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.dismiss(loadingToast);
      toast.success(`Exported ${selectedRows.size} items`);
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const handleLoadMore = () => {
    if (infiniteScroll && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize);
  const hasMore = infiniteScroll && data.length < totalItems;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Toaster position="top-right" richColors />

      {/* Top Bar */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-4 lg:px-6 py-4 flex-shrink-0 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
              <Search className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Stock Search</h1>
              <p className="text-xs text-slate-500 mt-0.5">Search and manage inventory</p>
            </div>
          </div>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <div className="flex items-center gap-2">
            <ViewOptions
              infiniteScroll={infiniteScroll}
              onInfiniteScrollChange={setInfiniteScroll}
            />
            <DensityControl density={density} onChange={setDensity} />
            <EnhancedColumnManager
              columns={columns}
              onToggleColumn={handleToggleColumn}
              onReorderColumns={handleReorderColumns}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 lg:px-6 lg:pt-6 pb-0">
            <FilterBar
              searchQuery={debouncedSearch}
              selectedCities={selectedCities}
              selectedBrands={selectedBrands}
              selectedProducts={selectedProducts}
              selectedSegments={selectedSegments}
              selectedRimAhs={selectedRimAhs}
              onCitiesChange={setSelectedCities}
              onBrandsChange={setSelectedBrands}
              onProductsChange={setSelectedProducts}
              onSegmentsChange={setSelectedSegments}
              onRimAhsChange={setSelectedRimAhs}
              onClearAll={handleClearAllFilters}
            />
          </div>

          {/* Data Table */}
          <div className={`flex-1 ${infiniteScroll ? 'overflow-hidden' : 'overflow-auto'} p-4 lg:p-6`}>
            <EnhancedDataTable
              data={data}
              loading={loading}
              error={error}
              columns={columns}
              selectedRows={selectedRows}
              onSelectRow={handleSelectRow}
              onSelectAll={handleSelectAll}
              onSort={handleSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onExport={handleExport}
              density={density}
              infiniteScroll={infiniteScroll}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
            />
          </div>

          {/* Pagination - Only show when not using infinite scroll */}
          {!infiniteScroll && totalItems > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </main>
      </div>
    </div>
  );
}