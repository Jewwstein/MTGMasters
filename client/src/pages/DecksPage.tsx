import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import type { Deck } from '@shared/schema';

export default function DecksPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: decks = [], isLoading } = useQuery<Deck[]>({
    queryKey: ['/api/decks'],
  });

  const deleteDeckMutation = useMutation({
    mutationFn: async (deckId: string) => {
      const res = await apiRequest('DELETE', `/api/decks/${deckId}`, undefined);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Deck deleted',
        description: 'Deck has been removed',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/decks'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete deck',
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Decks</h1>
            <p className="text-muted-foreground">
              {decks.length} {decks.length === 1 ? 'deck' : 'decks'} saved
            </p>
          </div>
          <Button onClick={() => setLocation('/deck-builder')} data-testid="button-new-deck">
            <Plus className="w-4 h-4 mr-2" />
            New Deck
          </Button>
        </div>

        {decks.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  You haven't created any decks yet
                </p>
                <Button onClick={() => setLocation('/deck-builder')}>
                  Create Your First Deck
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck) => {
              const cardCount = deck.cards.reduce((sum, card) => sum + card.quantity, 0);
              
              return (
                <Card key={deck.id} className="hover-elevate" data-testid={`deck-${deck.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{deck.name}</CardTitle>
                      <div className={`w-6 h-6 rounded ${deck.sleeveColor || 'bg-red-600'} border border-border`} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Cards</span>
                      <Badge>{cardCount}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Unique Cards</span>
                      <Badge variant="outline">{deck.cards.length}</Badge>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setLocation('/deck-builder')}
                        data-testid={`button-edit-${deck.id}`}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteDeckMutation.mutate(deck.id)}
                        disabled={deleteDeckMutation.isPending}
                        data-testid={`button-delete-${deck.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
