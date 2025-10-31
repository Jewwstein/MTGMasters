import { useState } from 'react';
import { Card } from '@/components/ui/card';

interface MtgCardProps {
  card: {
    id: string;
    name: string;
    image_uris?: {
      normal?: string;
      small?: string;
    };
    mana_cost?: string;
    type_line?: string;
    oracle_text?: string;
    power?: string;
    toughness?: string;
  };
  size?: 'small' | 'medium' | 'large';
  tapped?: boolean;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  className?: string;
}

export default function MtgCard({ 
  card, 
  size = 'medium', 
  tapped = false, 
  onClick,
  onContextMenu,
  className = ''
}: MtgCardProps) {
  const [showPreview, setShowPreview] = useState(false);

  const sizeClasses = {
    small: 'w-24',
    medium: 'w-32',
    large: 'w-40'
  };

  const imageUrl = card.image_uris?.normal || card.image_uris?.small;

  return (
    <>
      <div
        className={`relative transition-all duration-200 ${sizeClasses[size]} ${tapped ? 'rotate-90' : ''} ${className}`}
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
        onClick={onClick}
        onContextMenu={onContextMenu}
        data-testid={`card-${card.id}`}
      >
        <Card className="overflow-hidden cursor-pointer hover-elevate active-elevate-2 aspect-[5/7]">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={card.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full p-2 flex flex-col gap-2 bg-card">
              <div className="text-xs font-medium">{card.mana_cost}</div>
              <div className="text-sm font-semibold">{card.name}</div>
              <div className="text-xs text-muted-foreground">{card.type_line}</div>
              <div className="text-xs flex-1 overflow-hidden">{card.oracle_text}</div>
              {card.power && card.toughness && (
                <div className="text-xs font-mono text-right">{card.power}/{card.toughness}</div>
              )}
            </div>
          )}
        </Card>
      </div>

      {showPreview && (
        <div className="fixed right-4 top-20 z-50 pointer-events-none">
          <Card className="w-64 sm:w-80 overflow-hidden shadow-2xl">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={card.name}
                className="w-full"
              />
            ) : (
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-lg">{card.name}</div>
                  <div className="font-mono text-sm">{card.mana_cost}</div>
                </div>
                <div className="text-sm text-muted-foreground">{card.type_line}</div>
                <div className="text-sm">{card.oracle_text}</div>
                {card.power && card.toughness && (
                  <div className="text-lg font-mono font-bold text-right">{card.power}/{card.toughness}</div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
