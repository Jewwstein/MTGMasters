import DragZone from '../DragZone';
import { Archive } from 'lucide-react';

export default function DragZoneExample() {
  const mockCards = [
    { id: '1', name: 'Lightning Bolt', mana_cost: '{R}', type_line: 'Instant' },
    { id: '2', name: 'Counterspell', mana_cost: '{U}{U}', type_line: 'Instant' },
  ];

  return (
    <DragZone 
      zoneName="Graveyard" 
      icon={Archive}
      cards={mockCards}
      onCardClick={(card) => console.log('Card clicked:', card.name)}
    />
  );
}
