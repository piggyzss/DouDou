# Technology Stack & Development Guide

## Core Technologies
- **Frontend Framework**: React 18 with Next.js 14 App Router
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS with custom CSS variables and PostCSS
- **Database**: PostgreSQL with custom query layer and pg driver
- **File Storage**: Tencent Cloud COS (Cloud Object Storage)
- **Deployment**: Vercel with optimized build configuration
- **Package Manager**: npm with Node.js runtime

## Key Libraries & Dependencies

### Frontend & UI
- **React**: React 18 with React DOM for component rendering
- **UI/Animation**: Framer Motion for animations, Lucide React for icons
- **Styling Utilities**: clsx for conditional class names, Tailwind Typography plugin
- **State Management**: React Context API for theme and global state

### Content Processing & Media
- **Markdown Processing**: 
  - remark, rehype ecosystem for blog content parsing
  - remark-gfm for GitHub Flavored Markdown
  - rehype-prism-plus for syntax highlighting
  - rehype-slug and rehype-autolink-headings for navigation
- **Syntax Highlighting**: Prism.js with custom dark themes
- **Image Processing**: Sharp for optimization, Next.js Image component
- **Media & Charts**: Highcharts with React wrapper for data visualization
- **File Handling**: copy-to-clipboard for code copying, uuid for unique IDs

### Backend & Data
- **Database**: PostgreSQL with pg driver and custom query abstraction
- **File Storage**: Tencent Cloud COS SDK (cos-nodejs-sdk-v5)
- **Date Handling**: date-fns for date formatting and manipulation
- **Environment**: dotenv for environment variable management

### Development & Testing
- **Testing Framework**: Jest with jsdom environment
- **Testing Utilities**: 
  - React Testing Library for component testing
  - MSW (Mock Service Worker) for API mocking
  - Supertest for API endpoint testing
  - node-mocks-http for HTTP mocking
- **Development Tools**: 
  - ESLint with Next.js configuration
  - TypeScript with strict type checking
  - ts-node for running TypeScript scripts

## Build System & Commands

### Development
```bash
npm run dev              # Start development server with preflight checks
npm run dev:skip-preflight  # Start dev server without checks
npm run preflight        # Run preflight checks (database, environment)
```

### Building & Deployment
```bash
npm run build           # Standard Next.js build
npm run vercel-build    # Optimized build for Vercel deployment
npm run preview         # Build and preview production locally
```

### Database Management
```bash
npm run db:setup        # Initialize database schema
npm run db:info         # Check current database connection info
npm run db:test         # Test database connectivity
npm run db:manage-blog  # Manage blog content
npm run db:manage-apps  # Manage app/project content
npm run db:manage-aigc-* # Manage AIGC content (image/music/video)
```

### Testing
```bash
npm test               # Run all tests
npm run test:coverage  # Run tests with coverage report
npm run test:unit      # Run unit tests only
npm run test:components # Run component tests only
npm run test:api       # Run API tests only
npm run test:integration # Run integration tests only
```

### Utilities
```bash
npm run changelog      # Update changelog
npm run deploy:init    # Initialize deployment
npm run deploy:verify  # Verify deployment status
```

## Architecture Patterns

### File-based Routing
- Uses Next.js 14 App Router with nested layouts
- API routes follow RESTful conventions in `app/api/`
- Dynamic routes use bracket notation `[slug]`, `[id]`

### Component Organization
- Page-specific components in respective page directories
- Shared components in `app/components/`
- Reusable UI components follow compound component pattern

### Data Layer
- Custom database abstraction in `lib/database.ts`
- Model definitions in `lib/models/` with TypeScript interfaces
- Environment-aware database connections (local/production)

### Styling Approach
- **CSS Architecture**: CSS custom properties for theming in `globals.css`
- **Utility Framework**: Tailwind CSS with custom component classes
- **Theme System**: Dark mode support via CSS variables and class-based switching
- **Typography**: Custom fonts (fzm-Old.Typewriter, ZenKakuGothicNew-Medium) with fallbacks
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Animations**: Framer Motion for complex animations, CSS transitions for simple effects

## Development Standards

### TypeScript Configuration
- Strict mode enabled with comprehensive type checking
- Path aliases configured (`@/*` maps to project root)
- Separate tsconfig for scripts (`tsconfig.scripts.json`)

### Code Quality
- ESLint with Next.js configuration
- Pre-commit hooks for code quality checks
- Comprehensive test coverage requirements

### Performance Optimizations
- **Image Optimization**: WebP/AVIF formats with Next.js Image component
- **Build Optimization**: 
  - Build tracing disabled to prevent memory issues
  - Webpack build workers enabled
  - Output file tracing disabled for Vercel deployment
- **Caching Strategy**: Static asset caching with appropriate headers
- **Bundle Optimization**: Code splitting with Next.js dynamic imports
- **Runtime Optimization**: React 18 concurrent features and Suspense boundaries

## Environment Configuration

### Required Environment Variables
```bash
# Database
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...

# Tencent Cloud COS
COS_SECRET_ID=your_secret_id
COS_SECRET_KEY=your_secret_key
COS_REGION=your_region
COS_BUCKET=your_bucket

# Application
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NODE_ENV=development|production
```

### Development Environment Setup
1. Install Node.js (v18+ recommended)
2. Install dependencies: `npm install`
3. Set up environment variables in `.env.local`
4. Initialize database: `npm run db:setup`
5. Run preflight checks: `npm run preflight`
6. Start development server: `npm run dev`