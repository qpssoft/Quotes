# Quotes Platform - Monorepo

A comprehensive Buddhist quotes platform featuring Vietnamese wisdom, proverbs (Tục Ngữ), and folk songs (Ca Dao) with automatic rotation, search, and customization features.

## 📁 Repository Structure

This is a monorepo containing multiple components:

```
Quotes/
├── quotes-platform/     # Main Angular application
├── specs/              # Feature specifications and design documents
├── documents/          # Additional documentation and references
├── .specify/           # Specify framework configuration and templates
└── .github/            # GitHub workflows and configurations
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Angular CLI 18.x or higher

### Getting Started

```bash
# Clone the repository
git clone https://github.com/qpssoft/Quotes.git
cd Quotes

# Navigate to the application
cd quotes-platform

# Install dependencies
npm install

# Start development server
npm start
```

Visit `http://localhost:4200/` in your browser.

## 📦 Main Components

### quotes-platform/

The primary Angular 18 application providing:

- **Continuous Quote Display**: Auto-rotating quotes with fade transitions
- **Playback Controls**: Play/Pause and Next buttons
- **Configurable Timer**: 5-60 second rotation intervals
- **Audio Notifications**: Gentle chime on transitions
- **Quote Grid**: Responsive browsable grid layout
- **Full-Text Search**: Real-time filtering across content, authors, and categories
- **Customizable Display**: Font selection and display count options
- **LocalStorage Persistence**: All preferences saved automatically
- **Buddhist-Inspired UI**: Warm colors and serene aesthetics

**Technology Stack:**
- Angular 18+ (Standalone Components)
- TypeScript 5.5+
- SCSS with CSS Custom Properties
- Angular Signals for reactive state
- Browser LocalStorage API

**Key Documentation:**
- [Application README](./quotes-platform/README.md)
- [Contributing Guide](./quotes-platform/CONTRIBUTING.md)

### specs/

Feature specifications and design documents using the Specify framework:

