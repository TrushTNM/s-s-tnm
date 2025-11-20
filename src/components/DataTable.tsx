import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Download, Edit } from 'lucide-react';
import { StockItem } from '../lib/api';
import { ColumnConfig } from './ColumnManager';
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
import { Alert, AlertDescription } from './ui/alert';

interface DataTableProps {
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
  onEdit: () => void;
}

export function DataTable({
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
  onEdit,
}: DataTableProps) {
  const visibleColumns = columns.filter(col => col.visible);
  const allSelected = data.length > 0 && data.every(item => selectedRows.has(item.id));
  const someSelected = data.some(item => selectedRows.has(item.id)) && !allSelected;

  const formatValue = (key: string, value: any): string => {
    if (key === 'sellPrice' || key === 'costPrice') {
      return `$${value.toLocaleString()}`;
    }
    if (key === 'lastUpdated') {
      return new Date(value).toLocaleDateString();
    }
    return String(value);
  };

  const getSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (loading && data.length === 0) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Skeleton className="h-4 w-4" />
              </TableHead>
              {visibleColumns.map(col => (
                <TableHead key={col.key}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(10)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                {visibleColumns.map(col => (
                  <TableCell key={col.key}>
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
      <div className="border rounded-lg p-12 text-center">
        <p className="text-gray-500">No results found</p>
        <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedRows.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm">
            {selectedRows.size} row{selectedRows.size > 1 ? 's' : ''} selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="gap-2 ml-auto"
          >
            <Download className="h-4 w-4" />
            Export Selected
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Bulk Edit
          </Button>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={onSelectAll}
                    aria-label="Select all rows"
                    className={someSelected ? 'data-[state=checked]:bg-gray-400' : ''}
                  />
                </TableHead>
                {visibleColumns.map(col => (
                  <TableHead key={col.key}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSort(col.key)}
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                    >
                      {col.label}
                      {getSortIcon(col.key)}
                    </Button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map(item => (
                <TableRow
                  key={item.id}
                  className={selectedRows.has(item.id) ? 'bg-blue-50' : ''}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.has(item.id)}
                      onCheckedChange={() => onSelectRow(item.id)}
                      aria-label={`Select row ${item.sku}`}
                    />
                  </TableCell>
                  {visibleColumns.map(col => (
                    <TableCell key={col.key}>
                      {formatValue(col.key, item[col.key as keyof StockItem])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
