import LibraryStack from '../LibraryStack';

export default function LibraryStackExample() {
  const mockLibrary = Array(45).fill(null).map((_, i) => ({ 
    id: `lib${i}`, 
    name: 'Card' 
  }));

  return (
    <LibraryStack 
      cards={mockLibrary}
      onCardClick={(card) => console.log('Card clicked:', card.name)}
    />
  );
}
