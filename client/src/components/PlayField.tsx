import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import DragZone from './DragZone';
import LibraryStack from './LibraryStack';
import LifeCounter from './LifeCounter';
import ManaPool from './ManaPool';
import TurnPhaseIndicator from './TurnPhaseIndicator';
import MtgCard from './MtgCard';
import { Shuffle, ArrowDown, RotateCw, Archive, Flame, Crown } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  life: number;
  hand: any[];
  battlefield: any[];
  graveyard: any[];
  exile: any[];
  library: any[];
  commandZone: any[];
}

export default function PlayField() {
  const [players] = useState<Player[]>([
    {
      id: '1',
      name: 'You',
      life: 20,
      hand: [
        { id: 'h1', name: 'Lightning Bolt', mana_cost: '{R}', type_line: 'Instant' },
        { id: 'h2', name: 'Mountain', type_line: 'Land' },
        { id: 'h3', name: 'Shock', mana_cost: '{R}', type_line: 'Instant' },
      ],
      battlefield: [
        { id: 'b1', name: 'Grizzly Bears', mana_cost: '{1}{G}', type_line: 'Creature', power: '2', toughness: '2' },
        { id: 'b2', name: 'Forest', type_line: 'Land' },
      ],
      graveyard: [],
      exile: [],
      library: Array(45).fill(null).map((_, i) => ({ id: `lib${i}`, name: 'Card' })),
      commandZone: [
        { id: 'cmd1', name: 'Omnath, Locus of Mana', mana_cost: '{2}{G}', type_line: 'Legendary Creature', power: '*', toughness: '*' },
      ],
    },
    {
      id: '2',
      name: 'Opponent',
      life: 18,
      hand: Array(5).fill(null).map((_, i) => ({ id: `oh${i}`, name: 'Hidden Card' })),
      battlefield: [
        { id: 'ob1', name: 'Serra Angel', mana_cost: '{3}{W}{W}', type_line: 'Creature', power: '4', toughness: '4' },
        { id: 'ob2', name: 'Plains', type_line: 'Land' },
        { id: 'ob3', name: 'Plains', type_line: 'Land' },
      ],
      graveyard: [
        { id: 'og1', name: 'Healing Salve', mana_cost: '{W}', type_line: 'Instant' },
      ],
      exile: [],
      library: Array(42).fill(null).map((_, i) => ({ id: `olib${i}`, name: 'Card' })),
      commandZone: [],
    },
  ]);

  const [currentPlayer] = useState(0);
  const displayOrder = [players[1], players[0]]; // Opponent first, then current player

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b p-3 flex items-center justify-between gap-4 bg-card">
        <div className="flex items-center gap-3">
          <div className="text-lg font-bold">MTG Playtest</div>
          <Separator orientation="vertical" className="h-6" />
          <div className="text-sm text-muted-foreground">
            Playing as: <span className="font-semibold text-foreground">{players[currentPlayer].name}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" data-testid="button-shuffle">
            <Shuffle className="w-4 h-4 mr-2" />
            Shuffle
          </Button>
          <Button variant="outline" size="sm" data-testid="button-draw">
            <ArrowDown className="w-4 h-4 mr-2" />
            Draw
          </Button>
          <Button variant="outline" size="sm" data-testid="button-untap">
            <RotateCw className="w-4 h-4 mr-2" />
            Untap All
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-rows-2">
          {displayOrder.map((player, index) => (
            <div 
              key={player.id} 
              className={`overflow-auto ${index === 0 ? 'border-b' : ''}`}
              data-testid={`player-area-${player.id}`}
            >
              <div className="h-full p-3 grid grid-cols-[200px_1fr_180px] gap-3">
                <div className="space-y-3">
                  <Card className="p-3 space-y-3">
                    <div className="text-lg font-bold">{player.name}</div>
                    <LifeCounter 
                      playerName="Life" 
                      initialLife={player.life} 
                      compact 
                    />
                  </Card>

                  <LibraryStack
                    cards={player.library}
                    sleeveColor={index === 0 ? 'bg-blue-600' : 'bg-red-600'}
                  />

                  <DragZone
                    zoneName="Graveyard"
                    icon={Archive}
                    cards={player.graveyard}
                  />

                  <DragZone
                    zoneName="Exile"
                    icon={Flame}
                    cards={player.exile}
                  />
                </div>

                <Card className="p-4 bg-background/50">
                  <div className="text-sm font-semibold mb-3 text-muted-foreground">Battlefield</div>
                  <div className="flex flex-wrap gap-3 min-h-[200px]">
                    {player.battlefield.length === 0 ? (
                      <div className="w-full text-center text-sm text-muted-foreground py-8">
                        No permanents on battlefield
                      </div>
                    ) : (
                      player.battlefield.map(card => (
                        <MtgCard
                          key={card.id}
                          card={card}
                          size="small"
                          onClick={() => console.log('Card clicked:', card.name)}
                        />
                      ))
                    )}
                  </div>
                </Card>

                <div className="space-y-3">
                  <DragZone
                    zoneName="Command Zone"
                    icon={Crown}
                    cards={player.commandZone}
                  />

                  <Card className="p-3 space-y-3">
                    <ManaPool />
                  </Card>

                  <Card className="p-3">
                    <TurnPhaseIndicator />
                  </Card>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t bg-card">
        <ScrollArea className="h-40">
          <div className="p-3">
            <div className="text-sm font-semibold mb-3 text-muted-foreground">Your Hand</div>
            <div className="flex gap-3">
              {players[currentPlayer].hand.map(card => (
                <MtgCard
                  key={card.id}
                  card={card}
                  size="medium"
                  onClick={() => console.log('Playing card:', card.name)}
                />
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
