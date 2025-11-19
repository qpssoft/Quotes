# Developer Quickstart: Buddhist Quotes Display Platform

**Feature**: 001-quote-display
**Target Audience**: Developers setting up the project for the first time
**Estimated Setup Time**: 15-30 minutes

## Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Minimum Version | Check Command | Installation |
|------|----------------|---------------|--------------|
| Node.js | 18.x or higher | `node --version` | [nodejs.org](https://nodejs.org/) |
| npm | 9.x or higher | `npm --version` | Included with Node.js |
| Git | 2.x or higher | `git --version` | [git-scm.com](https://git-scm.com/) |
| Angular CLI | 18.x or higher | `ng version` | `npm install -g @angular/cli@latest` |

### Optional Tools

- **VS Code**: Recommended editor with Angular extensions
- **Chrome DevTools**: For debugging and performance profiling
- **Playwright**: For running BDD e2e tests (optional)

---

## Quick Start (5 Minutes)

### 1. Clone Repository

```bash
git clone https://github.com/your-username/quotes-platform.git
cd quotes-platform
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- Angular 18+ framework
- RxJS for reactive programming
- TypeScript compiler
- Development tools (ESLint, Prettier)

### 3. Start Development Server

```bash
ng serve
```

Or use the npm script:

```bash
npm start
```

### 4. Open in Browser

Navigate to: [http://localhost:4200](http://localhost:4200)

You should see the Buddhist quotes platform with:
- ✅ Continuous quote display at the top (auto-rotating every 15s)
- ✅ Grid of 12 quotes below
- ✅ Play/Pause/Next controls
- ✅ Timer dropdown (5-60s intervals)
- ✅ Search box for filtering quotes

---

## Project Structure Overview

```text
quotes-platform/
├── src/
│   ├── app/                      # Application source code
│   │   ├── core/                 # Singleton services
│   │   │   ├── services/         # Data, timer, audio, storage services
│   │   │   └── models/           # TypeScript interfaces
│   │   ├── shared/               # Reusable components
│   │   │   └── components/       # Quote card component
│   │   └── features/             # Feature modules
│   │       ├── quote-display/    # Continuous display section
│   │       ├── quote-grid/       # Grid browsing section
│   │       └── controls/         # Timer and playback controls
│   ├── assets/
│   │   ├── data/
│   │   │   └── quotes.json       # ⭐ Buddhist quotes dataset
│   │   └── audio/
│   │       └── notification.mp3  # ⭐ Quote transition sound
│   └── styles/
│       ├── _variables.scss       # ⭐ Buddhist color palette
│       └── styles.scss           # Global styles
├── tests/                        # Optional test files
├── angular.json                  # Angular CLI configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

### Key Files to Know

- **`src/assets/data/quotes.json`**: Add/edit Buddhist quotes here
- **`src/assets/audio/notification.mp3`**: Replace with custom sound
- **`src/styles/_variables.scss`**: Customize Buddhist color theme
- **`src/app/core/services/`**: Core business logic (data, timer, audio)

---

## Working with Quote Data

### Adding New Quotes

Edit `src/assets/data/quotes.json`:

```json
{
  "version": "1.0.0",
  "quotes": [
    {
      "id": "q001",
      "content": "Your new Buddhist quote here",
      "author": "Author Name",
      "category": "wisdom",
      "type": "Quote",
      "language": "en",
      "tags": ["keyword1", "keyword2"]
    }
  ]
}
```

### Quote Fields Reference

| Field | Required | Type | Example | Notes |
|-------|----------|------|---------|-------|
| `id` | ✅ | string | `"q001"` | Unique identifier (use sequential IDs) |
| `content` | ✅ | string | `"The mind is everything..."` | Quote text (max 1000 chars) |
| `author` | ✅ | string | `"Buddha"` | Attribution (max 100 chars) |
| `category` | ✅ | enum | `"wisdom"` | See categories below |
| `type` | ✅ | literal | `"Quote"` | Always `"Quote"` (for V1) |
| `language` | ❌ | enum | `"vi"` or `"en"` | Optional language indicator |
| `tags` | ❌ | array | `["peace", "mind"]` | Optional keywords (max 50 chars each) |

### Valid Categories

```typescript
'wisdom' | 'compassion' | 'mindfulness' | 'meditation' | 
'enlightenment' | 'suffering' | 'peace' | 'impermanence' | 
'karma' | 'dharma'
```

### Vietnamese Quote Example

```json
{
  "id": "q002",
  "content": "Không có con đường nào dẫn đến hạnh phúc. Hạnh phúc chính là con đường.",
  "author": "Đức Phật",
  "category": "wisdom",
  "type": "Quote",
  "language": "vi",
  "tags": ["hạnh phúc", "con đường"]
}
```

### Validating Quote Data

Run validation script to check for errors:

```bash
npm run validate:quotes
```

This checks:
- ✅ JSON syntax is valid
- ✅ All required fields present
- ✅ UTF-8 encoding (no mojibake)
- ✅ No duplicate IDs
- ✅ Categories are valid
- ✅ Field length limits

---

## Customizing the Audio Notification

### Replacing the Sound File

1. Find or create a calming notification sound (MP3 format)
2. Requirements:
   - Duration: 0.5-2 seconds
   - File size: <100KB
   - Type: Soft bell, chime, singing bowl, water droplet
   - Format: MP3 (44.1kHz, 128kbps, mono)

3. Replace file: `src/assets/audio/notification.mp3`

### Recommended Sound Sources

- **Freesound.org**: Search "bell" or "chime" with CC0 license filter
- **Zapsplat.com**: Free sound effects (attribution required)
- **Original Recording**: Record your own singing bowl (preferred for uniqueness)

### Testing Audio

```bash
# Audio plays on every quote transition
# If audio doesn't play:
# 1. Check browser console for autoplay restrictions
# 2. Click play button first (browsers require user interaction)
# 3. Verify file exists at correct path
```

---

## Customizing the Buddhist Theme

### Color Palette

Edit `src/styles/_variables.scss`:

```scss
// Current Buddhist-inspired palette
$primary-color: #8B4513;      // Warm brown (earth, stability)
$secondary-color: #DAA520;    // Gold (enlightenment, wisdom)
$background-color: #FFF8DC;   // Cornsilk (light, serene)
$text-color: #2F4F4F;         // Dark slate (readable, calm)
$accent-color: #CD853F;       // Peru (warmth, compassion)

// Override with your custom colors:
// $primary-color: #your-color;
```

### Typography

```scss
// src/styles/_typography.scss
$font-family-primary: 'Noto Serif', Georgia, serif;  // Contemplative reading
$font-family-secondary: 'Noto Sans', Arial, sans-serif;  // UI elements

$font-size-quote: 1.25rem;     // Quote content (20px)
$font-size-author: 1rem;       // Author attribution (16px)
$font-size-base: 1rem;         // Body text (16px)
```

### Applying Changes

Changes to SCSS files are hot-reloaded automatically when `ng serve` is running.

---

## Development Workflow

### Common npm Scripts

```bash
# Start development server (http://localhost:4200)
npm start

# Run linter (ESLint)
npm run lint

# Fix linting errors automatically
npm run lint:fix

# Format code (Prettier)
npm run format

# Validate quote data
npm run validate:quotes

# Build for production
npm run build

# Build for GitHub Pages deployment
npm run build:gh-pages

# Run unit tests (if implemented)
npm test

# Run e2e tests (if implemented)
npm run e2e
```

### Hot Reload

Angular CLI provides hot module replacement (HMR):
- ✅ Save any `.ts`, `.html`, `.scss` file
- ✅ Browser automatically reloads with changes
- ✅ State preserved when possible

### Debugging Tips

**Problem**: Quotes not loading
```bash
# Check browser console for errors
# Verify quotes.json is valid JSON
npm run validate:quotes

# Check network tab for 404 errors
# Ensure file path is correct: assets/data/quotes.json
```

**Problem**: Audio not playing
```bash
# Check console for autoplay restriction warnings
# Click play button first (user interaction required)
# Verify file exists: assets/audio/notification.mp3
# Try incognito mode (extensions can block audio)
```

**Problem**: Vietnamese text shows incorrectly
```bash
# Verify file encoding: file -I src/assets/data/quotes.json
# Should show: charset=utf-8 (not utf-8-bom or latin1)
# Re-save file as UTF-8 without BOM in VS Code
```

---

## Building for Production

### Local Production Build

```bash
npm run build
```

Output: `dist/quotes-platform/browser/`

Test locally:
```bash
npx http-server dist/quotes-platform/browser -p 8080
# Open: http://localhost:8080
```

### GitHub Pages Deployment

```bash
# Build with GitHub Pages base href
npm run build:gh-pages

# Deploy to gh-pages branch
npx gh-pages -d dist/quotes-platform/browser

# Your app will be live at:
# https://your-username.github.io/quotes-platform/
```

### Production Checklist

- [ ] Run linter: `npm run lint`
- [ ] Validate quotes: `npm run validate:quotes`
- [ ] Test locally with production build
- [ ] Verify audio file is included in `dist/`
- [ ] Check bundle size: `dist/quotes-platform/browser/main-*.js` should be <500KB
- [ ] Test on mobile device (Chrome DevTools device emulation)
- [ ] Verify Vietnamese text renders correctly
- [ ] Test all breakpoints: desktop (1024px+), tablet (768px), mobile (375px)

---

## Testing (Optional)

### Unit Tests (Jasmine + Karma)

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode (re-run on file changes)
npm run test:watch
```

### E2E Tests (Cucumber + Playwright)

```bash
# Install Playwright browsers (one-time setup)
npx playwright install

# Run e2e tests
npm run e2e

# Run specific feature
npx cucumber-js tests/features/continuous-display.feature

# Debug mode (step through)
npm run e2e:debug
```

### Test Structure

```text
tests/
├── features/                  # Gherkin feature files
│   ├── continuous-display.feature
│   ├── timer-configuration.feature
│   └── search-filtering.feature
└── steps/                     # Playwright step definitions
    └── quote-display.steps.ts
```

---

## Troubleshooting

### Common Issues

#### Issue: `ng: command not found`

```bash
# Install Angular CLI globally
npm install -g @angular/cli@latest

# Or use npx (no global install)
npx ng serve
```

#### Issue: `Port 4200 already in use`

```bash
# Kill existing process
# Windows:
netstat -ano | findstr :4200
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:4200 | xargs kill -9

# Or use different port
ng serve --port 4300
```

#### Issue: TypeScript errors after `npm install`

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Angular cache
rm -rf .angular/cache
```

#### Issue: Quotes not displaying

1. Check browser console for errors
2. Verify `quotes.json` is valid: [jsonlint.com](https://jsonlint.com/)
3. Check network tab: `quotes.json` should return 200 status
4. Ensure at least 1 quote in dataset

---

## Next Steps

### For New Developers

1. ✅ Complete this quickstart setup
2. 📖 Read [`spec.md`](./spec.md) - Understand user requirements
3. 📖 Read [`plan.md`](./plan.md) - Review technical architecture
4. 📖 Read [`data-model.md`](./data-model.md) - Understand data structures
5. 🧑‍💻 Pick a task from [`tasks.md`](./tasks.md) - Start contributing

### For Feature Development

1. Create feature branch: `git checkout -b feature/your-feature-name`
2. Make changes (follow Angular style guide)
3. Run linter: `npm run lint`
4. Test changes: `npm test` (if tests exist)
5. Commit with Conventional Commits: `git commit -m "feat: add new feature"`
6. Push and create Pull Request

### For Design Customization

1. Modify color palette in `_variables.scss`
2. Update typography in `_typography.scss`
3. Replace audio notification in `assets/audio/`
4. Test on multiple devices (mobile, tablet, desktop)
5. Verify accessibility (WCAG 2.1 AA compliance)

---

## Resources

### Documentation

- [Angular Documentation](https://angular.io/docs)
- [RxJS Documentation](https://rxjs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Playwright Documentation](https://playwright.dev/) (for e2e tests)

### Project Documentation

- [`spec.md`](./spec.md) - Feature specification with user stories
- [`plan.md`](./plan.md) - Implementation plan and architecture
- [`research.md`](./research.md) - Technology decisions and rationale
- [`data-model.md`](./data-model.md) - Data entities and validation
- [`tasks.md`](./tasks.md) - Task breakdown (generated after planning)

### Constitution

- [`.specify/memory/constitution.md`](../../.specify/memory/constitution.md) - Project governance and principles

---

## Getting Help

### Common Questions

**Q: How do I add more than 10K quotes?**
A: V1 is optimized for ~10K quotes. For larger datasets, consider implementing data chunking (see constitution Future Enhancements).

**Q: Can I change the timer intervals?**
A: Yes! Edit `TIMER_OPTIONS` array in `timer-config.model.ts`. Remember to update UI dropdown options.

**Q: How do I disable audio notification?**
A: Audio is always-on per constitution. To modify, update `AudioNotificationService` (but this violates spec requirements).

**Q: Can I add user accounts?**
A: Not in V1 scope. User contributions are deferred to V2+ (see constitution).

### Contact

- GitHub Issues: [Report bugs or request features](https://github.com/your-username/quotes-platform/issues)
- Discussions: [Ask questions or share ideas](https://github.com/your-username/quotes-platform/discussions)

---

**Welcome to the Buddhist Quotes Platform project! May your code be bug-free and your commits be mindful. 🙏**
