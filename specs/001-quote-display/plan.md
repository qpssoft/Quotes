# Implementation Plan: Buddhist Quotes Display Platform

**Branch**: `001-quote-display` | **Date**: 2025-01-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-quote-display/spec.md`

## Summary

Build a Buddhist quotes platform with two-section layout: (1) continuous auto-rotating quote display at the top (1/3 screen height) with configurable timer (5-60s), play/pause/next controls, and always-on audio notifications, and (2) browsable grid of 12 quotes below (2/3 screen height) with full-text search and responsive design (4 columns desktop → 1-2 columns mobile). The platform uses pure static JSON architecture (no backend), loads complete dataset on init (~10K quotes), implements immediate fade transitions (no gaps), prevents consecutive repeats via 5-quote history, and supports GitHub Pages deployment with Vietnamese UTF-8 encoding.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enabled), Angular 18+ (standalone components, signals for reactive state)
**Primary Dependencies**: 
- Angular CLI (build tooling)
- RxJS (reactive programming for timer/search)
- Angular Router (single-page app routing)
- Angular Forms (search input, timer dropdown)
**Storage**: 
- Static JSON file (`assets/data/quotes.json`) with ~10K quotes loaded on init
- localStorage for user preferences (timer interval, play/pause state, last-viewed quotes cache)
**Testing**: 
- Jasmine + Karma (component/service unit tests - optional)
- Cucumber/Gherkin + Playwright (BDD e2e tests with 22 acceptance scenarios - optional)
**Target Platform**: 
- Web-only (no native mobile apps in V1)
- Desktop (1024px+), Tablet (768-1023px), Mobile (320-767px)
- Modern browsers: Chrome, Firefox, Safari, Edge (last 2 versions)
**Project Type**: Angular SPA with static JSON data, GitHub Pages deployment
**Performance Goals**: 
- <3s initial page load (10 Mbps broadband)
- <1s quote transitions (fade-out + fade-in + audio)
- <500ms search results update (debounced)
- <300ms responsive grid re-layout on viewport resize
**Constraints**: 
- No backend server or database (pure static)
- No user accounts or authentication (V1 scope)
- Always-on audio notification (no toggle option)
- Web-only platform (no native iOS/Android apps)
- GitHub Pages subdirectory routing support required (`/<repo-name>/`)
- Vietnamese UTF-8 encoding (proper diacritic rendering)
- Mobile accessibility: 44x44px touch targets, 16px+ text, no horizontal scroll
**Scale/Scope**: 
- ~10,000 Buddhist quotes in single JSON file (optimized for full dataset load)
- Full-text search across content/author/category fields
- Auto-rotation with configurable 5-60s intervals
- 5-quote history for consecutive repeat prevention
- 12-quote grid display with responsive column layout
- Buddhist-inspired UI aesthetic (soft colors, calming typography, ample whitespace)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with principles from `.specify/memory/constitution.md`:

- [x] **Static JSON Data Architecture**: ✅ Design uses single static JSON file loaded on init. No backend dependencies. Performance: full dataset load optimized for ~10K quotes (target <3s). Content taxonomy: Quote entity with id/content/author/category/type fields. UTF-8 encoding for Vietnamese diacritics. localStorage for caching last-viewed quotes.
- [x] **Angular Modern Web Standards**: ✅ Angular 18+ with TypeScript strict mode. Standalone components. Angular signals for reactive state (timer, search query, displayed quote). Configured for GitHub Pages deployment with subdirectory routing.
- [x] **Buddhist-Inspired Content-First UX**: ✅ Two-section layout (1/3 continuous display + 2/3 grid). Buddhist aesthetic: soft colors, calming typography, ample whitespace, serene visual design. Mobile-first: 44x44px touch targets, 16px+ text, no horizontal scroll, responsive grid (4→2→1 columns). Full-text search across all quotes. Vietnamese UTF-8 rendering verified. V1 focus: core quote display/search/rotation UX validation.
- [x] **Performance at Scale**: ✅ Full dataset load on init (<3s target on broadband). Search debounced 500ms. Quote transitions <1s. Grid re-layout <300ms. Web Workers not needed for 10K quotes (in-memory search sufficient). localStorage caching for last-viewed quotes (prevent repeats). Responsive grid optimized for mobile rendering.
- [x] **Simplicity**: ✅ Minimal dependencies (Angular core + RxJS only). No backend/database/auth. HTML5 Audio API (no external audio libraries). Pure client-side state management. V1 scope: display, search, rotation, audio only. No over-engineering.
- [x] **BDD Testing (if tests included)**: ✅ Spec contains 22 acceptance scenarios in Given-When-Then (Gherkin) format. E2e test structure planned: `tests/features/*.feature` (Gherkin) + `tests/steps/` (Playwright step definitions). Tests are optional for V1 but spec is test-ready.

**Violations Requiring Justification**: None - full constitution compliance achieved.

## Project Structure

### Documentation (this feature)

```text
specs/001-quote-display/
├── spec.md              # Feature specification (completed)
├── plan.md              # This implementation plan (current file)
├── research.md          # Phase 0: Technology research and decisions
├── data-model.md        # Phase 1: Quote entity and JSON schema
├── quickstart.md        # Phase 1: Developer onboarding guide
├── contracts/           # Phase 1: (Not needed - no APIs, static JSON only)
└── tasks.md             # Phase 2: Task breakdown (created by /speckit.tasks)
```

### Source Code (repository root)

```text
quotes-platform/         # Repository root
├── src/
│   ├── app/
│   │   ├── core/                    # Singleton services and guards
│   │   │   ├── services/
│   │   │   │   ├── quote-data.service.ts       # JSON loading and caching
│   │   │   │   ├── quote-rotation.service.ts   # Auto-rotation timer logic
│   │   │   │   ├── audio-notification.service.ts  # Sound playback
│   │   │   │   └── storage.service.ts          # localStorage wrapper
│   │   │   └── models/
│   │   │       ├── quote.model.ts              # Quote interface
│   │   │       └── timer-config.model.ts       # Timer interval type
│   │   ├── shared/                  # Shared components and utilities
│   │   │   ├── components/
│   │   │   │   └── quote-card/                 # Reusable quote card
│   │   │   │       ├── quote-card.component.ts
│   │   │   │       ├── quote-card.component.html
│   │   │   │       └── quote-card.component.scss
│   │   │   └── pipes/
│   │   │       └── search-filter.pipe.ts       # Full-text search filter
│   │   ├── features/                # Feature modules
│   │   │   ├── quote-display/               # Continuous display section
│   │   │   │   ├── quote-display.component.ts
│   │   │   │   ├── quote-display.component.html
│   │   │   │   └── quote-display.component.scss
│   │   │   ├── quote-grid/                  # Grid browsing section
│   │   │   │   ├── quote-grid.component.ts
│   │   │   │   ├── quote-grid.component.html
│   │   │   │   └── quote-grid.component.scss
│   │   │   └── controls/                    # Timer and playback controls
│   │   │       ├── rotation-controls.component.ts
│   │   │       ├── rotation-controls.component.html
│   │   │       └── rotation-controls.component.scss
│   │   ├── app.component.ts         # Root component (two-section layout)
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.config.ts            # Angular 18+ standalone app config
│   │   └── app.routes.ts            # Routing configuration (minimal for V1)
│   ├── assets/
│   │   ├── data/
│   │   │   └── quotes.json          # Static Buddhist quotes dataset
│   │   └── audio/
│   │       └── notification.mp3     # Quote transition sound
│   ├── styles/
│   │   ├── _variables.scss          # Buddhist-inspired color palette
│   │   ├── _typography.scss         # Calming font styles
│   │   └── styles.scss              # Global styles
│   └── environments/
│       ├── environment.ts           # Development config
│       └── environment.prod.ts      # Production config (GitHub Pages base path)
├── tests/
│   ├── features/                    # Cucumber/Gherkin feature files (optional)
│   │   ├── continuous-display.feature
│   │   ├── timer-configuration.feature
│   │   ├── quote-grid.feature
│   │   └── search-filtering.feature
│   └── steps/                       # Playwright step definitions (optional)
│       └── quote-display.steps.ts
├── angular.json                     # Angular CLI configuration
├── tsconfig.json                    # TypeScript configuration (strict mode)
├── package.json                     # Dependencies
└── README.md                        # Project documentation
```

**Structure Decision**: Using Angular web application structure with standalone components (Angular 18+ pattern). Three main feature components: (1) `quote-display` for continuous auto-rotation section, (2) `quote-grid` for browsable 12-quote grid, (3) `controls` for play/pause/next/timer UI. Core services handle data loading, rotation logic, audio playback, and localStorage persistence. Shared `quote-card` component reused in both display and grid sections. No API contracts directory needed (static JSON only). Optional BDD tests in `tests/features/` with Playwright execution.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: ✅ No violations - plan fully compliant with constitution.

All requirements align with constitutional principles:
- Static JSON architecture (no backend)
- Angular 18+ with TypeScript strict mode
- Buddhist-inspired UX with mobile-first design
- Performance optimized for ~10K quotes
- Simple, focused V1 scope (no over-engineering)
- BDD-ready acceptance scenarios (optional test implementation)

---

## Phase 0: Research & Technology Decisions

### Auto-Rotation Timer Implementation

**Decision**: Use RxJS `interval()` + `switchMap()` for auto-rotation with pause/resume capability

**Rationale**:
- RxJS provides clean reactive timer management with subscription control
- `interval(configuredSeconds * 1000)` creates repeating timer
- Subscription can be paused/unpaused without losing timer state
- Integrates naturally with Angular's change detection
- Avoids `setInterval` memory leak risks

**Alternatives Considered**:
- Native `setInterval`: Harder to pause/resume cleanly, memory leak prone
- Web Workers: Overkill for simple timer, adds complexity unnecessarily
- `requestAnimationFrame`: Not suitable for multi-second intervals

**Best Practices**:
- Store subscription reference for cleanup in `ngOnDestroy`
- Use `takeUntil(destroy$)` pattern to prevent memory leaks
- Emit timer events through Angular signal for reactive UI updates

### Audio Notification Implementation

**Decision**: HTML5 `<audio>` element with preload, triggered via TypeScript `play()` method

**Rationale**:
- Native browser API, no external dependencies
- Preload ensures instant playback (no latency on transition)
- Simple error handling for autoplay restrictions
- MP3 format ensures cross-browser compatibility
- File size <100KB for fast loading

**Alternatives Considered**:
- Howler.js library: Unnecessary dependency for single sound effect
- Web Audio API: Too complex for simple notification sound
- Audio sprite: Not needed for single sound file

**Best Practices**:
- Store `<audio>` element reference in service
- Handle browser autoplay restrictions (play only after user interaction)
- Provide fallback if audio fails to load
- Use moderate volume (0.5-0.7) for non-intrusive notification
- Preload="auto" for instant playback

**Audio File Specifications**:
- Format: MP3 (cross-browser compatible)
- Duration: 0.5-2 seconds
- File size: <100KB
- Type: Soft bell, singing bowl, gentle chime, or water droplet
- Licensing: Creative Commons, royalty-free, or original

### Full-Text Search Strategy

**Decision**: In-memory client-side search using `Array.filter()` + `String.includes()` with debounce

**Rationale**:
- 10K quotes can be searched instantly in-memory (<50ms typical)
- No need for complex indexing libraries (Lunr.js, Fuse.js) at this scale
- Simple case-insensitive string matching across content/author/category
- RxJS `debounceTime(500)` prevents excessive filtering during typing
- Results update reactively via Angular signals

**Alternatives Considered**:
- Lunr.js full-text search: Overkill for 10K items, adds 50KB+ to bundle
- Fuse.js fuzzy search: Unnecessary complexity, larger bundle size
- Web Workers: Not needed for <50ms search operations

**Best Practices**:
- Debounce search input by 500ms to avoid excessive re-renders
- Search lowercase normalized strings for case-insensitive matching
- Search across multiple fields: `content.toLowerCase().includes(query)` OR `author...` OR `category...`
- Use Angular signal for reactive search results
- Cache search results in component until query changes

### Consecutive Quote Prevention

**Decision**: Maintain circular buffer of last 5 quote IDs, exclude from random selection

**Rationale**:
- Prevents immediate repeats while allowing quotes to recur after 5+ displays
- Simple in-memory array management with `Array.push()` + `Array.shift()`
- Negligible memory overhead (5 strings)
- localStorage persistence optional (session-based is sufficient)

**Best Practices**:
- Store history in rotation service state
- Filter history IDs from random selection pool
- Reset history on page reload (session-based prevention)
- If dataset <6 quotes, reduce history size to dataset_size - 1

### Responsive Grid Layout

**Decision**: CSS Grid with media query breakpoints, no JavaScript-based layout

**Rationale**:
- Native CSS Grid provides performant responsive layout
- Breakpoints: 1024px (4 cols), 768px (2-3 cols), 320px (1-2 cols)
- No JavaScript re-calculation needed (better performance)
- Grid automatically reflows on viewport resize

**Best Practices**:
```scss
.quote-grid {
  display: grid;
  gap: 1rem;
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
  
  @media (min-width: 768px) and (max-width: 1023px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
}
```

### localStorage Persistence Strategy

**Decision**: Store timer interval preference only, session-based for other state

**Rationale**:
- Timer preference persists across sessions (user expectation)
- Play/pause state and last-viewed quotes are session-ephemeral
- Minimal localStorage usage reduces privacy concerns
- Graceful degradation if localStorage unavailable (use defaults)

**Best Practices**:
- Check `localStorage` availability before use (try/catch)
- Default to 15s if no stored preference
- Store as `{ timerInterval: 15 }` JSON object for future extensibility
- Clear invalid values (fallback to 15s if stored value not in 5-60 range)

---

## Phase 1: Data Model & Contracts

### Quote Entity Schema

**File**: `data-model.md` (to be generated)

```typescript
interface Quote {
  id: string;              // Unique identifier (UUID or sequential)
  content: string;         // Quote text (Vietnamese or English)
  author: string;          // Attribution (e.g., "Buddha", "Thích Nhất Hạnh")
  category: string;        // Theme (e.g., "wisdom", "compassion", "mindfulness")
  type: 'Quote';           // Literal type (supports future expansion)
  language?: 'vi' | 'en';  // Optional language indicator
  tags?: string[];         // Optional keywords for enhanced search
}
```

**JSON File Format**: `assets/data/quotes.json`

```json
{
  "version": "1.0.0",
  "quotes": [
    {
      "id": "q001",
      "content": "Không có con đường nào dẫn đến hạnh phúc. Hạnh phúc chính là con đường.",
      "author": "Đức Phật",
      "category": "wisdom",
      "type": "Quote",
      "language": "vi"
    },
    {
      "id": "q002",
      "content": "The mind is everything. What you think you become.",
      "author": "Buddha",
      "category": "mindfulness",
      "type": "Quote",
      "language": "en"
    }
  ]
}
```

**Validation Rules**:
- `id`: Required, unique across dataset
- `content`: Required, non-empty string, UTF-8 encoded
- `author`: Required, non-empty string
- `category`: Required, one of predefined set (to be defined in tasks phase)
- `type`: Required, literal 'Quote'
- `language`: Optional, 'vi' or 'en' if specified
- `tags`: Optional array of strings

### Timer Configuration Model

```typescript
type TimerInterval = 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 45 | 50 | 55 | 60;

interface TimerConfig {
  interval: TimerInterval;
  isPlaying: boolean;
}

const TIMER_OPTIONS: TimerInterval[] = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
const DEFAULT_TIMER_INTERVAL: TimerInterval = 15;
```

### Display History Model

```typescript
interface DisplayHistory {
  recentQuoteIds: string[];
  maxSize: number;
}

const MAX_HISTORY_SIZE = 5;
```

### No API Contracts Needed

**Rationale**: Static JSON architecture requires no REST API contracts. All data loaded from single JSON file on initialization. No backend endpoints to document.

### Developer Quickstart

**File**: `quickstart.md` (to be generated)

Key sections:
1. **Prerequisites**: Node.js 18+, npm 9+, Angular CLI 18+
2. **Setup**: `npm install`, `ng serve`, open `http://localhost:4200`
3. **Data**: How to modify `assets/data/quotes.json`
4. **Audio**: How to replace `assets/audio/notification.mp3`
5. **Styling**: Buddhist color palette in `_variables.scss`
6. **Testing**: Optional unit/e2e test setup with Jasmine/Playwright
7. **Deployment**: GitHub Pages build configuration (`ng build --base-href /quotes-platform/`)

---

## Phase 2: Task Breakdown

**Note**: Task breakdown will be generated by `/speckit.tasks` command after this planning phase completes.

**Expected Task Categories**:
1. **Project Setup**: Angular CLI initialization, dependencies, folder structure
2. **Core Services**: Data loading, rotation timer, audio notification, localStorage
3. **Components**: Quote display, quote grid, rotation controls, quote card
4. **Styling**: Buddhist-inspired theme, responsive grid, animations
5. **Testing** (optional): Unit tests, BDD feature files, Playwright e2e
6. **Deployment**: GitHub Pages configuration, production build

**Estimated Complexity**: 
- Core functionality: ~40-60 hours (display + grid + search + rotation + audio)
- Styling & responsive design: ~20-30 hours
- Testing (if implemented): ~20-40 hours
- Total: ~80-130 hours for full V1 implementation

---

## Constitution Re-Check (Post-Design)

*Re-verify compliance after Phase 1 design decisions*

- [x] **Static JSON Data Architecture**: ✅ Confirmed - single JSON file, no backend, full dataset load on init
- [x] **Angular Modern Web Standards**: ✅ Confirmed - Angular 18+ standalone components, TypeScript strict mode, signals
- [x] **Buddhist-Inspired Content-First UX**: ✅ Confirmed - two-section layout, responsive grid, Buddhist aesthetic, mobile-first
- [x] **Performance at Scale**: ✅ Confirmed - in-memory search <50ms, timer operations non-blocking, grid CSS-based
- [x] **Simplicity**: ✅ Confirmed - no external libraries (RxJS only), HTML5 Audio, no over-engineering
- [x] **BDD Testing**: ✅ Confirmed - spec contains 22 Gherkin scenarios ready for Cucumber + Playwright

**Final Assessment**: ✅ All constitutional principles satisfied. Design is implementation-ready.

---

## Next Steps

1. **Generate Research Document**: Run research synthesis for `research.md` (Phase 0 complete above)
2. **Generate Data Model**: Create `data-model.md` with detailed Quote schema and validation rules (Phase 1 complete above)
3. **Generate Quickstart**: Create `quickstart.md` with developer onboarding steps
4. **Update Agent Context**: Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot`
5. **Generate Tasks**: Run `/speckit.tasks` to create detailed task breakdown in `tasks.md`
6. **Begin Implementation**: Start with project setup and core services (data loading, rotation timer)
