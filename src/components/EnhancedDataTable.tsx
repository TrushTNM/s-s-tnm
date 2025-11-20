import { useRef, useEffect } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Download } from 'lucide-react';
import { StockItem, COLUMN_SCHEMA } from '../lib/api';
import { EmptyState } from './EmptyStates';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Skeleton } from './ui/skeleton';
import { TableDensity } from './DensityControl';

interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
}

interface EnhancedDataTableProps {
  data: StockItem[];
  loading: boolean;
  error: string | null;
  columns: ColumnConfig[];
  selectedRows: Set<string>;
  onSelectRow: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  onSort: (column: string) => void;
  sortBy: string | null;
  sortOrder: 'asc' | 'desc';
  onExport: () => void;
  density: TableDensity;
  infiniteScroll: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function EnhancedDataTable({
  data,
  loading,
  error,
  columns,
  selectedRows,
  onSelectRow,
  onSelectAll,
  onSort,
  sortBy,
  sortOrder,
  onExport,
  density,
  infiniteScroll,
  onLoadMore,
  hasMore = false,
}: EnhancedDataTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const visibleColumns = columns.filter(col => col.visible);
  const allSelected = data.length > 0 && data.every(item => selectedRows.has(item.id));
  const someSelected = data.some(item => selectedRows.has(item.id)) && !allSelected;

  const cellPadding = density === 'comfortable' ? 'px-4 py-3' : 'px-3 py-2';
  const fontSize = density === 'comfortable' ? 'text-sm' : 'text-xs';

  // Infinite scroll handler
  useEffect(() => {
    if (!infiniteScroll || !onLoadMore || !hasMore || loading) return;

    const container = tableContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop <= clientHeight * 1.5) {
        onLoadMore();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [infiniteScroll, onLoadMore, hasMore, loading]);

  const formatValue = (key: string, value: any): string => {
    const schema = COLUMN_SCHEMA.find(s => s.key === key);
    if (!schema) return String(value);

    if (schema.format === 'currency') {
      return `₹${value.toLocaleString('en-IN')}`;
    }
    if (schema.format === 'number') {
      return value.toLocaleString();
    }
    return String(value);
  };

  const getSortIcon = (columnKey: string) => {
    const schema = COLUMN_SCHEMA.find(s => s.key === columnKey);
    if (!schema?.sortable) return null;

    if (sortBy !== columnKey) {
      return <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="ml-2 h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="ml-2 h-3.5 w-3.5" />
    );
  };

  if (error) {
    return <EmptyState variant="api-error" onAction={() => window.location.reload()} />;
  }

  if (loading && data.length === 0) {
    return (
      <div className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100/50">
              <TableHead className={`${cellPadding} w-12`}>
                <Skeleton className="h-4 w-4" />
              </TableHead>
              {visibleColumns.map(col => (
                <TableHead key={col.key} className={cellPadding}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(8)].map((_, i) => (
              <TableRow key={i}>
                <TableCell className={cellPadding}>
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                {visibleColumns.map(col => (
                  <TableCell key={col.key} className={cellPadding}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0 && !loading) {
    return (
      <div className="border border-slate-200 rounded-2xl bg-white shadow-sm">
        <EmptyState variant="no-results" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedRows.size > 0 && (
        <div className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-xl shadow-sm">
          <span className="text-sm font-medium text-slate-700">
            {selectedRows.size} {selectedRows.size === 1 ? 'item' : 'items'} selected
          </span>
          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="gap-2 h-9 bg-white hover:bg-slate-50 border-slate-200 shadow-sm rounded-lg"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div
        ref={tableContainerRef}
        className={`border border-slate-200 rounded-2xl bg-white shadow-sm overflow-auto ${infiniteScroll ? 'max-h-[calc(100vh-20rem)]' : ''
          }`}
      >
        <Table>
          <TableHeader className="sticky top-0 bg-gradient-to-r from-slate-50 to-slate-100/50 z-10 backdrop-blur-sm">
            <TableRow className="border-b border-slate-200">
              <TableHead className={`${cellPadding} w-12`}>
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={onSelectAll}
                  aria-label="Select all rows"
                  className={someSelected ? 'data-[state=checked]:bg-slate-400' : ''}
                />
              </TableHead>
              {visibleColumns.map(col => {
                const schema = COLUMN_SCHEMA.find(s => s.key === col.key);
                return (
                  <TableHead key={col.key} className={cellPadding}>
                    {schema?.sortable ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSort(col.key)}
                        className={`-ml-3 h-7 ${fontSize} hover:bg-slate-100 font-semibold text-slate-700 rounded-lg`}
                      >
                        {col.label}
                        {getSortIcon(col.key)}
                      </Button>
                    ) : (
                      <span className={`${fontSize} font-semibold text-slate-700`}>
                        {col.label}
                      </span>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow
                key={item.id}
                className={`group hover:bg-slate-50/50 transition-colors ${selectedRows.has(item.id) ? 'bg-blue-50/50 hover:bg-blue-50/70' : ''
                  } ${index !== data.length - 1 ? 'border-b border-slate-100' : ''}`}
              >
                <TableCell className={cellPadding}>
                  <Checkbox
                    checked={selectedRows.has(item.id)}
                    onCheckedChange={() => onSelectRow(item.id)}
                    aria-label={`Select ${item.brand} ${item.product}`}
                  />
                </TableCell>
                {visibleColumns.map(col => (
                  <TableCell key={col.key} className={`${cellPadding} ${fontSize} text-slate-700`}>
                    {formatValue(col.key, item[col.key as keyof StockItem])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Infinite Scroll Loading Indicator */}
        {infiniteScroll && loading && data.length > 0 && (
          <div className="p-4 text-center border-t border-slate-100">
            <div className="inline-flex items-center gap-2 text-sm text-slate-500">
              <div className="animate-spin h-4 w-4 border-2 border-slate-300 border-t-blue-600 rounded-full" />
              Loading more...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}