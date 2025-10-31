import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const decks = pgTable("decks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  cards: jsonb("cards").notNull().$type<DeckCard[]>(),
  sleeveColor: text("sleeve_color").default('bg-red-600'),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDeckSchema = createInsertSchema(decks).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type DeckCard = {
  id: string;
  quantity: number;
};

export type InsertDeck = z.infer<typeof insertDeckSchema>;
export type Deck = typeof decks.$inferSelect;

// Scryfall card type (simplified)
export type ScryfallCard = {
  id: string;
  name: string;
  mana_cost?: string;
  type_line?: string;
  oracle_text?: string;
  power?: string;
  toughness?: string;
  image_uris?: {
    small?: string;
    normal?: string;
    large?: string;
  };
  colors?: string[];
  cmc?: number;
};

// Lobby types
export type Player = {
  id: string;
  name: string;
  deckId: string | null;
  isReady: boolean;
  isHost: boolean;
};

export type Lobby = {
  id: string;
  code: string;
  hostId: string;
  players: Player[];
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
};

export const createLobbySchema = z.object({
  hostName: z.string().min(1),
  maxPlayers: z.number().min(2).max(8).default(4),
});

export const joinLobbySchema = z.object({
  code: z.string().length(6),
  playerName: z.string().min(1),
});

export const updatePlayerSchema = z.object({
  deckId: z.string().nullable().optional(),
  isReady: z.boolean().optional(),
});

export type CreateLobby = z.infer<typeof createLobbySchema>;
export type JoinLobby = z.infer<typeof joinLobbySchema>;
export type UpdatePlayer = z.infer<typeof updatePlayerSchema>;
