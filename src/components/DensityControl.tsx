import { LayoutGrid, List } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';

export type TableDensity = 'comfortable' | 'compact';

interface DensityControlProps {
  density: TableDensity;
  onChange: (density: TableDensity) => void;
}

export function DensityControl({ density, onChange }: DensityControlProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {density === 'comfortable' ? (
            <LayoutGrid className="h-4 w-4" />
          ) : (
            <List className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Display</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Table Density</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onChange('comfortable')}
          className={density === 'comfortable' ? 'bg-gray-100' : ''}
        >
          <LayoutGrid className="h-4 w-4 mr-2" />
          Comfortable
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onChange('compact')}
          className={density === 'compact' ? 'bg-gray-100' : ''}
        >
          <List className="h-4 w-4 mr-2" />
          Compact
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
