# One Option Store

The best choice is no choice. Discover the #1 bestselling product from every Amazon category.

## Overview

One Option Store is a curated product discovery platform that shows only the #1 bestseller in each Amazon category. Instead of overwhelming users with countless options, we simplify the decision by showing only the proven top choice.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI**: React 19 + Tailwind CSS v4
- **Database**: Neon Serverless PostgreSQL
- **Language**: TypeScript (strict mode)
- **Deployment**: Vercel

## Features

- Browse products by department and category
- View detailed product information with Amazon links
- Responsive design for all device sizes
- SEO optimized with dynamic metadata
- ISR caching for optimal performance
- Accessibility-first design

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SITE_URL=https://your-domain.com
AMAZON_AFFILIATE_TAG=your-tag-20
```

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run type-check` | Run TypeScript type check |
| `npm run check` | Run type-check and lint |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── browse/            # Browse departments page
│   ├── category/          # Category detail pages
│   ├── department/        # Department detail pages
│   ├── product/           # Product detail pages
│   └── about/             # About page
├── components/            # React components
│   ├── layout/           # Layout components (Header, Footer)
│   ├── products/         # Product components
│   └── ui/               # Reusable UI components
└── lib/                   # Utilities and database
    ├── db/               # Database queries and schema
    ├── constants.ts      # Application constants
    └── validation.ts     # Input validation
```

## Database Schema

The application uses four main tables:

- **departments**: Top-level product categories
- **categories**: Subcategories within departments
- **products**: Amazon product information
- **bestseller_rankings**: Current #1 products per category

See `src/lib/db/schema.sql` for the complete schema.

## API Endpoints

- `GET /api/health` - Health check endpoint

## Deployment

The application is optimized for deployment on Vercel:

1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy

The app uses ISR (Incremental Static Regeneration) with 5-minute revalidation for optimal performance.

## Security

- Security headers configured via `next.config.ts`
- Input validation on all user inputs
- Parameterized database queries
- External links use `rel="noopener noreferrer"`

## Affiliate Disclosure

As an Amazon Associate, we earn from qualifying purchases.

## License

Private - All rights reserved.
