import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MtgCard from './MtgCard';
import { LucideIcon } from 'lucide-react';

interface DragZoneProps {
  zoneName: string;
  icon?: LucideIcon;
  cards: any[];
  showTopCard?: boolean;
  onCardClick?: (card: any) => void;
  onDrop?: (card: any) => void;
  className?: string;
}

export default function DragZone({ 
  zoneName, 
  icon: Icon,
  cards,
  showTopCard = true,
  onCardClick,
  onDrop,
  className = ''
}: DragZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const cardData = e.dataTransfer.getData('card');
    if (cardData && onDrop) {
      onDrop(JSON.parse(cardData));
    }
  };

  const topCard = cards.length > 0 ? cards[cards.length - 1] : null;

  return (
    <Card 
      className={`p-3 min-h-[140px] transition-colors ${isDragOver ? 'border-primary bg-primary/10' : ''} ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid={`drag-zone-${zoneName.toLowerCase()}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
          <div className="text-sm font-semibold">{zoneName}</div>
        </div>
        <Badge variant="secondary" className="text-xs" data-testid={`badge-count-${zoneName.toLowerCase()}`}>
          {cards.length}
        </Badge>
      </div>
      
      <div className="flex items-center justify-center min-h-[80px]">
        {cards.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center">
            Empty
          </div>
        ) : showTopCard && topCard ? (
          <MtgCard
            card={topCard}
            size="small"
            onClick={() => onCardClick?.(topCard)}
            className="scale-75"
          />
        ) : (
          <div className="text-center">
            <div className="text-2xl font-mono font-bold">{cards.length}</div>
            <div className="text-xs text-muted-foreground">cards</div>
          </div>
        )}
      </div>
    </Card>
  );
}
