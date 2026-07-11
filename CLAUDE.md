# LifeOS

## Development

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run start     # Start production server
```

## Architecture

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with custom dark theme
- **State**: React Context + useReducer (localStorage persisted)
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Auth/Database**: Supabase (optional, localStorage used by default)
- **Icons**: Lucide React

## Project Structure

- `app/` - Pages (each subfolder = route)
- `components/` - React components
- `store/` - AppContext (global state)
- `lib/` - Utilities, defaults, supabase client
- `types/` - TypeScript type definitions

## Key Features

- Dashboard with 6 KPI cards + progress bar
- Goal management (CRUD, duplicate, mark purchased, deposits)
- Analytics with charts (net worth, dream progress, investments)
- Income simulator (sliders for income/savings/profit margin)
- Net worth calculator (assets vs liabilities)
- Achievement system with XP levels and titles
- Habit tracker with streak tracking
- Journal with wins/ideas/lessons
- Business tracker (revenue, MRR, clients)
- Investment portfolio tracker
- Dream wall (visual card grid)
- Vision board (image upload/drag-reorder)
- Timeline and calendar views
- Export (JSON/CSV) and Import
- Lock mode for edit protection
- 3 themes: Dark, Light, OLED Black
- Confetti on goal completion
