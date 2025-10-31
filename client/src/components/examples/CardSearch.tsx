import CardSearch from '../CardSearch';

export default function CardSearchExample() {
  return (
    <CardSearch 
      onSearch={(query, filters) => console.log('Search:', query, filters)}
    />
  );
}
