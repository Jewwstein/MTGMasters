import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertDeckSchema, createLobbySchema, joinLobbySchema, updatePlayerSchema, type Player } from "@shared/schema";
import { z } from "zod";
import { randomBytes } from "crypto";

const updateDeckSchema = z.object({
  name: z.string().optional(),
  cards: z.array(z.object({
    id: z.string(),
    quantity: z.number().int().positive(),
  })).optional(),
  sleeveColor: z.string().optional(),
});

async function generateUniqueLobbyCode(): Promise<string> {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    const codeBytes = randomBytes(6);
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[codeBytes[i] % chars.length];
    }
    
    const existing = await storage.getLobbyByCode(code);
    if (!existing) {
      return code;
    }
    
    attempts++;
  }
  
  throw new Error('Failed to generate unique lobby code');
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Scryfall API proxy routes
  app.get("/api/cards/search", async (req, res) => {
    try {
      const { q, colors, types, page = 1 } = req.query;
      
      let query = q as string || '';
      const queryParts: string[] = [];
      
      if (query) {
        queryParts.push(query);
      }
      
      if (colors && typeof colors === 'string') {
        const colorArray = colors.split(',').filter(Boolean);
        if (colorArray.length > 0) {
          colorArray.forEach(c => {
            queryParts.push(`c:${c}`);
          });
        }
      }
      
      if (types && typeof types === 'string') {
        const typeArray = types.split(',').filter(Boolean);
        if (typeArray.length > 0) {
          const typeQuery = typeArray.map(t => `t:${t}`).join(' OR ');
          queryParts.push(`(${typeQuery})`);
        }
      }
      
      const finalQuery = queryParts.length > 0 ? queryParts.join(' ') : 'type:creature';
      
      const scryfallUrl = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(finalQuery)}&page=${page}`;
      const response = await fetch(scryfallUrl);
      
      if (!response.ok) {
        if (response.status === 404) {
          return res.json({ data: [], has_more: false, total_cards: 0 });
        }
        throw new Error(`Scryfall API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('Card search error:', error);
      res.status(500).json({ error: error.message || 'Failed to search cards' });
    }
  });

  app.get("/api/cards/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const response = await fetch(`https://api.scryfall.com/cards/${id}`);
      
      if (!response.ok) {
        throw new Error(`Scryfall API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('Card fetch error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch card' });
    }
  });

  // Deck management routes
  app.post("/api/decks", async (req, res) => {
    try {
      const deckData = insertDeckSchema.parse(req.body);
      const deck = await storage.createDeck(deckData);
      res.json(deck);
    } catch (error: any) {
      console.error('Create deck error:', error);
      res.status(400).json({ error: error.message || 'Failed to create deck' });
    }
  });

  app.get("/api/decks", async (req, res) => {
    try {
      const decks = await storage.getAllDecks();
      res.json(decks);
    } catch (error: any) {
      console.error('Get decks error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch decks' });
    }
  });

  app.get("/api/decks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deck = await storage.getDeck(id);
      
      if (!deck) {
        return res.status(404).json({ error: 'Deck not found' });
      }
      
      res.json(deck);
    } catch (error: any) {
      console.error('Get deck error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch deck' });
    }
  });

  app.patch("/api/decks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = updateDeckSchema.parse(req.body);
      
      const deck = await storage.updateDeck(id, updates);
      
      if (!deck) {
        return res.status(404).json({ error: 'Deck not found' });
      }
      
      res.json(deck);
    } catch (error: any) {
      console.error('Update deck error:', error);
      res.status(400).json({ error: error.message || 'Failed to update deck' });
    }
  });

  app.delete("/api/decks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteDeck(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Deck not found' });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('Delete deck error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete deck' });
    }
  });

  // Lobby management routes
  app.post("/api/lobbies", async (req, res) => {
    try {
      const { hostName, maxPlayers } = createLobbySchema.parse(req.body);
      
      const code = await generateUniqueLobbyCode();
      const hostPlayer: Player = {
        id: randomBytes(16).toString('hex'),
        name: hostName,
        deckId: null,
        isReady: false,
        isHost: true,
      };
      
      const lobby = await storage.createLobby({
        code,
        hostId: hostPlayer.id,
        players: [hostPlayer],
        maxPlayers: maxPlayers || 4,
        status: 'waiting',
      });
      
      res.json({ lobby, playerId: hostPlayer.id });
    } catch (error: any) {
      console.error('Create lobby error:', error);
      res.status(400).json({ error: error.message || 'Failed to create lobby' });
    }
  });

  app.post("/api/lobbies/join", async (req, res) => {
    try {
      const { code, playerName } = joinLobbySchema.parse(req.body);
      
      const lobby = await storage.getLobbyByCode(code.toUpperCase());
      if (!lobby) {
        return res.status(404).json({ error: 'Lobby not found' });
      }
      
      if (lobby.status !== 'waiting') {
        return res.status(400).json({ error: 'Lobby is not accepting players' });
      }
      
      if (lobby.players.length >= lobby.maxPlayers) {
        return res.status(400).json({ error: 'Lobby is full' });
      }
      
      const newPlayer: Player = {
        id: randomBytes(16).toString('hex'),
        name: playerName,
        deckId: null,
        isReady: false,
        isHost: false,
      };
      
      const updatedLobby = await storage.addPlayerToLobby(lobby.id, newPlayer);
      
      if (!updatedLobby) {
        return res.status(500).json({ error: 'Failed to join lobby' });
      }
      
      res.json({ lobby: updatedLobby, playerId: newPlayer.id });
    } catch (error: any) {
      console.error('Join lobby error:', error);
      res.status(400).json({ error: error.message || 'Failed to join lobby' });
    }
  });

  app.get("/api/lobbies", async (req, res) => {
    try {
      const lobbies = await storage.getAllLobbies();
      res.json(lobbies);
    } catch (error: any) {
      console.error('Get lobbies error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch lobbies' });
    }
  });

  app.get("/api/lobbies/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const lobby = await storage.getLobby(id);
      
      if (!lobby) {
        return res.status(404).json({ error: 'Lobby not found' });
      }
      
      res.json(lobby);
    } catch (error: any) {
      console.error('Get lobby error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch lobby' });
    }
  });

  app.patch("/api/lobbies/:lobbyId/players/:playerId", async (req, res) => {
    try {
      const { lobbyId, playerId } = req.params;
      const updates = updatePlayerSchema.parse(req.body);
      
      const lobby = await storage.updatePlayerInLobby(lobbyId, playerId, updates);
      
      if (!lobby) {
        return res.status(404).json({ error: 'Lobby or player not found' });
      }
      
      res.json(lobby);
    } catch (error: any) {
      console.error('Update player error:', error);
      res.status(400).json({ error: error.message || 'Failed to update player' });
    }
  });

  app.delete("/api/lobbies/:lobbyId/players/:playerId", async (req, res) => {
    try {
      const { lobbyId, playerId } = req.params;
      
      const lobby = await storage.removePlayerFromLobby(lobbyId, playerId);
      
      if (!lobby) {
        return res.status(404).json({ error: 'Lobby or player not found' });
      }
      
      if (lobby.players.length === 0) {
        await storage.deleteLobby(lobbyId);
        return res.json({ deleted: true });
      }
      
      res.json(lobby);
    } catch (error: any) {
      console.error('Remove player error:', error);
      res.status(500).json({ error: error.message || 'Failed to remove player' });
    }
  });

  app.patch("/api/lobbies/:id/start", async (req, res) => {
    try {
      const { id } = req.params;
      
      const lobby = await storage.getLobby(id);
      if (!lobby) {
        return res.status(404).json({ error: 'Lobby not found' });
      }
      
      if (lobby.players.some(p => !p.isReady)) {
        return res.status(400).json({ error: 'Not all players are ready' });
      }
      
      const updated = await storage.updateLobby(id, { status: 'playing' });
      res.json(updated);
    } catch (error: any) {
      console.error('Start game error:', error);
      res.status(500).json({ error: error.message || 'Failed to start game' });
    }
  });

  const httpServer = createServer(app);

  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const lobbyConnections = new Map<string, Set<WebSocket>>();

  wss.on('connection', (ws) => {
    let currentLobbyId: string | null = null;
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'join_lobby':
            currentLobbyId = data.lobbyId;
            if (!lobbyConnections.has(currentLobbyId)) {
              lobbyConnections.set(currentLobbyId, new Set());
            }
            lobbyConnections.get(currentLobbyId)!.add(ws);
            
            ws.send(JSON.stringify({ type: 'joined', lobbyId: currentLobbyId }));
            break;
            
          case 'lobby_update':
            if (currentLobbyId) {
              const connections = lobbyConnections.get(currentLobbyId);
              if (connections) {
                const broadcastData = JSON.stringify({
                  type: 'lobby_updated',
                  lobby: data.lobby
                });
                connections.forEach(client => {
                  if (client.readyState === WebSocket.OPEN) {
                    client.send(broadcastData);
                  }
                });
              }
            }
            break;
            
          case 'game_action':
            if (currentLobbyId) {
              const connections = lobbyConnections.get(currentLobbyId);
              if (connections) {
                const broadcastData = JSON.stringify({
                  type: 'game_action',
                  action: data.action,
                  playerId: data.playerId
                });
                connections.forEach(client => {
                  if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(broadcastData);
                  }
                });
              }
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      if (currentLobbyId) {
        const connections = lobbyConnections.get(currentLobbyId);
        if (connections) {
          connections.delete(ws);
          if (connections.size === 0) {
            lobbyConnections.delete(currentLobbyId);
          }
        }
      }
    });
  });

  return httpServer;
}
