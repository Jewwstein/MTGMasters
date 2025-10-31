import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Users, Play, Check, X, Copy, Loader2 } from 'lucide-react';
import type { Lobby, Deck } from '@shared/schema';

export default function LobbyPage() {
  const [, params] = useRoute('/lobby/:id');
  const [, setLocation] = useLocation();
  const lobbyId = params?.id;
  const { toast } = useToast();
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    const storedPlayerId = localStorage.getItem('playerId');
    if (storedPlayerId) {
      setPlayerId(storedPlayerId);
    } else {
      toast({
        title: 'Error',
        description: 'No player ID found. Please rejoin the lobby.',
        variant: 'destructive',
      });
      setLocation('/');
    }
  }, []);

  const { data: lobby, isLoading } = useQuery<Lobby>({
    queryKey: ['/api/lobbies', lobbyId],
    enabled: !!lobbyId,
    refetchInterval: 2000,
  });

  const { data: decks = [] } = useQuery<Deck[]>({
    queryKey: ['/api/decks'],
  });

  const updatePlayerMutation = useMutation({
    mutationFn: async ({ updates }: { updates: any }) => {
      const res = await apiRequest('PATCH', `/api/lobbies/${lobbyId}/players/${playerId}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lobbies', lobbyId] });
    },
  });

  const startGameMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('PATCH', `/api/lobbies/${lobbyId}/start`, {});
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Game Started!',
        description: 'Redirecting to game...',
      });
      setLocation(`/playfield`);
    },
    onError: (error: any) => {
      toast({
        title: 'Cannot start game',
        description: error.message || 'Not all players are ready',
        variant: 'destructive',
      });
    },
  });

  const copyCode = () => {
    if (lobby) {
      navigator.clipboard.writeText(lobby.code);
      toast({
        title: 'Code copied!',
        description: 'Share this code with your friends',
      });
    }
  };

  if (isLoading || !playerId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!lobby) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Lobby not found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPlayer = lobby.players.find(p => p.id === playerId);
  if (!currentPlayer) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Player not found in lobby</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allReady = lobby.players.every(p => p.isReady);
  const canStart = lobby.players.length >= 2 && allReady && currentPlayer.isHost;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6" />
                Lobby: {lobby.code}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={copyCode} data-testid="button-copy-code">
                <Copy className="w-4 h-4 mr-2" />
                Copy Code
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div>
                Players: <span className="font-semibold">{lobby.players.length}</span> / {lobby.maxPlayers}
              </div>
              <div>
                Status: <Badge variant={lobby.status === 'waiting' ? 'secondary' : 'default'}>
                  {lobby.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lobby.players.map((player) => {
                const isCurrentPlayer = player.id === playerId;
                
                return (
                  <Card key={player.id} className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{player.name}</span>
                          {isCurrentPlayer && (
                            <Badge variant="outline" className="text-xs">You</Badge>
                          )}
                          {player.isHost && (
                            <Badge variant="outline" className="text-xs">Host</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {player.deckId ? (
                            <span>Deck: {decks.find(d => d.id === player.deckId)?.name || 'Unknown'}</span>
                          ) : (
                            <span className="text-destructive">No deck selected</span>
                          )}
                        </div>
                      </div>

                      {isCurrentPlayer && (
                        <div className="flex items-center gap-2">
                          <Select
                            value={player.deckId || ''}
                            onValueChange={(deckId) => 
                              updatePlayerMutation.mutate({ 
                                updates: { deckId: deckId || null }
                              })
                            }
                          >
                            <SelectTrigger className="w-48" data-testid="select-deck">
                              <SelectValue placeholder="Select deck" />
                            </SelectTrigger>
                            <SelectContent>
                              {decks.map((deck) => (
                                <SelectItem key={deck.id} value={deck.id}>
                                  {deck.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Button
                            variant={player.isReady ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => 
                              updatePlayerMutation.mutate({ 
                                updates: { isReady: !player.isReady }
                              })
                            }
                            disabled={!player.deckId}
                            data-testid="button-ready"
                          >
                            {player.isReady ? (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                Ready
                              </>
                            ) : (
                              <>
                                <X className="w-4 h-4 mr-1" />
                                Not Ready
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {!isCurrentPlayer && (
                        <Badge variant={player.isReady ? 'default' : 'secondary'}>
                          {player.isReady ? 'Ready' : 'Not Ready'}
                        </Badge>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {currentPlayer.isHost && lobby.status === 'waiting' && (
              <div className="mt-6">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => startGameMutation.mutate()}
                  disabled={!canStart || startGameMutation.isPending}
                  data-testid="button-start-game"
                >
                  {startGameMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Start Game
                    </>
                  )}
                </Button>
                {!canStart && (
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    {lobby.players.length < 2 
                      ? 'Waiting for more players...' 
                      : 'Waiting for all players to be ready...'}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
