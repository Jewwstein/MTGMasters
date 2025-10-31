import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const phases = [
  'Untap',
  'Upkeep', 
  'Draw',
  'Main 1',
  'Combat',
  'Main 2',
  'End'
];

export default function TurnPhaseIndicator() {
  const [currentPhase, setCurrentPhase] = useState(0);

  const nextPhase = () => {
    setCurrentPhase((prev) => (prev + 1) % phases.length);
  };

  return (
    <div className="space-y-2" data-testid="turn-phase-indicator">
      <div className="text-sm font-semibold">Turn Phase</div>
      <div className="space-y-1">
        {phases.map((phase, index) => (
          <button
            key={phase}
            onClick={() => setCurrentPhase(index)}
            className={`w-full text-left px-2 py-1 rounded-md text-xs transition-colors hover-elevate ${
              index === currentPhase 
                ? 'bg-primary text-primary-foreground font-medium' 
                : 'text-muted-foreground'
            }`}
            data-testid={`button-phase-${phase.toLowerCase().replace(' ', '-')}`}
          >
            {phase}
          </button>
        ))}
      </div>
      <Button 
        onClick={nextPhase} 
        size="sm"
        className="w-full"
        data-testid="button-next-phase"
      >
        Next
      </Button>
    </div>
  );
}
