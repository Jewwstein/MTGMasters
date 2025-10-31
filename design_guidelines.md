# Design Guidelines: MTG Playtest Platform

## Design Approach

**Selected Approach:** Hybrid - Drawing inspiration from gaming interfaces (MTGA, Archidekt, Moxfield) with Material Design principles for utility components

**Key Design Principles:**
- Information density over visual flair - prioritize readability and quick scanning
- Spatial clarity - distinct zones must be immediately recognizable
- Efficient workflows - minimize clicks for common actions
- Responsive card interactions - immediate visual feedback for all game actions

## Core Design Elements

### Typography System

**Font Families:**
- Primary: 'Inter' (Google Fonts) - UI elements, labels, card counts
- Secondary: 'Roboto Mono' (Google Fonts) - mana costs, life totals, numeric data

**Type Scale:**
- Hero headings: text-4xl font-bold (deck names, lobby titles)
- Section headers: text-xl font-semibold (zone labels, panel titles)
- Card names: text-base font-medium
- Body text: text-sm (card text, descriptions)
- Micro text: text-xs (card subtypes, set info)
- Data displays: text-2xl font-mono font-bold (life totals, mana)

### Layout System

**Spacing Primitives:** Consistent use of Tailwind units: 2, 4, 6, 8, 12, 16, 20
- Tight spacing: p-2, gap-2 (within card collections, compact lists)
- Standard spacing: p-4, gap-4 (between UI elements, form fields)
- Section spacing: p-8, gap-8 (between major zones, panels)
- Large spacing: p-12, p-16 (screen padding, major sections)

**Grid Systems:**
- Deck builder: Sidebar (w-80) + Main area (flex-1)
- Playtest field: Split-screen horizontal for 2-player (grid-cols-1 lg:grid-cols-2), stacked for multiplayer
- Card grids: grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 (adjustable card size)

## Component Library

### Navigation & Structure

**Top Navigation Bar:**
- Fixed position (sticky top-0), h-16
- Flex layout with space-between
- Left: Logo/home link, active game indicator
- Center: Quick actions (draw, untap all, pass turn)
- Right: Life total display, player count, settings icon
- Use Heroicons for all icons (CDN)

**Sidebar Panel (Deck Builder):**
- w-80, fixed height with scroll
- Sections: Search filters, deck list, statistics
- Collapsible sections with chevron icons
- Sticky search bar at top

### Card Components

**Card Display (Default):**
- Aspect ratio: 5:7 (Magic card proportions)
- Sizes: w-32 (default), w-24 (compact), w-40 (large preview)
- Border radius: rounded-lg
- Shadow: shadow-md hover:shadow-xl
- Transform on hover: scale-105 transition-transform duration-200

**Card in Hand:**
- Slightly rotated (rotate-1, -rotate-2, etc.) for natural appearance
- Fan layout with overlap (ml-[-2rem] for stacking)

**Card on Battlefield:**
- Tapped state: rotate-90 transform
- Attached cards: absolute positioning, smaller scale (scale-75), offset

**Hover Preview Modal:**
- Fixed position overlay (right-4 top-20)
- Larger card image w-64 sm:w-80
- Include Oracle text, mana cost, P/T prominently
- Backdrop blur on background: backdrop-blur-sm

### Game Zones

**Battlefield Grid:**
- CSS Grid with auto-fit: grid-cols-[repeat(auto-fit,minmax(150px,1fr))]
- Gap: gap-4
- Padding: p-6
- Min height: min-h-[400px]
- Drag-and-drop target with visual indication

**Zone Headers:**
- Flex layout with space-between
- Zone name (text-lg font-semibold) + card count badge (rounded-full px-3 py-1 text-xs)
- Sticky positioning within scrollable zone

**Hand Zone:**
- Horizontal scroll container (overflow-x-auto)
- Flex layout with gap-2
- Fixed bottom position: bottom-0, h-48
- Semi-transparent background for field visibility

**Graveyard/Exile/Library Zones:**
- Collapsed view showing top card + count
- Click to expand into modal overlay (max-h-[80vh] overflow-y-auto)
- Grid layout when expanded: grid-cols-4 md:grid-cols-6

### Deck Builder Interface

**Search Bar:**
- Prominent placement, w-full
- Icon prefix (search icon from Heroicons)
- Advanced filters in dropdown below (toggle with filter icon)
- Auto-complete suggestions (absolute positioned dropdown)

