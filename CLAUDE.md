# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
```bash
npm run dev              # Start development server on port 5173
npm run preview          # Preview production build on port 4173
npm run lint             # Run ESLint
```

### Building and Deployment
```bash
npm run build            # Production build to dist/
npm run postbuild        # Post-build processing (prerender, CSS extraction, asset copying)
npm run deploy           # Build and deploy to Cloudflare Pages
npm run clean            # Remove build artifacts
```

The build process includes:
1. Vite bundle with Terser minification and aggressive optimizations
2. Prerendering script that optimizes the loading placeholder
3. Critical CSS extraction and inlining
4. Asset copying (_headers, _redirects for Cloudflare)

## Architecture Overview

### React-to-Preact Setup
This project uses **Preact** instead of React for bundle size optimization. Vite config aliases React imports to preact/compat, allowing React components and libraries to work seamlessly.

### Canvas-Based Icon Generation
Core functionality centers around HTML5 Canvas manipulation:
- **Static icons**: Direct canvas rendering to PNG via `drawTextIcon()`
- **Animated icons**: Frame-based GIF generation using gif.js library
- **Performance optimization**: Lazy loading of heavy libraries (gif.js, file-saver, react-color)

### Mobile-First Responsive Design
Two distinct UI modes controlled by viewport width (1024px breakpoint):
- **Desktop**: Side-by-side editor and preview panels
- **Mobile**: Fixed bottom preview with full-screen editor above

### Key Canvas Utilities (`src/utils/canvasUtils.js`)
- `generateIconData()`: Main entry point for icon generation
- `drawTextIcon()`: Static text rendering with font loading and caching
- `drawAnimationFrame()`: Per-frame animation rendering for GIFs
- Supports multiple text effects, gradients, and animation types

### State Management Pattern
Single central state object in App.jsx containing all icon settings:
- Text content, fonts, colors, animations
- Background settings (transparent vs colored)
- Animation speed and effects
- Propagated down to child components via props

### PWA Configuration
Configured as Progressive Web App with:
- Service worker for offline functionality
- Font caching for Google Fonts
- Install prompts for mobile devices

### Performance Optimizations
- **Lazy loading**: Heavy libraries loaded only when needed
- **Code splitting**: Separate chunks for color picker, GIF generation, file saving
- **Network awareness**: Feature reduction on slow connections
- **Critical CSS**: Inlined in HTML for faster first paint
- **Font optimization**: Preloading with display:swap

### Build Optimization Strategy
- Manual chunk splitting for vendor libraries
- Aggressive Terser compression with console removal
- Asset optimization with 4KB inline threshold
- Prerendering for better loading UX

### Deployment on Cloudflare Pages
Uses Wrangler configuration in `wrangler.toml` with custom headers and redirects from `_headers` and `_redirects` files.