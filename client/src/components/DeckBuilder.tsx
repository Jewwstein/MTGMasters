import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Minus, Save, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import CardSearch from './CardSearch';
import MtgCard from './MtgCard';

interface DeckCard {
  card: any;
  quantity: number;
}

export default function DeckBuilder() {
  const [deckName, setDeckName] = useState('New Deck');
  const [deck, setDeck] = useState<DeckCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState<any>({ colors: [], types: [] });
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const buildSearchUrl = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (searchFilters.colors.length > 0) {
      params.append('colors', searchFilters.colors.join(','));
    }
    if (searchFilters.types.length > 0) {
      params.append('types', searchFilters.types.join(','));
    }
    return `/api/cards/search?${params.toString()}`;
  };

  const { data: searchResults, isLoading: isSearching } = useQuery<{ data: any[] }>({
    queryKey: [buildSearchUrl()],
    enabled: hasSearched,
    staleTime: 5 * 60 * 1000,
  });

  const saveDeckMutation = useMutation({
    mutationFn: async () => {
      const deckData = {
        name: deckName,
        cards: deck.map(d => ({ id: d.card.id, quantity: d.quantity })),
        sleeveColor: 'bg-red-600',
      };
      const res = await apiRequest('POST', '/api/decks', deckData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Deck saved!',
        description: `${deckName} has been saved successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/decks'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save deck. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const addCard = (card: any) => {
    setDeck(prev => {
      const existing = prev.find(d => d.card.id === card.id);
      if (existing) {
        return prev.map(d => 
          d.card.id === card.id ? { ...d, quantity: d.quantity + 1 } : d
        );
      }
      return [...prev, { card, quantity: 1 }];
    });
  };

  const removeCard = (cardId: string) => {
    setDeck(prev => {
      const existing = prev.find(d => d.card.id === cardId);
      if (!existing) return prev;
      if (existing.quantity > 1) {
        return prev.map(d => 
          d.card.id === cardId ? { ...d, quantity: d.quantity - 1 } : d
        );
      }
      return prev.filter(d => d.card.id !== cardId);
    });
  };

  const clearDeck = () => {
    setDeck([]);
    setDeckName('New Deck');
  };

  const handleSearch = (query: string, filters: any) => {
    setSearchQuery(query);
    setSearchFilters(filters);
    setHasSearched(true);
  };

  const totalCards = deck.reduce((sum, d) => sum + d.quantity, 0);
  const cards = searchResults?.data || [];

  return (
    <div className="flex h-screen">
      <div className="w-80 border-r p-4 flex flex-col gap-4 bg-card">
        <div className="space-y-3">
          <Input
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            className="font-semibold"
            data-testid="input-deck-name"
          />
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Total: <span className="font-mono font-semibold">{totalCards}</span> cards
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => saveDeckMutation.mutate()}
                disabled={saveDeckMutation.isPending || deck.length === 0}
                data-testid="button-save-deck"
              >
                {saveDeckMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={clearDeck}
                data-testid="button-clear-deck"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-2" data-testid="deck-list">
            {deck.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                Add cards to your deck
              </div>
            ) : (
              deck.map(({ card, quantity }) => (
                <Card key={card.id} className="p-3 hover-elevate">
                  <div className="flex items-center gap-3">
                    <Badge className="w-8 text-center" data-testid={`badge-quantity-${card.id}`}>
                      {quantity}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{card.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{card.mana_cost || ''}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => addCard(card)}
                        data-testid={`button-add-${card.id}`}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => removeCard(card.id)}
                        data-testid={`button-remove-${card.id}`}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <CardSearch onSearch={handleSearch} />
          
          <div>
            <div className="text-lg font-semibold mb-4">
              Search Results
              {isSearching && (
                <Loader2 className="inline-block ml-2 w-5 h-5 animate-spin" />
              )}
            </div>
            
            {!hasSearched ? (
              <div className="text-center py-12 text-muted-foreground">
                Search for cards to add to your deck
              </div>
            ) : isSearching ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto" />
              </div>
            ) : cards.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No cards found. Try a different search.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {cards.map((card: any) => (
                  <MtgCard
                    key={card.id}
                    card={card}
                    size="small"
                    onClick={() => addCard(card)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
