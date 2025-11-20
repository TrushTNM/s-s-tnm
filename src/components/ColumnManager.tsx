import { Settings, Eye, EyeOff, GripVertical } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Checkbox } from './ui/checkbox';

export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
}

interface ColumnManagerProps {
  columns: ColumnConfig[];
  onToggleColumn: (key: string) => void;
  onReorderColumns: (columns: ColumnConfig[]) => void;
}

export function ColumnManager({ columns, onToggleColumn, onReorderColumns }: ColumnManagerProps) {
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
          Columns ({visibleCount}/{columns.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="p-2 border-b text-sm">
          <p className="mb-1">Toggle visibility or drag to reorder</p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {columns.map((column, index) => (
            <DropdownMenuItem
              key={column.key}
              className="flex items-center gap-2 cursor-move p-2"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onSelect={(e) => e.preventDefault()}
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
              <Checkbox
                id={`column-${column.key}`}
                checked={column.visible}
                onCheckedChange={() => onToggleColumn(column.key)}
              />
              <label
                htmlFor={`column-${column.key}`}
                className="flex-1 cursor-pointer"
              >
                {column.label}
              </label>
              {column.visible ? (
                <Eye className="h-4 w-4 text-gray-400" />
              ) : (
                <EyeOff className="h-4 w-4 text-gray-400" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
