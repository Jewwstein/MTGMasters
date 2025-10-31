import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Plus, LogIn, Loader2 } from 'lucide-react';

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [createForm, setCreateForm] = useState({
    hostName: '',
    maxPlayers: 4,
  });

  const [joinForm, setJoinForm] = useState({
    code: '',
    playerName: '',
  });

  const createLobbyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/lobbies', createForm);
      return res.json();
    },
    onSuccess: (data: { lobby: any; playerId: string }) => {
      localStorage.setItem('playerId', data.playerId);
      toast({
        title: 'Lobby created!',
        description: `Code: ${data.lobby.code}`,
      });
      setLocation(`/lobby/${data.lobby.id}`);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create lobby',
        variant: 'destructive',
      });
    },
  });

  const joinLobbyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/lobbies/join', joinForm);
      return res.json();
    },
    onSuccess: (data: { lobby: any; playerId: string }) => {
      localStorage.setItem('playerId', data.playerId);
      toast({
        title: 'Joined lobby!',
        description: `Code: ${data.lobby.code}`,
      });
      setLocation(`/lobby/${data.lobby.id}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to join lobby',
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold">MTG Playtest</h1>
          <p className="text-xl text-muted-foreground">
            Build decks, create lobbies, and play with friends
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation('/deck-builder')}>
            <CardHeader>
              <CardTitle>Deck Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Search and build your decks using the Scryfall database
              </p>
              <Button className="w-full" variant="outline">
                Build Decks
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation('/decks')}>
            <CardHeader>
              <CardTitle>My Decks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View and manage your saved decks
              </p>
              <Button className="w-full" variant="outline">
                View Decks
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Multiplayer</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="create">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">Create Lobby</TabsTrigger>
                <TabsTrigger value="join">Join Lobby</TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="hostName">Your Name</Label>
                  <Input
                    id="hostName"
                    placeholder="Enter your name"
                    value={createForm.hostName}
                    onChange={(e) => setCreateForm({ ...createForm, hostName: e.target.value })}
                    data-testid="input-host-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxPlayers">Max Players</Label>
                  <Input
                    id="maxPlayers"
                    type="number"
                    min={2}
                    max={8}
                    value={createForm.maxPlayers}
                    onChange={(e) => setCreateForm({ ...createForm, maxPlayers: parseInt(e.target.value) || 4 })}
                    data-testid="input-max-players"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => createLobbyMutation.mutate()}
                  disabled={!createForm.hostName || createLobbyMutation.isPending}
                  data-testid="button-create-lobby"
                >
                  {createLobbyMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Lobby
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="join" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Lobby Code</Label>
                  <Input
                    id="code"
                    placeholder="Enter 6-character code"
                    value={joinForm.code}
                    onChange={(e) => setJoinForm({ ...joinForm, code: e.target.value.toUpperCase() })}
                    maxLength={6}
                    data-testid="input-lobby-code"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="playerName">Your Name</Label>
                  <Input
                    id="playerName"
                    placeholder="Enter your name"
                    value={joinForm.playerName}
                    onChange={(e) => setJoinForm({ ...joinForm, playerName: e.target.value })}
                    data-testid="input-player-name"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => joinLobbyMutation.mutate()}
                  disabled={!joinForm.code || !joinForm.playerName || joinLobbyMutation.isPending}
                  data-testid="button-join-lobby"
                >
                  {joinLobbyMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Join Lobby
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
