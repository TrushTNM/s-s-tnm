import Papa from 'papaparse';

// API service with Google Sheet data, retry logic, and config-driven schema
// NOTE: Rate and Value columns are directly pulled from the data source (Google Sheets)

export interface StockItem {
  id: string;
  brand: string;
  product: string;
  city: string;
  quantity: number;
  sellPrice: number; // Rate - pulled directly from Google Sheets
  costPrice: number; // Value - pulled directly from Google Sheets
  remarks: string;
  itemDescription: string;
  size: string;
  pattern: string;
  segment: string;
  rimAh: string;
}

export interface FilterOptions {
  cities: string[];
  brands: string[];
  products: string[];
}

export interface ApiResponse {
  data: StockItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiParams {
  search?: string;
  cities?: string[];
  brands?: string[];
  products?: string[];
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Column schema configuration
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

// Cache for the fetched data
let cachedData: StockItem[] | null = null;

const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTWGmeQneNnEBcPJA8e6oBeXDLuJ-4Xz0nvLJnLiCls4IHNzSkW5_cgA9YmHpgF2Xz0DWG7prYViY87/pub?gid=200970122&single=true&output=csv';

const fetchGoogleSheetData = async (): Promise<StockItem[]> => {
  if (cachedData) return cachedData;

  try {
    const response = await fetch(GOOGLE_SHEET_URL);
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data.map((row: any) => ({
            id: row['SKU'] || `unknown-${Math.random()}`,
            brand: row['Brand'] || '',
            product: row['Product'] || '',
            city: row['City'] || '',
            quantity: parseInt(row['Quantity']?.replace(/,/g, '') || '0', 10),
            sellPrice: parseFloat(row['Rate']?.replace(/,/g, '') || '0'),
            costPrice: parseFloat(row['Value']?.replace(/,/g, '') || '0'),
            remarks: '',
            itemDescription: row['Item Description'] || '',
            size: row['Size'] || '',
            pattern: row['Pattern'] || '',
            segment: row['Segment'] || '',
            rimAh: row['RIM/AH'] || '',
          })).filter(item => item.id && item.id !== 'unknown'); // Basic filtering of invalid rows

          cachedData = data;
          resolve(data);
        },
        error: (error: any) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Filter and sort data
const filterData = (data: StockItem[], params: ApiParams): StockItem[] => {
  let filtered = [...data];

  // Apply search
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(searchLower)
      )
    );
  }

  // Apply filters
  if (params.cities && params.cities.length > 0) {
    filtered = filtered.filter(item => params.cities!.includes(item.city));
  }
  if (params.brands && params.brands.length > 0) {
    filtered = filtered.filter(item => params.brands!.includes(item.brand));
  }
  if (params.products && params.products.length > 0) {
    filtered = filtered.filter(item => params.products!.includes(item.product));
  }

  // Apply sorting
  if (params.sortBy) {
    filtered.sort((a, b) => {
      const aVal = a[params.sortBy as keyof StockItem];
      const bVal = b[params.sortBy as keyof StockItem];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return params.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (params.sortOrder === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }

  return filtered;
};

// Retry wrapper with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delayMs = baseDelay * Math.pow(2, i);
        await delay(delayMs);
      }
    }
  }

  throw lastError!;
}

export const api = {
  // Fetch stock data with filters and pagination (with retry)
  async fetchStockData(params: ApiParams = {}): Promise<ApiResponse> {
    return withRetry(async () => {
      const data = await fetchGoogleSheetData();

      const page = params.page || 1;
      const pageSize = params.pageSize || 20;

      const filtered = filterData(data, params);
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedData = filtered.slice(start, end);

      return {
        data: paginatedData,
        total: filtered.length,
        page,
        pageSize,
      };
    });
  },

  // Get filter options
  async getFilterOptions(): Promise<FilterOptions> {
    return withRetry(async () => {
      const data = await fetchGoogleSheetData();

      const cities = Array.from(new Set(data.map(item => item.city))).sort();
      const brands = Array.from(new Set(data.map(item => item.brand))).sort();
      const products = Array.from(new Set(data.map(item => item.product))).sort();

      return { cities, brands, products };
    });
  },

  // Export data
  async exportData(ids: string[]): Promise<Blob> {
    return withRetry(async () => {
      const data = await fetchGoogleSheetData();

      const exportData = data.filter(item => ids.includes(item.id));
      if (exportData.length === 0) return new Blob([''], { type: 'text/csv' });

      const csv = [
        Object.keys(exportData[0]).join(','),
        ...exportData.map(item => Object.values(item).join(','))
      ].join('\n');

      return new Blob([csv], { type: 'text/csv' });
    });
  },

  // Update item
  async updateItem(id: string, updates: Partial<StockItem>): Promise<StockItem> {
    return withRetry(async () => {
      // Ensure data is loaded
      if (!cachedData) {
        await fetchGoogleSheetData();
      }

      if (!cachedData) throw new Error('Data not loaded');

      const itemIndex = cachedData.findIndex(item => item.id === id);
      if (itemIndex === -1) {
        throw new Error('Item not found');
      }

      cachedData[itemIndex] = { ...cachedData[itemIndex], ...updates };
      return cachedData[itemIndex];
    });
  }
};