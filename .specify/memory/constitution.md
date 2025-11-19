<!--
SYNC IMPACT REPORT
==================
Version Change: 2.0.0 → 2.1.0
Constitution Type: MINOR amendment (scope refinement + feature additions)
Modified Principles:
  - Principle I: Hybrid Architecture → REFINED: User contributions deferred to V2+ (V1 focuses on curated content only)
  - Principle III: Buddhist-Inspired UX → EXPANDED: Added auto-rotation and audio notification requirements
  - Principle VII: User Contribution → STATUS: Deferred to V2+ (removed from V1 scope)
Added Sections:
  - Auto-Rotation & Notifications (NEW subsection in Principle III)
  - Audio Standards (NEW in Technical Standards)
Removed Sections:
  - User Contribution features moved to "Future Enhancements" section

Templates Status:
  ✅ constitution.md: Clarified V1 scope (static curated content only, no user contributions)
  ✅ V1 Scope: Focus on Buddhist quotes/life lessons with auto-rotation and audio
  ⚠ plan-template.md: Remove backend requirements from V1 technical context
  ⚠ spec-template.md: Remove user contribution scenario examples from V1
  ⚠ tasks-template.md: Remove UGC tasks from V1 examples

V1 ARCHITECTURE DECISION RESOLVED:
  ✅ Option D Selected: Pure static JSON model for V1 (GitHub Pages compatible)
  ✅ User contributions deferred to V2+ after core platform validation
  ✅ Focus: Buddhist quotes & life lessons with search, random display, auto-rotation, audio

New V1 Features:
  - Auto-rotation: New random quote every 30 seconds
  - Sound notification: Audio cue on quote transition
  - Auto-dismiss: Quote fades after 15 seconds
  - Serene UX: Buddhist philosophy-inspired design for practitioners

Follow-up TODOs:
  - Update plan-template.md to remove backend architecture from V1 technical context
  - Update spec-template.md to remove user contribution examples
  - Add audio integration examples to spec-template.md
  - Add auto-rotation timer examples to tasks-template.md
  - Document audio file requirements (format, size, licensing)

Rationale: MINOR version bump (2.1.0) - Requirements analysis revealed user contributions were 
premature for V1. New focus: Buddhist-only content (quotes & life lessons) with enhanced engagement 
features (auto-rotation, audio notifications, auto-dismiss). This SIMPLIFIES v2.0.0 by removing 
hybrid architecture complexity from V1 scope while adding interactive features (timers, audio) that 
don't require backend. User contributions preserved as V2+ enhancement. This aligns with V1 
experimentation goals: validate core value proposition before investing in UGC infrastructure.
-->

# Quotes Platform Constitution

## Core Principles

### I. Static JSON Data Architecture (V1)

The platform MUST use static JSON data files as the single source of truth for all curated content. All content operations (search, filter, display, random selection) MUST operate on this static data without backend server dependencies.

**Data Loading Strategy (V1)**: Load complete dataset from static JSON file(s) on application initialization. All quotes available in memory for instant search, random selection, and display. No chunking or lazy-loading in V1 (optimized for datasets up to ~10K quotes for fast initial load).

**Content Domain & Taxonomy**: The V1 dataset focuses on Buddhist wisdom content:
- **Buddhist Quotes**: Traditional Buddhist teachings and wisdom with attributed authors
- **Life Lessons**: Inspirational teachings and practical wisdom from Buddhist philosophy
- Additional content types (Vietnamese proverbs, ca dao, general wisdom) MAY be included if relevant to Buddhist philosophy

Each content item MUST include complete metadata (content text, author/source, category, tags, language indicator [vi/en]). The JSON schema MUST support all content types with consistent structure while allowing type-specific fields. Unicode UTF-8 encoding is MANDATORY for multilingual text preservation (Vietnamese diacritics, tone marks, special characters).

**V1 Architectural Decision**: Pure static JSON model (no backend) for initial release. This enables:
- GitHub Pages deployment (zero hosting costs)
- Offline-first capabilities
- Predictable performance
- Simple maintenance
- Fast iteration during experimentation phase

**Future Enhancement (V2+)**: User-generated content MAY be added in future versions with hybrid architecture (static curated + dynamic user submissions). This is deferred until core platform value is validated.

