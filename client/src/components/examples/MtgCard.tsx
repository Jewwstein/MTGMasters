import MtgCard from '../MtgCard';

export default function MtgCardExample() {
  const mockCard = {
    id: '1',
    name: 'Lightning Bolt',
    mana_cost: '{R}',
    type_line: 'Instant',
    oracle_text: 'Lightning Bolt deals 3 damage to any target.',
  };

  return (
    <MtgCard 
      card={mockCard} 
      onClick={() => console.log('Card clicked')}
    />
  );
}
