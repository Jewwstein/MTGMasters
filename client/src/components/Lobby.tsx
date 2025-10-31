import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Copy, Check, Crown, User } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  selectedDeck?: string;
}

export default function Lobby() {
  const [lobbyCode] = useState('ABC-123');
  const [copied, setCopied] = useState(false);
  const [players] = useState<Player[]>([
    { id: '1', name: 'Player 1', isHost: true, isReady: true, selectedDeck: 'Goblins' },
    { id: '2', name: 'Player 2', isHost: false, isReady: false },
    { id: '3', name: 'Player 3', isHost: false, isReady: true, selectedDeck: 'Control' },
  ]);

  const copyLobbyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/lobby/${lobbyCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allReady = players.every(p => p.isReady);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Game Lobby</h1>
          <p className="text-muted-foreground">Share the lobby code with your friends</p>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                value={`${window.location.origin}/lobby/${lobbyCode}`}
                readOnly
                className="font-mono"
                data-testid="input-lobby-link"
              />
            </div>
            <Button onClick={copyLobbyLink} data-testid="button-copy-link">
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </Card>

        <div>
          <div className="text-lg font-semibold mb-4">
            Players ({players.length})
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {players.map(player => (
              <Card key={player.id} className="p-4" data-testid={`card-player-${player.id}`}>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      <User className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium truncate">{player.name}</div>
                      {player.isHost && (
                        <Crown className="w-4 h-4 text-primary" data-testid="icon-host" />
                      )}
                    </div>
                    <Select defaultValue={player.selectedDeck}>
                      <SelectTrigger className="h-8 text-xs" data-testid={`select-deck-${player.id}`}>
                        <SelectValue placeholder="Select deck" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="goblins">Goblins</SelectItem>
                        <SelectItem value="control">Control</SelectItem>
                        <SelectItem value="elves">Elves</SelectItem>
                        <SelectItem value="burn">Burn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Badge 
                      variant={player.isReady ? 'default' : 'secondary'}
                      data-testid={`badge-ready-${player.id}`}
                    >
                      {player.isReady ? 'Ready' : 'Waiting'}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            className="flex-1"
            size="lg"
            disabled={!allReady}
            data-testid="button-start-game"
          >
            Start Game
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            data-testid="button-leave-lobby"
          >
            Leave Lobby
          </Button>
        </div>
      </div>
    </div>
  );
}
