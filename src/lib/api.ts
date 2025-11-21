import { StockItem, ApiParams, ApiResponse, FilterOptions } from './api';

// Re-export types
export type { StockItem, ApiParams, ApiResponse, FilterOptions };

export interface ColumnSchema {
  key: keyof StockItem;
  label: string;
  sortable: boolean;
  editable: boolean;
  format?: 'currency' | 'number' | 'text';
  defaultVisible: boolean;
}

export const COLUMN_SCHEMA: ColumnSchema[] = [
  { key: 'brand', label: 'Brand', sortable: true, editable: false, format: 'text', defaultVisible: true },
  { key: 'product', label: 'Product', sortable: true, editable: false, format: 'text', defaultVisible: true },
  { key: 'city', label: 'City', sortable: true, editable: false, format: 'text', defaultVisible: true },
  { key: 'segment', label: 'Segment', sortable: true, editable: false, format: 'text', defaultVisible: true },
  { key: 'rimAh', label: 'RIM/AH', sortable: true, editable: false, format: 'text', defaultVisible: true },
  { key: 'quantity', label: 'Quantity', sortable: true, editable: true, format: 'number', defaultVisible: true },
  { key: 'sellPrice', label: 'Rate', sortable: true, editable: false, format: 'currency', defaultVisible: true },
  { key: 'costPrice', label: 'Value', sortable: true, editable: false, format: 'currency', defaultVisible: true },
  { key: 'itemDescription', label: 'Item Description', sortable: true, editable: false, format: 'text', defaultVisible: true },
  { key: 'size', label: 'Size', sortable: true, editable: false, format: 'text', defaultVisible: true },
  { key: 'pattern', label: 'Pattern', sortable: true, editable: false, format: 'text', defaultVisible: true },
  { key: 'remarks', label: 'Remarks', sortable: false, editable: true, format: 'text', defaultVisible: false },
];

// API service communicating with the backend
export const api = {
  // Fetch stock data with filters and pagination
  async fetchStockData(params: ApiParams = {}): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    // Handle array params
    if (params.cities) params.cities.forEach(val => queryParams.append('cities', val));
    if (params.brands) params.brands.forEach(val => queryParams.append('brands', val));
    if (params.products) params.products.forEach(val => queryParams.append('products', val));
    if (params.segments) params.segments.forEach(val => queryParams.append('segments', val));
    if (params.rimAhs) params.rimAhs.forEach(val => queryParams.append('rimAhs', val));

    const response = await fetch(`/api/stock?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch stock data');
    }
    return response.json();
  },

  // Get filter options
  async getFilterOptions(params: ApiParams = {}): Promise<FilterOptions> {
    const queryParams = new URLSearchParams();

    // Pass current filters to get dependent options
    if (params.cities) params.cities.forEach(val => queryParams.append('cities', val));
    if (params.brands) params.brands.forEach(val => queryParams.append('brands', val));
    if (params.products) params.products.forEach(val => queryParams.append('products', val));
    if (params.segments) params.segments.forEach(val => queryParams.append('segments', val));
    if (params.rimAhs) params.rimAhs.forEach(val => queryParams.append('rimAhs', val));

    const response = await fetch(`/api/filters?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch filter options');
    }
    return response.json();
  },

  // Export data
  async exportData(ids: string[]): Promise<Blob> {
    const queryParams = new URLSearchParams();
    ids.forEach(id => queryParams.append('ids', id));

    const response = await fetch(`/api/export?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to export data');
    }
    return response.blob();
  },

  // Update item (Placeholder - backend doesn't support updates yet)
  async updateItem(id: string, updates: Partial<StockItem>): Promise<StockItem> {
    // For now, just return the updated item as if it succeeded, or throw error
    // Since we don't have a write API yet, we can simulate or throw.
    // Given the requirements, maybe we should just log it.
    console.warn('Update not implemented on backend yet');
    return { id, ...updates } as StockItem;
  }
};