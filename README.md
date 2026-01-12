# One Option Store

The best choice is no choice. Only the #1 bestseller from every Amazon category.

## Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)

## Installation

```bash
npm install
```

## Environment Setup

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Testing

```bash
npm test
```

## Production Build

```bash
npm run build
npm start
```

## Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── browse/            # Department browsing
│   ├── department/        # Department detail
│   ├── category/          # Category detail
│   └── product/           # Product detail
├── components/
│   ├── layout/            # Header, Footer, PageLayout
│   ├── products/          # ProductCard, ProductHero
│   └── ui/                # Reusable UI components
├── lib/
│   └── db/                # Database queries
└── types/                 # TypeScript type definitions
```

## Key Design Decisions

- **Black & White Design**: Product images are the only color
- **Server Components**: All data fetching uses React Server Components
- **No Client State**: Minimal client-side JavaScript for performance
- **Amazon Affiliate**: All products link directly to Amazon

## License

Private - All rights reserved.