**Rationale**: Static architecture ensures simplicity, eliminates backend complexity, enables offline-first capabilities, and provides predictable performance at scale for read-heavy content consumption. Focus on curated Buddhist content in V1 allows validation of core user experience before adding community contribution complexity.

### II. Angular Modern Web Standards

All development MUST use Angular (latest stable version at project start). The codebase MUST follow Angular's official style guide, use standalone components where appropriate, leverage Angular signals for reactive state, and implement lazy-loading for routes and data chunks. TypeScript MUST be used with strict mode enabled.

**Rationale**: Angular provides a robust, enterprise-ready framework with strong typing, built-in tooling, and proven patterns for large-scale content platforms. Latest version ensures access to modern features and long-term support.

### III. Buddhist-Inspired Content-First UX

The platform MUST prioritize content discovery and contemplative engagement with Buddhist aesthetic principles, optimized for cross-platform use (mobile, tablet, desktop). The design MUST serve Buddhist practitioners with a lifestyle-oriented approach reflecting Buddhist philosophy and aphorisms.

**Visual Design**:
- MUST use two-section layout:
  - **Top section (1/3 screen height)**: Continuous auto-rotating quote display with controls
  - **Bottom section (2/3 screen)**: Grid of 12 quotes in 4-column layout (desktop), responsive to 1-2 columns (mobile)
- Cards MUST display full quote text content with author attribution
- MUST use calming, mindful design elements (soft colors, ample whitespace, serene typography)
- MUST embody Buddhist philosophy through visual design choices (tranquility, simplicity, mindfulness)
- Typography MUST be optimized for contemplative reading with sufficient size (16px minimum on mobile)
- Mobile: Support vertical scrolling or carousel/swipeable cards for quote grid

**Core Interactions**:
- Full-text search across quote content, author, and category (case-insensitive, searches loaded dataset)
- Search displays matching quotes in bottom grid section
- Category filtering for thematic browsing (optional feature)
- Random quote selection for continuous display area
- Responsive design: 4-column grid (desktop) → 2-column (tablet) → 1-column scrollable or swipeable carousel (mobile)
- Touch-friendly interactions (44x44px minimum touch targets)
- Navigation MUST be intuitive with clear information hierarchy

**Auto-Rotation & Notifications** (V1 Feature):
- MUST display quotes continuously in dedicated display area (top 1/3 of screen)
- MUST auto-rotate with configurable interval (5-60s in 5s increments, default: 15s)
- Quote transition: fade-out current quote, then immediately fade-in next quote (no blank gaps)
- MUST play notification sound on every transition (always ON, non-toggleable)
- User controls: Play/Pause button and Next button (skip to next quote immediately)
- Timer interval configurable via dropdown (5s, 10s, 15s, 20s, 25s, 30s, 35s, 40s, 45s, 50s, 55s, 60s)
- Random quote selection from loaded dataset (prevent immediate repeats)

**Cross-Platform Compatibility**:
- Responsive design supporting 320px-2560px widths
- Mobile viewport optimization: readable text without zooming, no horizontal scroll
- Desktop/tablet optimization: efficient use of screen space while maintaining readability
- Touch and mouse interaction support
- - **Vietnamese Text**: Proper Unicode normalization (NFC) for consistent diacritic rendering across browsers and platforms

### Audio Standards

- **Format**: MP3 or OGG for browser compatibility (provide both formats for best cross-browser support)
- **Sound Notification Requirements**:
  - MUST be subtle and calming (aligns with Buddhist aesthetic)
  - SHOULD be short duration (< 2 seconds)
  - MUST be non-intrusive (low volume by default)
  - Examples: Soft bell tone, singing bowl, gentle chime, nature sounds (water droplet, wind chime)
- **Implementation**:
  - Use HTML5 `<audio>` element or Audio API
  - Preload audio file for instant playback (no loading delay)
  - Handle autoplay restrictions (most browsers require user interaction before audio)
  - Provide fallback if audio fails to load/play
- **User Controls**:
  - Sound is ALWAYS ON (no toggle option)
  - Sound plays automatically on every quote transition as notification cue
  - No user preference needed for sound (mandatory feature)
- **File Size**: Audio file SHOULD be < 100KB for fast loading
- **Licensing**: Audio files MUST be properly licensed (Creative Commons, royalty-free, or original)



