import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import MtgCard from './MtgCard';

interface GameZoneProps {
  zoneName: string;
  cards: any[];
  collapsible?: boolean;
  horizontal?: boolean;
  className?: string;
  onCardClick?: (card: any) => void;
}

export default function GameZone({ 
  zoneName, 
  cards, 
  collapsible = false,
  horizontal = false,
  className = '',
  onCardClick
}: GameZoneProps) {
  const [expanded, setExpanded] = useState(!collapsible);

  return (
    <div className={`space-y-2 ${className}`} data-testid={`zone-${zoneName.toLowerCase()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-lg font-semibold">{zoneName}</div>
          <Badge variant="secondary" data-testid={`badge-card-count-${zoneName.toLowerCase()}`}>
            {cards.length}
          </Badge>
        </div>
        {collapsible && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
            data-testid={`button-toggle-${zoneName.toLowerCase()}`}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        )}
      </div>
      
      {expanded && (
        <Card className="p-4 min-h-[120px]">
          {cards.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              No cards in {zoneName.toLowerCase()}
            </div>
          ) : (
            <div className={`flex ${horizontal ? 'flex-row overflow-x-auto' : 'flex-wrap'} gap-2`}>
              {cards.map((card, index) => (
                <MtgCard
                  key={`${card.id}-${index}`}
                  card={card}
                  size="small"
                  onClick={() => onCardClick?.(card)}
                />
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
