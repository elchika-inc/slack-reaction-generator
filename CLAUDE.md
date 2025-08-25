# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development
```bash
npm run dev          # Start development server on http://localhost:5173
npm run preview      # Preview production build on http://localhost:4173
```

### Build & Deploy
```bash
npm run build        # Build for production (includes copying _headers, _redirects, sitemap, robots.txt)
npm run deploy       # Build and deploy to Cloudflare Pages via Wrangler
npm run clean        # Clean build artifacts and caches
```

### Testing
```bash
npm test             # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:coverage # Run tests with coverage report
npm run test:ui      # Run tests with UI interface
npm run test:watch   # Run tests in watch mode
```

### Code Quality
```bash
npm run lint         # Run ESLint on src/**/*.{js,jsx}
```

### Performance
```bash
npm run lighthouse   # Run Lighthouse performance monitoring
npm run lighthouse:ci # Run Lighthouse in CI mode
```

## Project Architecture

### Technology Stack
- **Framework**: Preact (aliased as React for compatibility, see config/aliases.js)
- **Build Tool**: Vite with PWA support
- **Styling**: Tailwind CSS with PurgeCSS optimization
- **Language**: TypeScript/JavaScript hybrid (migrating to TypeScript)
- **Testing**: Vitest with Happy DOM
- **Deployment**: Cloudflare Pages

### Core Architecture

#### Canvas-based Icon Generation System
The application uses a multi-layered architecture for generating Slack-compatible emojis:

1. **Icon Generators** (`src/utils/canvas/`)
   - `StaticIconGenerator.ts`: Generates PNG images directly from canvas
   - `AnimatedIconGenerator.ts`: Creates frame-by-frame GIF animations
   - `CanvasRenderer.ts`: Core rendering logic for both static and animated icons

2. **Generation Pipeline** (`src/utils/`)
   - `SafeIconGenerator.ts`: Wrapper with error handling and fallback mechanisms
   - `SimpleGifGenerator.ts`: Simplified GIF generation interface
   - `RenderingPipelines.ts`: Orchestrates the rendering process
   - `GifWorkerManager.ts`: Manages Web Worker for GIF encoding

3. **Context-based State Management** (`src/contexts/`)
   - `AppContext.tsx`: Global application state
   - `IconSettingsContext.tsx`: Icon configuration state
   - `CanvasContext.tsx`: Canvas rendering state
   - `LanguageContext.tsx`: i18n support (Japanese/English)

### TypeScript Migration
The project is actively migrating from JavaScript to TypeScript:
- Strict TypeScript configuration in `tsconfig.json`
- Path aliases configured for cleaner imports (`@/components`, `@/utils`, etc.)
- Type definitions in `src/types/`
- Gradual enforcement of type safety (noUnusedLocals/Parameters currently false)

### Key Design Patterns

1. **Result Pattern**: Error handling using Result<T, E> pattern (`src/utils/Result.ts`)
2. **Factory Pattern**: Canvas creation abstraction (`src/utils/canvasFactory.ts`)
3. **Manager Pattern**: Resource management (CanvasManager, GifWorkerManager)
4. **Component Composition**: Modular UI components with clear separation

### Performance Optimizations
- Code splitting and lazy loading (react-color, file-saver, gif.js)
- Image optimization with inline threshold (4KB)
- Font preloading and caching
- PWA with service worker for offline support
- PurgeCSS for minimal CSS bundle

### Testing Strategy
- Unit tests for utilities and hooks
- Integration tests for canvas operations
- Test builders for consistent test data (`src/__tests__/support/builders.js`)
- Coverage thresholds: 70% for all metrics

## Important Constraints

### Slack Emoji Requirements
- Maximum size: 128x128 pixels
- File size limits: GIF max 128KB, others max 64KB
- Supported formats: PNG, GIF, JPEG

### Browser Compatibility
- Target: ES2015
- Minimum browser versions: Chrome/Edge 90+, Firefox 88+, Safari 14+
- Mobile support required