**Rationale**: Buddhist content requires presentation that honors its contemplative nature while engaging practitioners through mindful interactions. Auto-rotation and audio cues create a meditative rhythm without requiring user attention, supporting passive contemplation. Mobile-first design ensures accessibility across all devices where practitioners engage with wisdom content. Auto-dismiss prevents screen burn-in and maintains visual freshness.

**Rationale**: Buddhist content requires presentation that honors its contemplative nature while engaging practitioners through mindful interactions. Auto-rotation and audio cues create a meditative rhythm without requiring user attention, supporting passive contemplation. Mobile-first design ensures accessibility across all devices where practitioners engage with wisdom content. Auto-dismiss prevents screen burn-in and maintains visual freshness.

### IV. Performance at Scale

The platform MUST handle large content datasets (target: support up to 500K items for future growth) with sub-second search response times on all platforms (mobile, tablet, desktop). Initial page load MUST be under 3 seconds on standard mobile connections (4G). Search and filter operations MUST use web workers for non-blocking UI. Data MUST be chunked and loaded incrementally with mobile bandwidth constraints considered. Bundle size MUST be optimized through code splitting and tree-shaking, with initial payload prioritized for fast first render.

**Auto-Rotation Performance**:
- Timer-based operations MUST NOT block UI rendering
- Quote transitions MUST be smooth (60fps animations)
- Audio playback MUST be asynchronous and non-blocking
- Memory leaks MUST be prevented in long-running timer operations

**Cross-Platform Optimization**:
- Touch event debouncing on mobile
- Virtual scrolling for long lists
- Lazy-loading for off-screen content
- Efficient DOM manipulation for auto-rotation (reuse quote card elements)

**Rationale**: Large datasets can degrade user experience if not handled properly. Performance requirements ensure the platform remains responsive and usable at scale across all devices. Auto-rotation features require careful performance optimization to maintain smooth UX during extended usage sessions.

### V. Simplicity and Maintainability

Features MUST be implemented with minimal complexity. Avoid premature optimization, over-engineering, or speculative features. Code MUST be self-documenting with clear naming conventions. Dependencies MUST be justified and kept minimal. The codebase MUST remain approachable for contributors familiar with Angular basics.

**V1 Simplicity Focus**: 
- Pure static architecture (no backend, no database, no authentication)
- Client-side timers and state management only (no WebSockets, no real-time sync)
- Simple audio playback (HTML5 Audio API, no complex audio libraries)
- localStorage for user preferences (sound toggle, timer settings)
- Focused feature set: browse, search, random, auto-rotation

**Rationale**: Simplicity reduces maintenance burden, lowers barriers to contribution, and ensures long-term sustainability. V1 deliberately avoids backend complexity to validate core value proposition before investing in infrastructure. Choose boring, proven technology over novel solutions.

### VI. Behavior-Driven Development (BDD) Testing

When tests are implemented, they MUST follow Behavior-Driven Development principles using Gherkin syntax for feature specifications and Playwright for test execution. All end-to-end test scenarios MUST be written in Cucumber/Gherkin format (`.feature` files) describing user behavior in Given-When-Then format. Test implementations MUST use Playwright to execute these scenarios, providing cross-browser validation on Chromium, Firefox, and WebKit. Feature specifications in `/specs/[feature]/spec.md` MUST use Gherkin-compatible acceptance criteria (Given-When-Then) to ensure seamless translation to automated tests.

**Rationale**: BDD aligns tests with user requirements through human-readable specifications, enabling collaboration between technical and non-technical stakeholders. Gherkin provides living documentation that stays synchronized with test execution. Playwright ensures reliable, fast cross-browser testing with modern automation capabilities. This discipline reduces the gap between specification and implementation while maintaining test maintainability.

## Technical Standards

### Platform Requirements

- **Framework**: Angular (latest stable version, currently v18+)
- **Language**: TypeScript with strict mode and full type coverage
- **Data Format**: JSON (chunked/indexed for performance)
- **Audio**: HTML5 Audio API for sound notifications (no external audio libraries required)
- **Platform**: Web application only (browser-based, no native mobile apps in V1)
- **Browser Support**: Modern evergreen browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
- **Responsive Web Design**: 
  - Desktop: 1024px+ (4-column grid)
  - Tablet: 768px-1023px (2-3 column grid)
  - Mobile: 320px-767px (1-2 column, scrollable or swipeable)