- **001-quote-display/**: Complete specification for the quote display feature
  - `spec.md`: User stories with priorities and acceptance criteria
  - `plan.md`: Technical implementation plan and architecture
  - `data-model.md`: Content entities and relationships
  - `research.md`: Technical decisions and research findings
  - `quickstart.md`: Development test scenarios
  - `tasks.md`: Implementation task breakdown
  - `checklists/`: Quality assurance and requirements tracking

### documents/

Additional documentation and quick references:

- `FIGMA_QUICK_REFERENCE.md`: Design system and Figma integration guide

## 🎯 Features

### Core Functionality

- ✅ **Continuous Auto-Rotation**: Seamless quote transitions with configurable timing
- ✅ **Manual Controls**: Pause, resume, and skip to next quote
- ✅ **Audio Feedback**: Gentle notification sound on each transition
- ✅ **Responsive Grid**: Browse multiple quotes simultaneously
- ✅ **Real-Time Search**: Filter by keyword, author, or category
- ✅ **Customization**: Timer intervals, fonts, and display count
- ✅ **Persistence**: User preferences saved across sessions
- ✅ **Accessibility**: WCAG 2.1 compliant with keyboard navigation
- ✅ **Mobile Optimized**: Touch-friendly with responsive layouts (320px to 4K)

### Content Support

- **Buddhist Quotes** (Lời Phật Dạy): Wisdom teachings and dharma insights
- **Vietnamese Proverbs** (Tục Ngữ): Traditional sayings and wisdom
- **Folk Songs** (Ca Dao): Cultural heritage and poetic expressions
- **UTF-8 Support**: Full Vietnamese diacritics rendering

## 🛠️ Development

### Project Setup

```bash
# Install dependencies
cd quotes-platform
npm install

# Start dev server with live reload
npm start

# Run tests
npm test

# Build for production
npm run build
```

### Development Workflow

1. **Spec-Driven Development**: All features start with specifications in `specs/`
2. **Task-Based Implementation**: Follow task breakdown in `tasks.md`
3. **Component-First Architecture**: Standalone Angular components
4. **Type Safety**: Strict TypeScript configuration
5. **CSS Custom Properties**: Theme-based styling system

### Code Structure

```
quotes-platform/src/app/
├── core/
│   ├── models/          # TypeScript interfaces and types
│   └── services/        # Business logic and state management
├── features/
│   ├── controls/        # Rotation controls component
│   ├── quote-display/   # Continuous display component
│   └── quote-grid/      # Grid browsing component
└── shared/
    └── components/      # Reusable UI components
```

## 🌍 Deployment

### GitHub Pages

The application is deployed automatically to GitHub Pages:

**Live Site**: [https://qpssoft.github.io/Quotes/](https://qpssoft.github.io/Quotes/)

#### Automatic Deployment
Every push to `main` branch triggers automatic deployment via GitHub Actions. The workflow:
1. Builds from `quotes-platform/` subfolder
2. Deploys to GitHub Pages
3. Goes live in 2-5 minutes

#### Manual Deployment
```bash
# From quotes-platform directory
cd quotes-platform
npm run deploy:gh-pages
```

**For detailed deployment guide, troubleshooting, and configuration details, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

### Other Hosting Services

```bash
# Build for production
cd quotes-platform
ng build --configuration production --base-href /Quotes/

# Deploy dist/quotes-platform/browser/ to your hosting service
```

## 📊 Project Status

- **Current Version**: 1.0.0
- **Angular Version**: 18.x
- **Status**: ✅ Production Ready
- **Last Updated**: January 2025

### Completed Features

- ✅ User Story 1: Continuous Quote Contemplation (P1)
- ✅ User Story 2: Configurable Meditation Timer (P2)
- ✅ User Story 3: Quote Grid Browsing (P2)
- ✅ User Story 4: Quote Search and Filtering (P3)

## 🧪 Testing

### Unit Tests

```bash
cd quotes-platform
npm test
```

### Manual Testing Scenarios

See `specs/001-quote-display/quickstart.md` for detailed test scenarios including:
- Quote rotation functionality
- Timer configuration
- Search and filtering
- Responsive layout
- Audio notifications
- LocalStorage persistence

## 🎨 Customization

### Adding Quotes

Edit `quotes-platform/public/data/quotes.json`:

```json
{
  "id": "unique-id",
  "content": "Your quote text",
  "author": "Author name",
  "category": "wisdom",
  "type": "Quote"
}
```

### Theme Customization

Modify `quotes-platform/src/styles/theme.css`:

```css
:root {
  --primary-gold: #D4AF37;
  --primary-orange: #FF8C42;
  --bg-primary: #FFF8F0;
  /* Customize Buddhist color palette */
}
```

## 📄 Documentation

- **[Application README](./quotes-platform/README.md)**: Detailed app documentation
- **[Feature Spec](./specs/001-quote-display/spec.md)**: User stories and requirements
- **[Technical Plan](./specs/001-quote-display/plan.md)**: Architecture and implementation
- **[Data Model](./specs/001-quote-display/data-model.md)**: Entity definitions
- **[Task Breakdown](./specs/001-quote-display/tasks.md)**: Implementation checklist
- **[Contributing Guide](./quotes-platform/CONTRIBUTING.md)**: Development guidelines

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./quotes-platform/CONTRIBUTING.md) for:

- Code style guidelines
- Development workflow
- Pull request process
- Testing requirements

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Review specs in `specs/` directory
4. Follow the implementation plan in `tasks.md`
5. Write tests for new functionality
6. Submit a pull request with clear description

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/qpssoft/Quotes/issues)
- **Repository**: [https://github.com/qpssoft/Quotes](https://github.com/qpssoft/Quotes)
- **Documentation**: See `specs/` and `documents/` directories

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Buddhist quotes from public domain teachings
- Vietnamese cultural heritage (Tục Ngữ, Ca Dao)
- Google Fonts (Noto Serif, Merriweather, Lora, Playfair Display, Crimson Text)
- Audio notification: CC0 Public Domain
- Built with Angular 18 and TypeScript

---

**Trí Tuệ Phật Giáo • Nguồn Cảm Hứng Mỗi Ngày**  
*Buddhist Wisdom • Daily Inspiration*

Built with ❤️ by the QPS Software Team
