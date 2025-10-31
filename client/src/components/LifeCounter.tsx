import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface LifeCounterProps {
  playerName: string;
  initialLife?: number;
  compact?: boolean;
  className?: string;
}

export default function LifeCounter({ 
  playerName, 
  initialLife = 20,
  compact = false,
  className = '' 
}: LifeCounterProps) {
  const [life, setLife] = useState(initialLife);

  const adjustLife = (amount: number) => {
    setLife(prev => Math.max(0, prev + amount));
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`} data-testid="life-counter">
        <div className="text-xs text-muted-foreground">{playerName}</div>
        <Button 
          size="icon" 
          variant="outline"
          className="h-7 w-7"
          onClick={() => adjustLife(-1)}
          data-testid="button-decrease-life"
        >
          <Minus className="w-3 h-3" />
        </Button>
        <div className="text-3xl font-mono font-bold min-w-[60px] text-center" data-testid="text-life-total">
          {life}
        </div>
        <Button 
          size="icon" 
          variant="outline"
          className="h-7 w-7"
          onClick={() => adjustLife(1)}
          data-testid="button-increase-life"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-4 p-6 ${className}`} data-testid="life-counter">
      <div className="text-lg font-medium">{playerName}</div>
      <div className="flex items-center gap-4">
        <Button 
          size="icon" 
          variant="outline"
          onClick={() => adjustLife(-1)}
          data-testid="button-decrease-life"
        >
          <Minus className="w-5 h-5" />
        </Button>
        <div className="text-6xl font-mono font-bold min-w-[120px] text-center" data-testid="text-life-total">
          {life}
        </div>
        <Button 
          size="icon" 
          variant="outline"
          onClick={() => adjustLife(1)}
          data-testid="button-increase-life"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="secondary"
          onClick={() => adjustLife(-5)}
          data-testid="button-decrease-5"
        >
          -5
        </Button>
        <Button 
          size="sm" 
          variant="secondary"
          onClick={() => adjustLife(5)}
          data-testid="button-increase-5"
        >
          +5
        </Button>
      </div>
    </div>
  );
}
