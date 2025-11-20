# Stock Search Dashboard - Requirements & Dependencies

## Overview
Production-grade enterprise dashboard for stock data search and management with advanced filtering, sorting, and data manipulation capabilities.

## Technical Stack

### Core Framework
- **React** 18+ - UI library
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** v4.0 - Utility-first styling framework

### Key Dependencies

#### UI Components
- `lucide-react` - Icon library for UI elements
- `sonner@2.0.3` - Toast notification system

#### Component Libraries (Built-in UI Components)
All UI primitives are located in `/components/ui/` and include:
- Dialog, Sheet, Dropdown Menu
- Table, Checkbox, Button, Input
- Badge, Label, Skeleton
- Scroll Area, Switch, Select
- Textarea, Alert

### Browser Requirements
- Modern browsers with ES6+ support
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## Feature Requirements

### 1. Data Management
- Server-side pagination (20, 50, 100 items per page)
- Multi-column sorting with ascending/descending order
- Full-text universal search across all fields
- Multi-select filtering (City, Brand, Product)
- Row selection with bulk operations
- Inline editing for Quantity and Remarks (role-gated)

### 2. Table Features
- **Columns**: Brand, Product, City, Quantity, Rate, Value, Item Description, Size, Pattern, Remarks
  - Rate and Value columns are pulled directly from Google Sheets data source with no frontend calculations
- Sticky table headers for continuous context
- Column visibility toggle
- Drag-to-reorder columns
- Density controls (comfortable/compact modes)
- Infinite scroll option (toggle)
- Hover-based quick actions (view details, edit)

### 3. Filtering & Search
- Universal search with 300ms debounce
- AND-based filter logic
- Active filter chips with one-click removal
- Clear all filters action
- Persistent filter state
- Keyboard shortcut (`/`) to focus search

### 4. UX Features
- Smart loading skeletons (no spinners)
- Context-aware empty states:
  - No results found
  - No filters selected
  - API unavailable
  - No data available
- Toast notifications for all actions
- Responsive design (desktop/tablet/mobile breakpoints)
- Auto-collapse filter panel on mobile

### 5. Data Export
- CSV export for selected rows
- Date-stamped file naming
- Bulk export support

### 6. API Integration
- RESTful API client with retry logic
- Exponential backoff (3 retries, base 1000ms)
- Error handling with user feedback
- Mock data support (250 sample items)

## Configuration

### Column Schema (`/lib/api.ts`)
```typescript
export interface ColumnSchema {
  key: keyof StockItem;
  label: string;
  sortable: boolean;
  editable: boolean;
  format?: 'currency' | 'number' | 'text';
  defaultVisible: boolean;
}
```

### API Endpoints (Mock Implementation)
- `GET /api/stock` - Fetch stock data with filters
- `GET /api/filters` - Get available filter options
- `POST /api/export` - Export selected items
- `PATCH /api/stock/:id` - Update stock item

### Query Parameters
```typescript
{
  search?: string;
  cities?: string[];
  brands?: string[];
  products?: string[];
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

## Component Architecture

### Core Components
```
App.tsx (Main Application)
├── SearchBar - Universal search with keyboard shortcuts
├── FilterRail - Collapsible multi-select filters
├── ActiveFilters - Filter chip display
├── EnhancedDataTable - Production data table
│   ├── RowActions - Hover-based quick actions
│   └── EmptyStates - Context-aware empty states
├── Pagination - Server-side pagination controls
├── EnhancedColumnManager - Column visibility & reordering
├── DensityControl - Table density toggle
└── ViewOptions - Infinite scroll toggle
```

### Reusable UI Components (`/components/ui/`)
- 40+ production-ready UI primitives
- Fully accessible (ARIA compliant)
- Keyboard navigation support
- Theme-compatible

## Responsive Breakpoints
- **Desktop**: ≥1024px - Full layout with persistent filter rail
- **Tablet**: 768px - 1023px - Compact mode with sheet overlay
- **Mobile**: <768px - Stacked layout, sheet-based filters

## Accessibility Requirements
- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus management in dialogs
- Screen reader compatible
- Contrast ratio compliance (WCAG AA)

## Performance Targets
- Initial load: <2s
- Search debounce: 300ms
- API retry delay: 1s, 2s, 4s (exponential)
- Skeleton loading for perceived performance
- Optimistic UI updates

## State Management
- React hooks (useState, useEffect, useCallback)
- Local component state
- No external state management library required
- Debounced search to reduce API calls

## Data Validation
- Type safety via TypeScript
- Runtime validation for API responses
- Input sanitization for search queries
- Number validation for quantity edits

## Security Considerations
- Role-based edit permissions (configurable)
- Input sanitization
- XSS protection via React
- API error handling without exposing internals

## Development Setup

### Prerequisites
```bash
Node.js 18+ or compatible runtime
Package manager (npm, yarn, pnpm, or bun)
```

### Installation
```bash
# Clone repository
git clone <repository-url>
cd stock-management-dashboard

# Install dependencies (auto-installed by runtime)
# No manual npm install needed in this environment
```

### Running the Application
```bash
# Start development server
# Application runs automatically in Figma Make environment
```

### Environment Variables (Optional)
```env
VITE_API_BASE_URL=https://api.example.com
VITE_ENABLE_MOCK_DATA=true
VITE_RETRY_ATTEMPTS=3
```

## API Integration Guide

### Replacing Mock API
1. Update `/lib/api.ts` endpoints
2. Replace `withRetry` wrapper calls
3. Update type definitions if needed
4. Configure authentication headers
5. Test error handling

### Example Real API Implementation
```typescript
export const api = {
  async fetchStockData(params: ApiParams): Promise<ApiResponse> {
    return withRetry(async () => {
      const response = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error('API error');
      return response.json();
    });
  },
};
```

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- No IE11 support

## Known Limitations
- Mock data (250 items) - replace with real API
- Client-side filtering in demo - use server-side in production
- No authentication layer - add as needed
- Export limited to CSV - extend for XLSX, JSON, etc.

## Future Enhancements
- Advanced filters (date ranges, numeric ranges)
- Saved filter presets
- Customizable dashboard layouts
- Real-time data updates via WebSocket
- Advanced export formats (Excel, PDF)
- Audit trail for edits
- Multi-user collaboration
- Dark mode support

## File Structure
```
/
├── App.tsx                          # Main application
├── REQUIREMENTS.md                  # This file
├── components/
│   ├── ActiveFilters.tsx           # Filter chip display
│   ├── DensityControl.tsx          # Table density toggle
│   ├── EmptyStates.tsx             # Empty state templates
│   ├── EnhancedColumnManager.tsx   # Column management
│   ├── EnhancedDataTable.tsx       # Main data table
│   ├── FilterRail.tsx              # Multi-select filters
│   ├── Pagination.tsx              # Pagination controls
│   ├── RowActions.tsx              # Row-level actions
│   ├── SearchBar.tsx               # Universal search
│   ├── ViewOptions.tsx             # View toggles
│   └── ui/                         # UI primitives (40+ components)
├── lib/
│   └── api.ts                      # API client & types
└── styles/
    └── globals.css                 # Global styles & tokens
```

## Support & Documentation
- Component usage: See individual component files
- API integration: See `/lib/api.ts`
- Styling: See `/styles/globals.css`
- Type definitions: Inline TypeScript types

## Version History
- v1.0.0 - Initial production release
  - Core table functionality
  - Advanced filtering
  - Column management
  - Export capabilities
  - Responsive design

## License
[Your License Here]

## Contact
[Your Contact Information]