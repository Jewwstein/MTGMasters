import { type User, type InsertUser, type Deck, type InsertDeck, type DeckCard, type Lobby, type Player } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Deck operations
  createDeck(deck: InsertDeck): Promise<Deck>;
  getDeck(id: string): Promise<Deck | undefined>;
  getAllDecks(): Promise<Deck[]>;
  updateDeck(id: string, deck: Partial<InsertDeck>): Promise<Deck | undefined>;
  deleteDeck(id: string): Promise<boolean>;
  
  // Lobby operations
  createLobby(lobby: Omit<Lobby, 'id' | 'createdAt'>): Promise<Lobby>;
  getLobby(id: string): Promise<Lobby | undefined>;
  getLobbyByCode(code: string): Promise<Lobby | undefined>;
  getAllLobbies(): Promise<Lobby[]>;
  updateLobby(id: string, updates: Partial<Lobby>): Promise<Lobby | undefined>;
  deleteLobby(id: string): Promise<boolean>;
  addPlayerToLobby(lobbyId: string, player: Player): Promise<Lobby | undefined>;
  removePlayerFromLobby(lobbyId: string, playerId: string): Promise<Lobby | undefined>;
  updatePlayerInLobby(lobbyId: string, playerId: string, updates: Partial<Player>): Promise<Lobby | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private decks: Map<string, Deck>;
  private lobbies: Map<string, Lobby>;

  constructor() {
    this.users = new Map();
    this.decks = new Map();
    this.lobbies = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createDeck(insertDeck: InsertDeck): Promise<Deck> {
    const id = randomUUID();
    const deck: Deck = { 
      id,
      name: insertDeck.name,
      cards: insertDeck.cards as DeckCard[],
      sleeveColor: insertDeck.sleeveColor || 'bg-red-600'
    };
    this.decks.set(id, deck);
    return deck;
  }

  async getDeck(id: string): Promise<Deck | undefined> {
    return this.decks.get(id);
  }

  async getAllDecks(): Promise<Deck[]> {
    return Array.from(this.decks.values());
  }

  async updateDeck(id: string, updates: Partial<InsertDeck>): Promise<Deck | undefined> {
    const existing = this.decks.get(id);
    if (!existing) return undefined;
    
    const updated: Deck = { 
      ...existing,
      ...updates,
      cards: (updates.cards || existing.cards) as DeckCard[]
    };
    this.decks.set(id, updated);
    return updated;
  }

  async deleteDeck(id: string): Promise<boolean> {
    return this.decks.delete(id);
  }

  async createLobby(lobbyData: Omit<Lobby, 'id' | 'createdAt'>): Promise<Lobby> {
    const id = randomUUID();
    const lobby: Lobby = {
      ...lobbyData,
      id,
      createdAt: Date.now(),
    };
    this.lobbies.set(id, lobby);
    return lobby;
  }

  async getLobby(id: string): Promise<Lobby | undefined> {
    return this.lobbies.get(id);
  }

  async getLobbyByCode(code: string): Promise<Lobby | undefined> {
    return Array.from(this.lobbies.values()).find(
      (lobby) => lobby.code === code,
    );
  }

  async getAllLobbies(): Promise<Lobby[]> {
    return Array.from(this.lobbies.values()).filter(
      (lobby) => lobby.status === 'waiting'
    );
  }

  async updateLobby(id: string, updates: Partial<Lobby>): Promise<Lobby | undefined> {
    const existing = this.lobbies.get(id);
    if (!existing) return undefined;
    
    const updated: Lobby = { ...existing, ...updates };
    this.lobbies.set(id, updated);
    return updated;
  }

  async deleteLobby(id: string): Promise<boolean> {
    return this.lobbies.delete(id);
  }

  async addPlayerToLobby(lobbyId: string, player: Player): Promise<Lobby | undefined> {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return undefined;
    if (lobby.players.length >= lobby.maxPlayers) return undefined;
    
    const updated: Lobby = {
      ...lobby,
      players: [...lobby.players, player],
    };
    this.lobbies.set(lobbyId, updated);
    return updated;
  }

  async removePlayerFromLobby(lobbyId: string, playerId: string): Promise<Lobby | undefined> {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return undefined;
    
    const updated: Lobby = {
      ...lobby,
      players: lobby.players.filter(p => p.id !== playerId),
    };
    this.lobbies.set(lobbyId, updated);
    return updated;
  }

  async updatePlayerInLobby(lobbyId: string, playerId: string, updates: Partial<Player>): Promise<Lobby | undefined> {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return undefined;
    
    const updated: Lobby = {
      ...lobby,
      players: lobby.players.map(p => 
        p.id === playerId ? { ...p, ...updates } : p
      ),
    };
    this.lobbies.set(lobbyId, updated);
    return updated;
  }
}

export const storage = new MemStorage();
