import GameZone from '../GameZone';

export default function GameZoneExample() {
  const mockCards = [
    { id: '1', name: 'Lightning Bolt', mana_cost: '{R}', type_line: 'Instant' },
    { id: '2', name: 'Counterspell', mana_cost: '{U}{U}', type_line: 'Instant' },
    { id: '3', name: 'Giant Growth', mana_cost: '{G}', type_line: 'Instant' },
  ];

  return (
    <GameZone 
      zoneName="Hand" 
      cards={mockCards}
      onCardClick={(card) => console.log('Card clicked:', card.name)}
    />
  );
}
