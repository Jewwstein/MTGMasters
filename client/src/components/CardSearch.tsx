import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface CardSearchProps {
  onSearch?: (query: string, filters: SearchFilters) => void;
  className?: string;
}

export interface SearchFilters {
  colors: string[];
  types: string[];
}

const colorOptions = [
  { value: 'W', label: 'White' },
  { value: 'U', label: 'Blue' },
  { value: 'B', label: 'Black' },
  { value: 'R', label: 'Red' },
  { value: 'G', label: 'Green' },
];

const typeOptions = [
  { value: 'creature', label: 'Creature' },
  { value: 'instant', label: 'Instant' },
  { value: 'sorcery', label: 'Sorcery' },
  { value: 'enchantment', label: 'Enchantment' },
  { value: 'artifact', label: 'Artifact' },
  { value: 'planeswalker', label: 'Planeswalker' },
  { value: 'land', label: 'Land' },
];

export default function CardSearch({ onSearch, className = '' }: CardSearchProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    colors: [],
    types: [],
  });

  const handleSearch = () => {
    onSearch?.(query, filters);
  };

  const toggleFilter = (category: keyof SearchFilters, value: string) => {
    setFilters(prev => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const activeFilterCount = filters.colors.length + filters.types.length;

  return (
    <div className={`space-y-3 ${className}`} data-testid="card-search">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search for cards..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
            data-testid="input-card-search"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative" data-testid="button-filter">
              <Filter className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Colors</Label>
                <div className="grid grid-cols-2 gap-2">
                  {colorOptions.map(({ value, label }) => (
                    <div key={value} className="flex items-center gap-2">
                      <Checkbox
                        id={`color-${value}`}
                        checked={filters.colors.includes(value)}
                        onCheckedChange={() => toggleFilter('colors', value)}
                        data-testid={`checkbox-color-${value.toLowerCase()}`}
                      />
                      <Label htmlFor={`color-${value}`} className="text-sm cursor-pointer">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Card Types</Label>
                <div className="grid grid-cols-2 gap-2">
                  {typeOptions.map(({ value, label }) => (
                    <div key={value} className="flex items-center gap-2">
                      <Checkbox
                        id={`type-${value}`}
                        checked={filters.types.includes(value)}
                        onCheckedChange={() => toggleFilter('types', value)}
                        data-testid={`checkbox-type-${value}`}
                      />
                      <Label htmlFor={`type-${value}`} className="text-sm cursor-pointer">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <Button 
                onClick={() => {
                  setFilters({ colors: [], types: [] });
                }} 
                variant="outline" 
                size="sm" 
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <Button onClick={handleSearch} data-testid="button-search">
          Search
        </Button>
      </div>
    </div>
  );
}
