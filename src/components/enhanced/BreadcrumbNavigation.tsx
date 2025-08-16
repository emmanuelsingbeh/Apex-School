import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const BreadcrumbNavigation = ({ items, className }: BreadcrumbNavigationProps) => {
  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={items[0]?.onClick}
        className="p-1 h-auto text-muted-foreground hover:text-academic-blue"
      >
        <Home className="h-4 w-4" />
      </Button>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
          {item.isActive ? (
            <span className="font-medium text-academic-navy px-2 py-1">
              {item.label}
            </span>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={item.onClick}
              className="p-1 h-auto text-muted-foreground hover:text-academic-blue transition-colors"
            >
              {item.label}
            </Button>
          )}
        </div>
      ))}
    </nav>
  );
};