import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface LibraryStackProps {
  cards: any[];
  sleeveColor?: string;
  onCardClick?: (card: any) => void;
  onDrop?: (card: any) => void;
  className?: string;
}

const sleeveColors = [
  { name: 'Red', color: 'bg-red-600', border: 'border-red-800' },
  { name: 'Blue', color: 'bg-blue-600', border: 'border-blue-800' },
  { name: 'Green', color: 'bg-green-600', border: 'border-green-800' },
  { name: 'Black', color: 'bg-gray-900', border: 'border-gray-950' },
  { name: 'Purple', color: 'bg-purple-600', border: 'border-purple-800' },
  { name: 'Orange', color: 'bg-orange-600', border: 'border-orange-800' },
  { name: 'Pink', color: 'bg-pink-600', border: 'border-pink-800' },
];

export default function LibraryStack({ 
  cards,
  sleeveColor = 'bg-red-600',
  onCardClick,
  onDrop,
  className = ''
}: LibraryStackProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedSleeve, setSelectedSleeve] = useState(sleeveColor);

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

  const selectedSleeveStyle = sleeveColors.find(s => s.color === selectedSleeve) || sleeveColors[0];

  return (
    <Card 
      className={`p-3 min-h-[140px] transition-colors ${isDragOver ? 'border-primary bg-primary/10' : ''} ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid="library-stack"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          <div className="text-sm font-semibold">Library</div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs" data-testid="badge-library-count">
            {cards.length}
          </Badge>
          <Popover>
            <PopoverTrigger asChild>
              <button 
                className={`w-5 h-5 rounded-sm ${selectedSleeveStyle.color} border ${selectedSleeveStyle.border} hover-elevate`}
                data-testid="button-sleeve-color"
              />
            </PopoverTrigger>
            <PopoverContent className="w-48" align="end">
              <div className="space-y-2">
                <div className="text-sm font-semibold">Card Sleeve</div>
                <div className="grid grid-cols-4 gap-2">
                  {sleeveColors.map(sleeve => (
                    <button
                      key={sleeve.name}
                      onClick={() => setSelectedSleeve(sleeve.color)}
                      className={`w-8 h-10 rounded-sm ${sleeve.color} border-2 ${
                        selectedSleeve === sleeve.color 
                          ? 'border-primary ring-2 ring-primary' 
                          : sleeve.border
                      } hover-elevate transition-all`}
                      title={sleeve.name}
                      data-testid={`button-sleeve-${sleeve.name.toLowerCase()}`}
                    />
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="flex items-center justify-center min-h-[80px] relative">
        {cards.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center">
            Empty
          </div>
        ) : (
          <div className="relative w-20" style={{ height: '112px' }}>
            {/* Stack of cards - showing depth */}
            {[...Array(Math.min(5, cards.length))].map((_, i) => (
              <div
                key={i}
                className={`absolute w-full h-full rounded-lg border-2 ${selectedSleeveStyle.border} ${selectedSleeveStyle.color} shadow-md`}
                style={{
                  top: `${i * 2}px`,
                  left: `${i * 1.5}px`,
                  zIndex: 5 - i,
                  transform: `rotate(${i * 0.5}deg)`,
                }}
              >
                {i === 0 && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-xs font-bold text-white/30 rotate-90">MTG</div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Card count indicator */}
            {cards.length > 5 && (
              <div 
                className="absolute bottom-0 right-0 text-xs font-mono font-bold text-foreground bg-background/80 px-1.5 py-0.5 rounded"
                style={{ zIndex: 10 }}
              >
                +{cards.length - 5}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
