# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
```bash
# Development
npm run dev              # Start development server at http://localhost:5173

# Build & Deploy
npm run build           # Production build with asset optimization
npm run preview        # Preview production build at http://localhost:4173
npm run deploy         # Build and deploy to Cloudflare Pages

# Quality Checks
npm run lint           # Run ESLint checks
npm run test          # Run Vitest tests
npm run test:coverage # Run tests with coverage report

# Cleanup
npm run clean         # Remove dist/, node_modules/.vite/, .wrangler/
```

### Testing
```bash
npm run test:watch    # Watch mode for test development
npm run test:ui       # Interactive UI test runner
npm run test:run      # Run tests once (CI mode)
```

## Architecture Overview

### Core Technology Stack
- **Frontend**: Preact (React-compatible but 3KB bundle) aliased as React in vite.config.js
- **Build Tool**: Vite with aggressive optimization (terser, purgecss, asset inlining)
- **Styling**: Tailwind CSS with PurgeCSS for minimal bundle
- **Canvas Rendering**: HTML5 Canvas API for icon generation
- **GIF Generation**: gif.js library loaded dynamically
- **Deployment**: Cloudflare Pages with custom headers and redirects

### Application Structure

The app is a single-page Slack emoji generator with:

1. **Main Entry** (`src/main.jsx`): Mounts App component
2. **App Component** (`src/App.jsx`): Manages global state and layout
3. **Component Architecture**:
   - `IconEditor`: Main editing interface with tabs for different settings
   - `PreviewPanel`: Real-time canvas preview with download buttons
   - `editor/` components: Modular settings (Basic, Animation, Image, Optimization)

### State Management Pattern
- Custom hooks pattern for state encapsulation:
  - `useIconSettings`: Core icon configuration state
  - `useCanvasPreview`: Canvas rendering and animation logic
  - `useFileGeneration`: PNG/GIF export functionality
  - `useAppState`: Global app state coordination

### Canvas Rendering Pipeline
1. **Text/Image Input** → `canvasUtils.js` processing
2. **Frame Generation** → `frameRenderer.js` for animations
3. **Export Pipeline** → `canvasFactory.js` creates appropriate canvas instances
4. **Optimization** → `renderingEngine.js` manages render cycles

### Performance Optimizations
- Dynamic imports for heavy libraries (gif.js, react-color)
- Image caching with `imageCache.js`
- Network-aware rendering with `networkAware.js`
- Animation frame debouncing in `animationHelpers.js`
- Canvas pooling to reduce memory allocation

### Build Configuration
- **Preact aliasing**: All React imports resolve to Preact for smaller bundle
- **Asset optimization**: 4KB inline threshold, aggressive minification
- **CSS splitting**: Enabled for better caching
- **PurgeCSS safelist**: Preserves dynamic Tailwind classes and animations

## Code Conventions

### Component Patterns
- Functional components with hooks
- Lazy loading for heavy components (ColorPicker)
- Prop spreading avoided for explicit prop passing
- Event handlers prefixed with `handle` (e.g., `handleTextChange`)

### State Updates
- Use functional updates for dependent state changes
- Debounce expensive operations (canvas rendering)
- Batch related state updates

### Canvas Operations
- Always clear canvas before drawing
- Use requestAnimationFrame for animations
- Dispose of resources (workers, object URLs) in cleanup

### Error Handling
- Centralized error handler in `utils/errorHandler.js`
- Graceful fallbacks for unsupported features
- User-friendly error messages in UI

## Testing Requirements
- Minimum 70% coverage thresholds (branches, functions, lines, statements)
- Test files in `__tests__` directories or `*.test.js`
- Setup file at `src/test/setup.js` for test environment
- Use Vitest globals (describe, it, expect, vi)

## Deployment Notes
- Cloudflare Pages deployment via Wrangler
- Custom headers in `_headers` for security and caching
- Redirects in `_redirects` for URL handling
- Static assets in `public/` directory
- Sitemap and robots.txt for SEO