- **Viewport**: Supporting 320px-2560px widths with responsive breakpoints
- **Build Tool**: Angular CLI with production optimization enabled
- **Deployment**: GitHub Pages or modern static hosting (Netlify, Vercel, Cloudflare Pages)
- **Base Path**: Must support subdirectory deployment for GitHub Pages compatibility (`/<repo-name>/`)

### Data Standards

- **Encoding**: UTF-8 mandatory for multilingual content support (Vietnamese diacritics, tone marks, special characters)
- **Structure**: Consistent schema across all JSON content objects with required fields:
  - `id` (unique identifier)
  - `content` (text body)
  - `author` (attribution - required for Buddhist quotes and life lessons)
  - `type` (BuddhistQuote | LifeLesson | optional: Proverb | CaDao | WisdomSaying)
  - `category` (thematic grouping)
  - `tags` (array of keywords)
  - `language` (vi | en | vi-en for bilingual)
- **Validation**: JSON schema validation during build process
- **Size Management**: Individual JSON chunks MUST not exceed 1MB for optimal loading
- **Indexing**: Pre-built search indices for author, category, tags, and content type
- **Local Caching**: localStorage MUST be used to cache:
  - Random content for offline/repeat access
  - User preferences (sound toggle, timer intervals)
  - Last-viewed quote to prevent immediate repeats
- **Cache Strategy**: Implement cache expiration and refresh logic to balance freshness and performance
- **Vietnamese Text**: Proper Unicode normalization (NFC) for consistent diacritic rendering across browsers and platforms

### Code Quality

- **Linting**: ESLint with Angular recommended rules
- **Formatting**: Prettier with 2-space indentation, single quotes, trailing commas
- **Terminology Standards**: Use consistent naming across codebase:
  - **Content items**: Refer generically as "content" or "items" in shared components
  - **Type-specific**: Use `BuddhistQuote`, `LifeLesson` (PascalCase) in TypeScript types/interfaces
  - **Timers**: Use `autoRotationTimer`, `autoDismissTimer` for clarity
  - **Audio**: Use `soundNotification`, `notificationSound` (avoid ambiguous "alert" or "beep")
  - **Vietnamese terms**: Use `ca-dao` (kebab-case) in URLs/routes if included, `CaDao` (PascalCase) in code
- **Testing**: Optional but encouraged - when implemented, follow BDD principles (see Principle VI)
  - **Unit Tests**: Jasmine + Karma for component and service unit tests
  - **E2E Tests**: Cucumber/Gherkin (`.feature` files) + Playwright for cross-browser behavior validation
  - **Test Structure**: `tests/features/` for Gherkin feature files, `tests/steps/` for step definitions
  - **BDD Workflow**: Write feature files first → implement step definitions → run with Playwright
  - **Critical Test Scenarios**: Auto-rotation timing, audio playback, auto-dismiss, timer pause/resume, preference persistence
- **Documentation**: README with setup instructions, architecture overview, audio file attribution/licensing

### V1 Scope & Feature Set

V1 is explicitly scoped as a **core experience validation phase** focused on Buddhist practitioners:

**Core Features** (MUST implement in V1):
- **Continuous Quote Display** (Top 1/3 screen): Auto-rotating quote with fade transitions, Play/Pause and Next controls
- **Quote Grid** (Bottom 2/3 screen): 12 quotes displayed in 4-column grid (responsive to 1-2 columns on mobile) with full text
- **Search**: Full-text search across content, author, category (updates grid results)
- **Auto-Rotation**: Configurable interval via dropdown (5-60s in 5s steps, default 15s)
- **Sound Notification**: Always-on audio notification on every quote transition (no toggle)
- **Random Selection**: Random quote picking from loaded dataset (prevents immediate repeats)
- **Responsive Design**: Web-only, responsive grid layout (4/3/2/1 columns based on viewport)
- **Mobile Interaction**: Vertical scroll or carousel/swipeable cards for quote grid

**User Preferences** (localStorage):
- Auto-rotation interval selection (5-60s, default: 15s)
- Last-viewed quotes cache (prevent immediate repeats in random selection)
- Auto-rotation play/pause state (optional: remember between sessions)

