import { Settings, Eye, EyeOff, GripVertical } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';

export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
}

interface EnhancedColumnManagerProps {
  columns: ColumnConfig[];
  onToggleColumn: (key: string) => void;
  onReorderColumns: (columns: ColumnConfig[]) => void;
}

export function EnhancedColumnManager({ 
  columns, 
  onToggleColumn, 
  onReorderColumns 
}: EnhancedColumnManagerProps) {
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (dragIndex === dropIndex) return;

    const newColumns = [...columns];
    const [draggedColumn] = newColumns.splice(dragIndex, 1);
    newColumns.splice(dropIndex, 0, draggedColumn);
    
    onReorderColumns(newColumns);
  };

  const visibleCount = columns.filter(col => col.visible).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Columns ({visibleCount})</span>
          <span className="sm:hidden">{visibleCount}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Manage Columns</span>
          <span className="text-xs text-gray-500">{visibleCount} of {columns.length} visible</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs text-gray-500">
          Drag to reorder • Click to toggle
        </div>
        <ScrollArea className="max-h-96">
          {columns.map((column, index) => (
            <DropdownMenuItem
              key={column.key}
              className="flex items-center gap-2.5 cursor-move px-2 py-2.5 focus:bg-gray-100"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onSelect={(e) => e.preventDefault()}
            >
              <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <Checkbox
                id={`column-${column.key}`}
                checked={column.visible}
                onCheckedChange={() => onToggleColumn(column.key)}
                className="flex-shrink-0"
              />
              <label
                htmlFor={`column-${column.key}`}
                className="flex-1 cursor-pointer text-sm select-none"
              >
                {column.label}
              </label>
              {column.visible ? (
                <Eye className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