**Deck List View:**
- Grouped by card type (Creatures, Instants, etc.)
- Text-based compact list with:
  - Quantity badge (w-8 text-center)
  - Mana cost symbols (inline flex)
  - Card name (truncate)
  - Quick add/remove buttons (+/-)
- Summary stats bar: Total cards, mana curve visualization (horizontal bar chart)

**Card Pool/Search Results:**
- Grid view: grid-cols-3 md:grid-cols-5 gap-4
- List view option: space-y-2
- Click to add, double-click to add 4x
- Visual indicator for cards already in deck (border or badge)

### Multiplayer Lobby

**Lobby Screen Layout:**
- Centered container: max-w-4xl mx-auto p-8
- Header: Lobby name (text-3xl font-bold) + lobby code (mono text with copy button)
- Player list: grid-cols-1 md:grid-cols-2 gap-4
- Each player card: flex items-center gap-4, p-4, rounded-lg border
  - Avatar placeholder (w-12 h-12 rounded-full)
  - Player name (text-lg)
  - Ready status indicator (checkmark or waiting icon)
  - Host indicator (crown icon) for lobby creator
- Deck selection dropdown for each player
- Large start button (w-full md:w-auto) for host when all ready

**Share Link Component:**
- Prominent display: p-4 border rounded-lg
- Flex layout: input (flex-1) + copy button
- Success feedback on copy (checkmark icon transition)

### Game Controls

**Life Total Counter:**
- Large display: text-4xl md:text-6xl font-mono font-bold
- +/- buttons flanking the number (w-12 h-12 rounded-full)
- Starting life total selector (20/30/40)

**Mana Pool Tracker:**
- Horizontal row of mana symbol buttons
- Click to add, right-click to remove
- Visual count badge on each symbol

**Turn Phase Indicator:**
- Horizontal stepper showing: Untap → Upkeep → Draw → Main 1 → Combat → Main 2 → End
- Active phase highlighted
- Click to advance

**Action Buttons:**
- Primary actions (Draw, Play Land): Larger size (px-6 py-3)
- Secondary actions (Shuffle, Reveal): Standard size (px-4 py-2)
- Utility actions (Undo, Settings): Icon-only buttons (p-2)

### Data Visualization

**Mana Curve Chart:**
- Horizontal bar chart
- X-axis: CMC 0-7+
- Y-axis: Card count
- Bars: h-6 per unit, max-height normalized
- Labels: CMC number + count

**Deck Statistics Panel:**
- Grid of stat cards: grid-cols-2 md:grid-cols-4
- Each stat: Icon + Label + Value
- Include: Total cards, Avg CMC, Creatures %, Lands count

### Forms & Inputs

**Text Inputs:**
- Full-width with clear focus states
- Height: h-12 for touch targets
- Padding: px-4
- Border radius: rounded-lg

**Dropdowns/Selects:**
- Native selects styled consistently
- Multi-select for card colors/types with checkbox list

**Buttons:**
- Primary: px-6 py-3 rounded-lg font-medium
- Secondary: px-4 py-2 rounded-md
- Icon buttons: p-2 rounded-md
- Disabled state: opacity-50 cursor-not-allowed

## Responsive Behavior

**Mobile (< 768px):**
- Single column layout for all zones
- Collapsible sections with accordion pattern
- Bottom sheet for card preview (not side overlay)
- Simplified battlefield grid (fewer columns)
- Hamburger menu for navigation

**Tablet (768px - 1024px):**
- 2-column layouts where applicable
- Side-by-side battlefield for 2-player
- Expanded deck builder sidebar

**Desktop (> 1024px):**
- Full multi-column layouts
- Persistent sidebar panels
- Larger card previews
- More visible game state information

## Images

**No traditional hero images required** - This is a utility/game interface, not a marketing site.

**Card Images:**
- All card visuals pulled from Scryfall API
- Placeholder for missing images: <!-- Card image from Scryfall -->
- Fallback: Text-based card representation with mana cost, name, type

**Avatar Placeholders:**
- Player avatars in lobby: Use initial letters or geometric patterns
- Size: w-12 h-12 rounded-full

## Icons

**Icon Library:** Heroicons (CDN)

**Key Icons Needed:**
- UI: menu, search, filter, settings, copy, check, x-mark, plus, minus
- Game: arrow-path (shuffle), arrow-down (draw), hand-raised, shield-check
- Zones: archive-box (library), fire (exile), document-minus (graveyard)
- Navigation: chevron-left, chevron-right, chevron-down