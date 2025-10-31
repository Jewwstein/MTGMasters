import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const manaSymbols = [
  { symbol: 'W', label: 'White', color: 'bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-700' },
  { symbol: 'U', label: 'Blue', color: 'bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700' },
  { symbol: 'B', label: 'Black', color: 'bg-slate-100 dark:bg-slate-900 border-slate-400 dark:border-slate-600' },
  { symbol: 'R', label: 'Red', color: 'bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700' },
  { symbol: 'G', label: 'Green', color: 'bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-700' },
  { symbol: 'C', label: 'Colorless', color: 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600' },
];

export default function ManaPool() {
  const [mana, setMana] = useState<Record<string, number>>({});

  const addMana = (symbol: string) => {
    setMana(prev => ({ ...prev, [symbol]: (prev[symbol] || 0) + 1 }));
  };

  const removeMana = (symbol: string) => {
    setMana(prev => {
      const newMana = { ...prev };
      if (newMana[symbol] > 1) {
        newMana[symbol]--;
      } else {
        delete newMana[symbol];
      }
      return newMana;
    });
  };

  const clearPool = () => {
    setMana({});
  };

  return (
    <div className="space-y-3" data-testid="mana-pool">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Mana Pool</div>
        {Object.keys(mana).length > 0 && (
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={clearPool}
            data-testid="button-clear-mana"
          >
            Clear
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {manaSymbols.map(({ symbol, label, color }) => (
          <Button
            key={symbol}
            size="sm"
            variant="outline"
            className={`relative ${color}`}
            onClick={() => addMana(symbol)}
            onContextMenu={(e) => {
              e.preventDefault();
              if (mana[symbol]) removeMana(symbol);
            }}
            data-testid={`button-mana-${symbol.toLowerCase()}`}
          >
            <span className="font-mono font-bold">{symbol}</span>
            {mana[symbol] && (
              <Badge 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                data-testid={`badge-mana-count-${symbol.toLowerCase()}`}
              >
                {mana[symbol]}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
