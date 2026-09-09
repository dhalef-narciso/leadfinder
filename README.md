# LeadFinder 🎯
### Local Business Prospecting Engine for Freelance Web Developers

LeadFinder is a modern SaaS-style web application built for freelance web developers to prospect local businesses that maintain an active online presence (e.g., Instagram, Facebook, Google Maps) but lack a professional website or modern landing page.

---

## 1. Project Structure

```
Projeto/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # Relational schema (SQLite default / PostgreSQL compatible)
│   ├── src/
│   │   ├── db/
│   │   │   ├── prisma.ts        # Prisma singleton client
│   │   │   └── seed.ts          # Default 25 niches and sample prospect data
│   │   ├── providers/           # Modular SearchProvider architecture
│   │   │   ├── SearchProvider.interface.ts # ISearchProvider interface
│   │   │   ├── MockSearchProvider.ts       # Realistic zero-credential search provider
│   │   │   ├── SerpApiProvider.ts          # SerpAPI Google integration
│   │   │   ├── GoogleSearchProvider.ts     # Google Programmable Search API
│   │   │   └── ProviderFactory.ts          # Dynamic provider resolution
│   │   ├── services/
│   │   │   ├── QueryGeneratorService.ts    # Boolean Google Search Operator compiler
│   │   │   ├── WebsiteDetectorService.ts   # Website classification & social filter
│   │   │   ├── LeadScoringService.ts       # 0-100 opportunity scoring engine
│   │   │   ├── DeduplicationService.ts     # Multi-factor lead normalization
│   │   │   ├── LeadExtractorService.ts     # Result parsing & signal detection
│   │   │   └── OutreachGeneratorService.ts # Friendly/Professional/Short/Direct personalizer
│   │   ├── routes/
│   │   │   ├── dashboard.routes.ts         # KPI statistics & conversion metrics
│   │   │   ├── searches.routes.ts          # Query generation & search execution
│   │   │   ├── leads.routes.ts             # Filterable lead management & outreach
│   │   │   ├── niches.routes.ts            # Niche and synonym management
│   │   │   └── settings.routes.ts          # Search engine diagnostics
│   │   └── index.ts                        # Express server entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # OpportunityBadge, WebsiteStatusBadge, LeadStatusPill
│   │   │   ├── dashboard/       # KPI cards, conversion stats, top prospects
│   │   │   ├── find-leads/      # Niche selector, multi-location, operator preview, progress modal
│   │   │   ├── leads/           # Sortable/filterable table, CSV export, LeadDetailModal
│   │   │   ├── outreach/        # OutreachModal with 4 personalized styles & 1-click copy
│   │   │   ├── saved-searches/  # Saved campaigns with 1-click rerun
│   │   │   ├── niches/          # Niche management & custom synonym additions
│   │   │   ├── settings/        # Search provider instructions & scoring rubric
│   │   │   └── layout/          # Sidebar navigation
│   │   ├── services/            # Axios API client
│   │   ├── types/               # TypeScript data definitions
│   │   ├── App.tsx              # Root component
│   │   ├── main.tsx
│   │   └── index.css            # Tailwind & Glassmorphism styles
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
└── README.md
```

---

## 2. Setup Instructions

### Prerequisites
- **Node.js**: v18 or higher (v24 tested)
- **npm**: v9 or higher

### Quick Start (Demo Mode - Zero External Setup Required)

1. **Install Backend Dependencies & Initialize DB**:
   ```bash
   cd backend
   npm install
   npx prisma db push
   npm run prisma:seed
   ```

2. **Install Frontend Dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

---

## 3. Environment Variables

In `backend/.env`:

```env
PORT=5001

# Choose Search Provider: 'mock' | 'serpapi' | 'google'
SEARCH_PROVIDER=mock

# Optional API Key (only required if SEARCH_PROVIDER is not 'mock'):
SEARCH_API_KEY=

# Google Programmable Search Engine CX (only if SEARCH_PROVIDER=google):
GOOGLE_SEARCH_CX=

# Database URL (SQLite default for instant execution):
DATABASE_URL="file:./dev.db"
```

---

## 4. Database Setup

### Out-of-the-Box (SQLite)
The default configuration uses SQLite stored in `backend/dev.db`. This requires **zero setup, zero Docker, and zero credentials**.

### Switching to PostgreSQL
To use PostgreSQL:
1. Open `backend/prisma/schema.prisma` and change:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update `backend/.env` with your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/leadfinder?schema=public"
   ```
3. Run the migration and seed:
   ```bash
   cd backend
   npx prisma db push
   npm run prisma:seed
   ```

---

## 5. How to Run Frontend & Backend

### Run Backend
```bash
cd backend
npm run dev
```
The backend API starts on `http://localhost:5001`.
Health check: `http://localhost:5001/api/health`.

### Run Frontend
```bash
cd frontend
npm run dev
```
The frontend starts on `http://localhost:3000` (automatically proxied to backend port 5001).

---

## 6. How to Replace MockSearchProvider with a Real Search API

The architecture uses a clean **Factory Pattern** adhering to `ISearchProvider`:

```typescript
export interface ISearchProvider {
  readonly providerName: string;
  search(query: string, location: string, options?: SearchOptions): Promise<RawSearchResult[]>;
}
```

### Option A: Use SerpApi (Google Search Engine)
1. Sign up for a free SerpApi key at [serpapi.com](https://serpapi.com).
2. Edit `backend/.env`:
   ```env
   SEARCH_PROVIDER=serpapi
   SEARCH_API_KEY=your_serpapi_key_here
   ```
3. Restart the backend server. The app will immediately fetch live organic Google Search results using `SerpApiProvider`.

### Option B: Use Google Programmable Search (Custom Search JSON API)
1. Get an API key from Google Cloud Console.
2. Create a Programmable Search Engine at [programmablesearchengine.google.com](https://programmablesearchengine.google.com).
3. Edit `backend/.env`:
   ```env
   SEARCH_PROVIDER=google
   SEARCH_API_KEY=your_google_cloud_api_key
   GOOGLE_SEARCH_CX=your_engine_cx
   ```

### Option C: Add DataForSEO or Custom Provider
1. Create `backend/src/providers/DataForSeoProvider.ts` implementing `ISearchProvider`.
2. Register it in `backend/src/providers/ProviderFactory.ts`.
3. Set `SEARCH_PROVIDER=dataforseo` in `.env`.
No changes are required in the routes, models, deduplication, scoring, or UI!

---

## 7. Opportunity Scoring Engine Rubric (0 to 100)

| Signal | Score Adjustment | Rationale |
|---|---|---|
| **No professional website detected** | `+40 pts` | Prime prospect for freelance web developer |
| **Instagram profile active** | `+15 pts` | Values visual branding and client engagement |
| **Direct phone number listed** | `+10 pts` | Direct reachability for cold call or SMS |
| **Business email identified** | `+10 pts` | Cold email pitch opportunity |
| **Google Business listing presence** | `+10 pts` | Established local trade |
| **Active social followers** | `+5 pts` | Proven market traction |
| **Facebook presence** | `+5 pts` | Additional channel signal |
| **Existing professional website** | `-40 pts` | Redesign or SEO audit only |

- **80 - 100**: Very High Opportunity (Flame badge)
- **60 - 79**: High Opportunity (Sparkle badge)
- **40 - 59**: Medium Opportunity
- **0 - 39**: Low Opportunity
