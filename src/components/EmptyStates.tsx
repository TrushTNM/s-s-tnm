import { FileX, Filter, AlertTriangle, Database } from 'lucide-react';
import { Button } from './ui/button';

interface EmptyStateProps {
  variant: 'no-results' | 'no-filters' | 'api-error' | 'no-data';
  onAction?: () => void;
}

export function EmptyState({ variant, onAction }: EmptyStateProps) {
  const variants = {
    'no-results': {
      icon: FileX,
      title: 'No results found',
      description: 'Try adjusting your search or filters to find what you\'re looking for.',
      actionLabel: 'Clear filters',
    },
    'no-filters': {
      icon: Filter,
      title: 'Select filters to begin',
      description: 'Use the filter panel on the left to narrow down your stock items.',
      actionLabel: null,
    },
    'api-error': {
      icon: AlertTriangle,
      title: 'Unable to load data',
      description: 'We encountered an error while fetching your data. Please try again.',
      actionLabel: 'Retry',
    },
    'no-data': {
      icon: Database,
      title: 'No stock data available',
      description: 'There are currently no stock items in the system.',
      actionLabel: null,
    },
  };

  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-2 text-gray-900">{config.title}</h3>
      <p className="text-sm text-gray-500 max-w-md mb-6">
        {config.description}
      </p>
      {config.actionLabel && onAction && (
        <Button onClick={onAction} variant="outline">
          {config.actionLabel}
        </Button>
      )}
    </div>
  );
}
