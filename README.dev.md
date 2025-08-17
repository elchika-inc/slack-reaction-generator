# Developer Documentation - Slack Reaction Generator

This document provides comprehensive information for developers working on or contributing to the Slack Reaction Generator project.

## 🏗️ Project Architecture

### Tech Stack
- **Frontend**: React (via Preact) + Vite
- **Styling**: Tailwind CSS + PostCSS
- **Canvas Manipulation**: HTML5 Canvas API
- **Animation**: GIF.js library
- **File Handling**: FileSaver.js
- **Build Tool**: Vite
- **Deployment**: Cloudflare Pages (via Wrangler)

### Key Dependencies
```json
{
  "@preact/compat": "^18.3.1",
  "file-saver": "^2.0.5",
  "gif.js": "^0.2.0",
  "preact": "^10.27.0",
  "react-color": "^2.19.3",
  "sharp": "^0.34.3"
}
```

## 🚀 Development Setup

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd slack-reaction-generator

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts
```bash
# Development
npm run dev              # Start dev server with hot reload

# Building
npm run build            # Build for production
npm run postbuild        # Run post-build scripts (prerender, CSS extraction)

# Quality Assurance
npm run lint             # Run ESLint

# Deployment
npm run deploy           # Build and deploy to Cloudflare Pages
npm run preview          # Preview production build locally

# Utilities
npm run clean            # Clean build artifacts
```

## 📁 Project Structure

```
slack-reaction-generator/
├── public/                 # Static assets
│   ├── favicon variants
│   ├── manifest.json
│   ├── robots.txt
│   └── worker files
├── src/
│   ├── components/        # React components
│   │   ├── ColorPicker.jsx
│   │   ├── Header.jsx
│   │   ├── IconEditor.jsx
│   │   ├── MobilePreviewModal.jsx
│   │   └── PreviewPanel.jsx
│   ├── constants/         # Application constants
│   │   └── canvasConstants.js
│   ├── utils/            # Utility functions
│   │   ├── canvasUtils.js      # Canvas manipulation
│   │   ├── networkAware.js     # Network optimization
│   │   └── textRenderer.js     # Text rendering
│   ├── App.jsx           # Main application component
│   ├── main.jsx          # Application entry point
│   └── index.css         # Global styles
├── scripts/              # Build scripts
│   ├── convert-images.js
│   ├── extract-critical-css.js
│   └── prerender.js
├── _headers              # Cloudflare headers
├── _redirects            # Cloudflare redirects
└── Configuration files
```

## 🔧 Core Components

### App.jsx
Main application component that manages:
- State management for icon settings
- Mobile/desktop responsive behavior
- Canvas rendering and animation
- File generation and download

### IconEditor.jsx
The main editing interface containing:
- Text input and formatting controls
- Color picker integration
- Animation selection
- Font family options

### PreviewPanel.jsx
Desktop preview component featuring:
- Real-time canvas rendering
- Export functionality
- Multiple size previews (128x128, 32x32)

### Canvas Utilities (canvasUtils.js)
Core canvas manipulation functions:
- `generateIconData()`: Main generation function
- `drawTextIcon()`: Static text rendering
- `drawAnimationFrame()`: Animation frame rendering
- Font loading and caching
- Performance optimizations

## 🎨 Canvas Rendering System

### Text Rendering Pipeline
1. **Font Loading**: Async font loading with fallbacks
2. **Size Calculation**: Auto-sizing based on canvas dimensions
3. **Positioning**: Center alignment with overflow handling
4. **Color Application**: Solid colors and gradients
5. **Background**: Transparent or colored backgrounds

### Animation System
- **Frame-based**: 30 frames per animation cycle
- **Configurable Speed**: 20ms to 1000ms per frame
- **Effect Types**: Glow, pulse, bounce, shake, rotate, blink
- **Performance**: RequestAnimationFrame with throttling

### Optimization Strategies
- **Network-aware**: Reduced features on slow connections
- **Memory management**: Canvas cleanup and GC optimization
- **Lazy loading**: Deferred font and library loading
- **Mobile optimization**: Reduced animation complexity

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 1024px
- **Desktop**: ≥ 1024px

### Mobile-specific Features
- Fixed bottom preview panel
- Auto-download on generation
- Simplified UI elements
- Touch-optimized controls

## 🔄 Build Process

### Development Build
1. Vite dev server with hot module replacement
2. PostCSS processing for Tailwind
3. ESLint integration

### Production Build
1. **Vite Build**: Bundle optimization and minification
2. **Prerendering**: Static HTML generation (`scripts/prerender.js`)
3. **Critical CSS**: Inline critical styles (`scripts/extract-critical-css.js`)
4. **Asset Copying**: Headers and redirects for Cloudflare

### Deployment Pipeline
- Cloudflare Pages integration via Wrangler
- Automatic builds on git push
- Custom headers for performance optimization

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] Text input functionality
- [ ] Color picker operation
- [ ] Animation previews
- [ ] File download (GIF/PNG)
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility
- [ ] Performance on slow networks

### Performance Metrics
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Canvas rendering: < 100ms per frame
- File generation: < 3s for complex animations

## 🔍 Code Quality

### ESLint Configuration
```json
{
  "extends": ["eslint:recommended", "@vitejs/plugin-react"],
  "rules": {
    "react-hooks/exhaustive-deps": "warn",
    "no-unused-vars": "error"
  }
}
```

### Best Practices
- **Component Structure**: Single responsibility principle
- **State Management**: Minimal state with clear data flow
- **Performance**: Memoization and effect cleanup
- **Accessibility**: ARIA labels and keyboard navigation
- **Error Handling**: Graceful degradation

## 🚀 Performance Optimizations

### Loading Performance
- Critical CSS inlined in HTML
- Font preloading and display optimization
- Resource prefetching for future interactions
- Service worker for offline capability

### Runtime Performance
- Canvas operations throttling
- Memory leak prevention
- Network-aware feature toggles
- Efficient animation frame management

### Bundle Optimization
- Code splitting for large dependencies
- Tree shaking for unused code
- Asset compression and optimization
- CDN utilization for external resources

## 🔒 Security Considerations

### Input Validation
- Text input sanitization
- File upload restrictions
- MIME type validation
- Size limitations

### Content Security Policy
- Strict CSP headers via `_headers`
- Inline script restrictions
- External resource limitations

## 📊 Analytics & Monitoring

### Performance Monitoring
- Core Web Vitals tracking
- Error logging and reporting
- User interaction metrics
- Network performance analysis

### Feature Usage
- Animation preference tracking
- Font selection analytics
- Download format distribution
- Mobile vs desktop usage

## 🛠️ Development Tools

### Recommended Extensions
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- ESLint
- Prettier

### Debug Configuration
```javascript
// Vite debug mode
localStorage.setItem('debug', 'slack-reaction-generator:*');
```

## 🚦 Contributing Guidelines

### Code Style
- Use functional components with hooks
- Follow React best practices
- Maintain consistent naming conventions
- Document complex functions

### Pull Request Process
1. Fork and create feature branch
2. Implement changes with tests
3. Update documentation
4. Submit PR with clear description
5. Address review feedback

### Issue Reporting
- Use provided issue templates
- Include browser and device information
- Provide reproduction steps
- Attach relevant screenshots

## 📈 Future Enhancements

### Planned Features
- SVG export support
- Batch processing
- Template library
- Advanced animation editor
- Cloud storage integration

### Technical Debt
- Migrate to newer React features
- Improve TypeScript coverage
- Enhanced error boundaries
- Better state management

---

For additional technical questions, please refer to the main README or create an issue on GitHub.