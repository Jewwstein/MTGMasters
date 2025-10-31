# MTG Playtest Platform

## Overview

An online multiplayer Magic: The Gathering deck building and playtesting platform. Players can build decks using the complete Scryfall card database, create game lobbies with unique join codes, and playtest MTG games in real-time with friends. The platform supports multiplayer gameplay with visual card representations, game zones (hand, battlefield, graveyard, etc.), life tracking, mana pools, and turn phase management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server.

**Routing**: Wouter for client-side routing, providing lightweight navigation between pages (home, deck builder, decks list, lobby, playfield).

**UI Component System**: Shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling. Uses the "new-york" style preset with dark mode enabled by default. Custom design system defined in `design_guidelines.md` emphasizes information density and spatial clarity inspired by gaming interfaces (MTGA, Archidekt, Moxfield) with Material Design principles.

**State Management**: 
- TanStack Query (React Query) for server state management, data fetching, and caching
- Local React state (useState) for component-level UI state
- No global state management library; relies on React Query's cache and component composition

**Styling Approach**:
- Tailwind CSS with custom theme configuration extending base colors
- Custom CSS variables for theming (light/dark mode support)
- Typography: Inter for UI elements, Roboto Mono for numeric data
- Elevation system using opacity-based overlays (hover-elevate, active-elevate)

**Key Pages**:
- Home: Lobby creation and joining interface
- Deck Builder: Card search with Scryfall integration, deck construction
- Decks: List view of all saved decks with edit/delete actions
- Lobby: Pre-game room with player management, deck selection, ready states
- Playfield: Active game interface with multiple zones, life counters, phase tracking

### Backend Architecture

**Server Framework**: Express.js with TypeScript, running on Node.js.

**Real-time Communication**: WebSocket server (ws library) for multiplayer game state synchronization and lobby updates.

**API Design**: RESTful API with JSON payloads:
- `/api/cards/*` - Scryfall API proxy for card searching
- `/api/decks/*` - CRUD operations for deck management
- `/api/lobbies/*` - Lobby creation, joining, player management, game start

**Middleware Stack**:
- JSON body parser with raw body capture for potential webhook verification
- Request/response logging middleware for API routes
- CORS handling via Vite proxy in development

**Development/Production Setup**: 
- Development: Vite middleware integrated into Express for HMR
- Production: Express serves pre-built static assets from `dist/public`
- Build process uses esbuild for server bundling

### Data Storage Solutions

**Current Implementation**: In-memory storage (`MemStorage` class) with Map-based data structures for development/prototyping.

**Schema Definition**: Drizzle ORM schema defined in `shared/schema.ts` with PostgreSQL dialect configuration. Database tables include:
- `users`: Authentication (username, password)
- `decks`: Deck storage (name, cards as JSONB array, sleeve color)

**Data Models**:
- Deck cards stored as `{ id: string, quantity: number }[]`
- Lobby state includes players array with ready status, selected decks
- Player state tracked by unique IDs stored in localStorage

**Migration Strategy**: Drizzle Kit configured for PostgreSQL migrations (though currently using in-memory storage). Connection expects `DATABASE_URL` environment variable. Migration files output to `./migrations` directory.

**Data Validation**: Zod schemas for runtime validation, generated from Drizzle schemas using drizzle-zod for type-safe API contracts.

### Authentication and Authorization

**Current State**: Minimal authentication implementation. User schema exists with username/password fields, but active authentication flow not fully implemented in the codebase.

**Session Management**: Player identification in lobbies uses unique player IDs stored in browser localStorage, not tied to authenticated user accounts.

**Security Consideration**: Authentication is defined at the schema level but not enforced in current routes. This is an area for future development.

### External Dependencies

**Scryfall API Integration**: 
- Proxy endpoint at `/api/cards/search` forwards requests to Scryfall's card search API
- Supports query parameters: `q` (search text), `colors`, `types`, `page`
- Client-side caching via React Query with 5-minute stale time
- Card data structure matches Scryfall's response format (id, name, mana_cost, type_line, oracle_text, image_uris, etc.)

**Database**: 
- Configured for Neon PostgreSQL via `@neondatabase/serverless`
- Connection pooling via Drizzle ORM
- Currently using in-memory fallback for development

**UI Component Libraries**:
- Radix UI primitives (20+ component packages for accessible UI)
- Embla Carousel for card galleries
- React Hook Form with Zod resolvers for form validation
- date-fns for date formatting
- cmdk for command palette interfaces

**Build Tools**:
- Vite with React plugin for frontend bundling
- esbuild for server-side bundling
- PostCSS with Tailwind and Autoprefixer
- TypeScript compiler for type checking (noEmit mode)

**Development Tools**:
- Replit-specific plugins (runtime error modal, cartographer, dev banner)
- Wouter for routing (lighter alternative to React Router)
- nanoid for unique ID generation

**Session Store**: connect-pg-simple configured for PostgreSQL-backed Express sessions (though session middleware not actively used in current implementation).