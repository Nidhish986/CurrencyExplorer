# Global Money Companion

A production-quality React portfolio application for comparing live exchange rates, purchasing power parity (PPP), historical currency trends, and country currency metadata.

## Tech Stack

- **React 18** + **Vite** + **TypeScript** (strict mode)
- **Tailwind CSS** with custom design tokens (Wise-inspired palette)
- **React Router** v6 with lazy-loaded routes
- **Chart.js** via `react-chartjs-2` for responsive historical charts
- **React Context API** for global state management
- **Local Storage** for persistent user preferences and caching
- **Fetch API** with timeout, abort, and fallback handling

## Data Sources

| Source | Purpose | Key required? |
|--------|---------|:----:|
| [Frankfurter API](https://frankfurter.dev) | Live exchange rates | No |
| [World Bank Open Data](https://data.worldbank.org) | PPP conversion factors (indicator `PA.NUS.PPP`, 2021 vintage) | No |
| [`mledoze/countries`](https://github.com/mledoze/countries) | Country and currency metadata | No |
| [FlagCDN](https://flagcdn.com) | Country flag images | No |

- PPP data is stored locally as `src/data/ppp-2021.json` (converted from World Bank CSV, not fetched live).
- Country metadata is fetched live with fallback to `src/data/countries-snapshot.json`.

> **Note:** REST Countries is no longer used because its formerly free API now requires a key. The app uses `mledoze/countries` instead, adapted through `src/services/countryAdapter.ts` into the PRD's internal data contracts. This is the only intentional PRD deviation.

## Features

### Home Dashboard
- Quick currency converter widget
- Favorite currency pairs
- Latest USD exchange rates (EUR, GBP, INR, JPY, CAD, AUD)
- Recent salary comparisons
- Recently viewed countries
- Empty states for each widget when no data exists

### Currency Converter
- ISO code validation with inline error messages
- Search by country name, currency name, or currency code
- 300ms debounced amount input
- Reverse conversion swaps base/target and re-fetches the rate
- Stale cached-rate fallback with timestamp badge
- Save currency pairs as favorites

### Salary & Purchasing Power Comparison
- Side-by-side exchange-rate conversion and PPP equivalent salary
- Template-generated plain-language explanation of why values differ
- PPP factor display for both countries
- Explicit disabled state when PPP data is unavailable for a country
- Save salary comparison pairs as favorites

### Historical Exchange Rates
- Interactive Chart.js line charts
- 5 time ranges: 7 Days, 30 Days, 6 Months, 1 Year, 5 Years
- Cached per pair+range with 1-hour TTL to minimize API calls
- Accessible tab interface with proper ARIA roles

### Favorites
- Stored as minimal `FavoritePair` records (pair IDs only)
- Always re-resolves current rate/PPP data on load (never stale)
- Works for both currency pairs and salary comparison pairs

### World Explorer
- Browse 200+ countries with flags, currency names, codes, and symbols
- Search by country name, currency name, or currency code
- Continent/region filtering
- Country detail panel with currency info, USD exchange rate, and PPP summary

### Global Features
- Dark & Light mode with persistent theme preference
- Responsive layouts (mobile, tablet, desktop)
- Skeleton loading states for perceived performance
- Offline detection with persistent banner and disabled live actions
- Card entrance animations with reduced-motion support
- Micro-interactions (hover lift, button press)
- WCAG 2.1 AA accessibility (semantic HTML, keyboard navigation, ARIA labels, color contrast ≥ 4.5:1)

## Installation

### Prerequisites
- **Node.js** 18+ (LTS recommended)
- **npm** 9+

### Steps

```bash
# Clone the repository
git clone <repository-url>
cd global-money-companion

# Install dependencies
npm install

# Generate/update PPP and country snapshot data
npm run update:data

# Start development server
npm run dev
```

The development server starts at `http://localhost:5173`.

## Production Build

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview
```

The built static files are output to the `dist/` directory.

## Deployment

Deploy the static Vite app for free on **Vercel** or **Netlify**. No backend or API keys are required.

### Vercel
```bash
npx vercel --prod
```

### Netlify
Drag and drop the `dist/` folder to [Netlify Drop](https://app.netlify.com/drop), or connect the repository for automatic deploys.

## Architecture Notes

```
src/
├── components/    # Reusable UI components (Card, Forms, Layout, etc.)
├── pages/         # Route-level page components
├── services/      # API clients, data adapters, storage layer
├── hooks/         # Custom React hooks (debounce, online status, catalogs)
├── utils/         # Pure utility functions (formatting, validation)
├── types/         # Shared TypeScript interfaces (data contracts)
├── context/       # React Context providers (AppContext)
├── data/          # Static datasets (PPP, country snapshot)
└── assets/        # Static assets
```

- **Data contracts** in `src/types/index.ts` — all features use these shared interfaces.
- **API transformations** in `src/services/` — external response shapes never leak into UI code.
- **Local Storage** keys centralized in `src/services/storage.ts` with TTL-based caching.
- **Business logic** for PPP salary comparison isolated in `src/services/salaryService.ts`.
- **Code splitting** via `React.lazy` — each page is a separate chunk.

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Frankfurter API down/timeout | Falls back to last cached rate with "stale data" badge |
| Country API down/timeout | Falls back to bundled `countries-snapshot.json` |
| No internet | Persistent offline banner; live-data actions disabled |
| Invalid currency code | Inline validation error; API call prevented |
| No search results | Empty-state illustration with helpful message |
| PPP data missing | Explicit "PPP data unavailable for [country]" message |
| Loading states | Skeleton loaders on cards/charts for perceived performance |

## License

This project is for portfolio and educational purposes.