**Design Validation Goals**:
- Test Buddhist-inspired aesthetic with target audience
- Validate auto-rotation engagement (does it enhance or distract?)
- Validate audio notification acceptance (calming or annoying?)
- Measure cross-platform usability (mobile vs desktop experience)
- Gather feedback on contemplative UX patterns

**Explicitly OUT of V1 Scope**:
- User accounts / authentication
- User-submitted content (deferred to V2+)
- Social sharing features
- Advanced analytics
- Multilingual UI (content may be multilingual, but UI is single language)
- Offline PWA capabilities (nice-to-have for V2+)

**Rationale**: V1 focuses on core value proposition: providing Buddhist practitioners with a contemplative, engaging experience for daily wisdom consumption. Auto-rotation and audio features differentiate from static quote websites. Pure static architecture enables fast iteration and validation before investing in backend infrastructure.

## Future Enhancements (V2+)

The following features are explicitly deferred from V1 to validate core value proposition first:

### User-Generated Content & Community Features

- User submission forms for quotes and life lessons
- Content moderation workflow (pending → approved/rejected)
- User accounts and authentication (optional pseudonymous or anonymous submissions)
- Community contribution badges/indicators
- Social sharing (share quotes to social media)
- Favorites/bookmarks (save quotes for later)
- Personal collections (organize saved quotes)

### Advanced Features

- Progressive Web App (PWA) with offline capabilities
- Push notifications for daily quotes
- Advanced search (fuzzy search, filters, sorting)
- Multilingual UI (internationalization/localization)
- Analytics dashboard (popular quotes, user engagement metrics)
- API access for third-party integrations
- Mobile native apps (iOS, Android) if web platform proves successful

**Architecture Note**: User-generated content will require backend infrastructure (Firebase, Supabase, or custom Node.js API) with database and authentication. This decision is deferred until V1 validates core platform value.

## Development Workflow

### Feature Development

1. All features MUST start with specification in `/specs/[feature]/spec.md` using Speckit workflow
2. Implementation plans MUST be documented in `/specs/[feature]/plan.md`
3. Tasks MUST be tracked in `/specs/[feature]/tasks.md` with clear checkpoints
4. Code reviews MUST verify compliance with this constitution

### Quality Gates

- **Build**: Zero TypeScript errors, zero ESLint errors
- **Performance**: Bundle size MUST stay under 2MB initial load (excluding lazy-loaded chunks), <3s load on 4G mobile
- **Accessibility**: WCAG 2.1 AA compliance for core browsing and search features, touch-friendly (44x44px minimum targets)
- **Mobile UX**: Readable text without zoom (16px minimum), no horizontal scroll, thumb-reachable navigation
- **Data Integrity**: JSON schema validation passing for all data files
- **Testing (if implemented)**: All Cucumber/Gherkin scenarios passing in Playwright across target browsers

### Version Control

- **Branch Strategy**: Feature branches from main (`feature/###-name`)
- **Commit Messages**: Conventional Commits format (feat:, fix:, docs:, etc.)
- **Pull Requests**: MUST include description, testing notes, and constitution compliance statement

## Governance

This constitution supersedes all conflicting practices or documentation. All architectural decisions, feature specifications, and code changes MUST align with these principles. Any deviation MUST be explicitly documented and justified in complexity tracking sections of implementation plans.

### Amendment Process

1. Proposed amendments MUST be documented with rationale and impact analysis
2. Amendments affecting core principles require version bump (semantic versioning)
3. Constitution changes MUST be synchronized with all Speckit templates
4. All amendments MUST update the Sync Impact Report comment at the top of this file

### Versioning Policy

- **MAJOR**: Breaking changes to core principles, governance model, or technical stack
- **MINOR**: New principle additions, significant clarifications, or expanded standards
- **PATCH**: Typo fixes, wording improvements, or non-semantic refinements

### Compliance Review

- Constitution compliance MUST be verified during feature planning (Constitution Check in plan.md)
- Violations MUST be justified in Complexity Tracking sections
- Recurring violations trigger constitution review and potential amendment

**Version**: 2.1.0 | **Ratified**: 2025-11-19 | **Last Amended**: 2025-11-19
