# Project Structure & Organization

## Root Directory Layout
```
├── app/                    # Next.js App Router application code
├── lib/                    # Shared utilities and business logic
├── scripts/                # Database management and deployment scripts
├── tests/                  # Test suites organized by type
├── docs/                   # Project documentation
├── database/               # Database schema and migrations
├── public/                 # Static assets served directly
└── coverage/               # Test coverage reports
```

## Application Structure (`app/`)

### Core Application Files
- `layout.tsx` - Root layout with navigation, footer, theme provider
- `page.tsx` - Homepage with hero, about, skills, latest content
- `globals.css` - Global styles, CSS variables, theme definitions
- `providers.tsx` - React context providers (theme, etc.)
- `fonts.ts` - Custom font configurations
- `middleware.ts` - Next.js middleware for user session management

### Feature-Based Organization
Each major feature has its own directory with co-located components:

```
app/
├── blog/                   # Blog system
│   ├── page.tsx           # Blog list page
│   ├── [slug]/            # Dynamic blog post pages
│   ├── new/               # Create new post
│   └── components/        # Blog-specific components
├── apps/                   # Project showcase
│   ├── page.tsx           # Apps gallery page
│   └── components/        # App-specific components
├── aigc/                   # AI-generated content
│   ├── page.tsx           # AIGC main page
│   ├── components/        # AIGC-specific components
│   └── sections/          # Page sections (images, music, videos)
└── home/                   # Homepage sections
    ├── Hero.tsx           # Hero section
    ├── About.tsx          # About section
    ├── Skills.tsx         # Skills showcase
    └── Update.tsx         # Latest updates
```

### API Routes (`app/api/`)
RESTful API organization following resource-based structure:
```
api/
├── blog/                   # Blog CRUD operations
├── apps/                   # Project management
├── aigc/                   # AIGC content management
│   ├── artworks/          # Image collections
│   ├── music/             # Music tracks
│   ├── videos/            # Video content
│   ├── proxy-image/       # Image proxy service
│   └── proxy-audio/       # Audio proxy service
├── likes/                  # Like system
├── upload/                 # File upload handling
└── health/                 # Health check endpoint
```

### Shared Components (`app/components/`)
Global reusable components:
- `Navigation.tsx` - Main site navigation
- `Footer.tsx` - Site footer
- `LikeToggle.tsx` - Like/unlike functionality
- `FileUpload.tsx` - File upload component
- `ConfirmModal.tsx` - Confirmation dialogs
- `CodeCopyButton.tsx` - Code block copy functionality
- `BackToTop.tsx` - Scroll to top button

## Library Structure (`lib/`)

### Core Utilities
- `database.ts` - Database connection and query utilities
- `blog.ts` - Blog-specific helper functions
- `paths.ts` - Path utilities and constants
- `tencent-cos.ts` - Cloud storage operations
- `tencent-cos-config.ts` - COS configuration

### Data Models (`lib/models/`)
TypeScript interfaces and types for:
- `blog.ts` - Blog post structure
- `app.ts` - Application/project structure
- `artwork.ts` - AIGC artwork structure
- `music.ts` - Music track structure
- `video.ts` - Video content structure
- `likes.ts` - Like system structure

## Scripts Directory (`scripts/`)

### Database Management
- `init-database.ts` - Initialize database schema
- `setup-database.ts` - Database setup and configuration
- `manage-*.ts` - Content management scripts for each content type
- `test-database-connection.ts` - Database connectivity testing

### Deployment & Maintenance
- `deploy-init.ts` - Deployment initialization
- `verify-deployment.ts` - Post-deployment verification
- `update-changelog.ts` - Automated changelog updates
- `preflight.ts` - Pre-development environment checks

## Testing Structure (`tests/`)

### Test Organization
```
tests/
├── unit/                   # Unit tests for utilities and models
├── components/             # Component testing
│   ├── common/            # Shared component tests
│   ├── apps/              # App-specific component tests
│   └── pages/             # Page component tests
├── api/                    # API endpoint testing
├── integration/            # Integration tests
└── setup/                  # Test configuration and mocks
```

## Asset Organization

### Static Assets (`public/`)
- `images/` - Public images (avatars, etc.)
- `assets/` - Additional static resources

### Application Assets (`app/assets/`)
- `fonts/` - Custom font files
- `icon/` - SVG icons and favicons
- `images/` - Application-specific images

## Configuration Files

### Build & Development
- `next.config.js` - Next.js configuration with image optimization
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `jest.config.js` - Jest testing configuration

### TypeScript
- `tsconfig.json` - Main TypeScript configuration
- `tsconfig.scripts.json` - Scripts-specific TypeScript config

### Environment & Deployment
- `.env.local` - Local environment variables
- `vercel.json` - Vercel deployment configuration
- `.gitignore` - Git ignore patterns
- `.vercelignore` - Vercel ignore patterns

## Naming Conventions

### Files & Directories
- **Components**: PascalCase (e.g., `CreateAppModal.tsx`)
- **Pages**: lowercase with hyphens for routes (e.g., `[slug]/page.tsx`)
- **Utilities**: camelCase (e.g., `database.ts`)
- **Constants**: UPPER_SNAKE_CASE in code

### Code Conventions
- **React Components**: PascalCase with descriptive names
- **Functions**: camelCase with verb-noun pattern
- **Types/Interfaces**: PascalCase with descriptive suffixes
- **CSS Classes**: Tailwind utilities + custom classes in kebab-case

## Import Organization
1. React and Next.js imports
2. Third-party library imports
3. Internal utility imports (`@/lib/`)
4. Component imports (`@/app/components/`)
5. Type imports (with `type` keyword)
6. Relative imports (`./ ../`)

## Development Workflow
1. Feature branches follow `feature/description` pattern
2. Components co-located with their pages when page-specific
3. Shared utilities extracted to `lib/` directory
4. Tests mirror the source code structure
5. Documentation updated alongside code changes