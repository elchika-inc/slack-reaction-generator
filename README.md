# Slack Reaction Generator

A web application for creating custom Slack emojis and reactions with ease. Generate animated GIFs and static PNG icons from text or images with real-time preview.

[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-orange)](https://slack-emoji-generator.elchika.app/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🎨 Features

- **Text-to-Emoji Generation**: Create custom emojis from any text with various fonts and styles
- **Image Upload Support**: Convert images into Slack-compatible emojis
- **Animation Effects**: Add bounce, shake, rotate, pulse, and slide animations to your emojis
- **Real-time Preview**: See your changes instantly as you customize
- **Multiple Export Formats**: Download as PNG (static) or GIF (animated)
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices
- **Japanese Font Support**: Full support for Japanese characters with Noto Sans JP
- **No Server Required**: Everything runs in your browser for privacy and speed

## 🚀 Quick Start

### For Users

1. Visit [https://slack-emoji-generator.elchika.app/](https://slack-emoji-generator.elchika.app/)
2. Enter your text or upload an image
3. Customize colors, fonts, and animations
4. Preview your emoji in real-time
5. Download as PNG or GIF
6. Upload to your Slack workspace

### Slack Emoji Requirements

- **Size**: Maximum 128x128 pixels
- **File Size**:
  - GIF: Maximum 128KB
  - Other formats: Maximum 64KB
- **Formats**: PNG, GIF, or JPEG

## 💻 For Developers

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/slack-emoji-generator.git
cd slack-emoji-generator

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev

# Run linter
npm run lint

# Run tests
npm test
```

### Building

```bash
# Production build
npm run build

# Preview production build
npm run preview

# Clean build artifacts
npm run clean
```

### Deployment

The application is configured for deployment on Cloudflare Pages:

```bash
# Deploy to Cloudflare Pages
npm run deploy
```

### Project Structure

```
├── src/
│   ├── components/       # React components
│   │   ├── Header.jsx
│   │   ├── IconEditor.jsx
│   │   └── PreviewPanel.jsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useIconSettings.js
│   │   ├── useFileGeneration.js
│   │   └── useCanvasPreview.js
│   ├── utils/            # Utility functions
│   │   ├── canvasUtils.js     # Canvas manipulation
│   │   ├── fontLoader.js      # Font loading logic
│   │   └── animationUtils.js  # Animation utilities
│   └── main.jsx          # Application entry point
├── public/               # Static assets
├── dist/                 # Build output
└── package.json
```

### Technology Stack

- **Frontend Framework**: Preact (React-compatible, smaller bundle size)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Canvas API**: HTML5 Canvas for image generation
- **GIF Generation**: gif.js library
- **Deployment**: Cloudflare Pages
- **PWA**: Progressive Web App capabilities

### Key Features Implementation

#### Canvas-Based Icon Generation

- Static icons rendered directly to canvas and exported as PNG
- Animated icons generated frame-by-frame using gif.js
- Font preloading and caching for better performance

#### Performance Optimizations

- Lazy loading of heavy libraries (gif.js, file-saver, react-color)
- Code splitting for optimal bundle sizes
- Critical CSS inlining for faster initial paint
- Preact instead of React for smaller bundle size

#### Responsive Design

- Mobile-first approach with breakpoint at 1024px
- Desktop: Side-by-side editor and preview
- Mobile: Fixed bottom preview with scrollable editor

### Configuration

#### Environment Variables

No environment variables required for basic operation.

#### Vite Configuration

See `vite.config.js` for build optimization settings:

- React aliased to Preact for smaller bundle
- Aggressive minification with Terser
- Asset optimization with 4KB inline threshold

#### Cloudflare Pages

Configuration in `wrangler.toml`:

- Custom headers in `_headers`
- Redirects in `_redirects`

### Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# UI test runner
npm run test:ui
```

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Performance Metrics

- Lighthouse Score: 95+ (Performance)
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Bundle Size: < 200KB (gzipped)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [gif.js](https://github.com/jnordberg/gif.js) - GIF encoding in JavaScript
- [Preact](https://preactjs.com/) - Fast 3kB alternative to React
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vite](https://vitejs.dev/) - Next generation frontend tooling

## 📧 Contact

For questions or support, please open an issue on GitHub.

## 🔗 Links

- [Live Demo](https://slack-emoji-generator.elchika.app/)
- [Documentation](https://github.com/yourusername/slack-emoji-generator/wiki)
- [Bug Reports](https://github.com/yourusername/slack-emoji-generator/issues)
