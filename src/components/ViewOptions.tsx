import { Infinity } from 'lucide-react';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Settings2 } from 'lucide-react';

interface ViewOptionsProps {
  infiniteScroll: boolean;
  onInfiniteScrollChange: (enabled: boolean) => void;
}

export function ViewOptions({ infiniteScroll, onInfiniteScrollChange }: ViewOptionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          <span className="hidden sm:inline">View</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>View Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Infinity className="h-4 w-4" />
              <Label htmlFor="infinite-scroll" className="cursor-pointer">
                Infinite Scroll
              </Label>
            </div>
            <Switch
              id="infinite-scroll"
              checked={infiniteScroll}
              onCheckedChange={onInfiniteScrollChange}
            />
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
