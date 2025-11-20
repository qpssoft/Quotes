<!--
SYNC IMPACT REPORT
==================
Version Change: 2.1.0 → 3.0.0
Constitution Type: MAJOR amendment (multi-platform architecture expansion)
Modified Principles:
  - Principle I: Static JSON Data Architecture → EXPANDED: Shared data layer across web (Angular) and native (React Native)
  - Principle II: Angular Modern Web Standards → RENAMED: "Web Platform with Angular" (Angular remains for web, React Native for native)
  - Principle III: Buddhist-Inspired Content-First UX → EXPANDED: Cross-platform design system (web, mobile, desktop, wearables)
  - Principle IV: Performance at Scale → EXPANDED: Platform-specific performance targets (web vs native vs wearables)
  - NEW Principle VII: Multi-Platform Architecture (React Native for iOS, Android, Windows, macOS, Android Wear, Apple Watch)
  - NEW Principle VIII: Code Sharing Strategy (Business logic shared, platform-specific UI implementations)
Added Sections:
  - Multi-Platform Architecture (NEW - Principle VII)
  - Code Sharing Strategy (NEW - Principle VIII)
  - Platform-Specific Requirements (NEW subsection in Technical Standards)
  - React Native Standards (NEW in Technical Standards)
  - Offline-First Architecture (NEW in Technical Standards)
  - Wearables Support (NEW in Technical Standards)
Removed Sections:
  - None (this is additive expansion)

Templates Status:
  ✅ constitution.md: Added multi-platform principles and React Native architecture
  ⚠ plan-template.md: Add React Native project structure options and mobile-specific technical context
  ⚠ spec-template.md: Add native mobile and wearable user story examples
  ⚠ tasks-template.md: Add React Native task examples (iOS/Android setup, native modules, platform-specific UI)

ARCHITECTURAL DECISION - MULTI-PLATFORM EXPANSION:
  ✅ Keep Angular web app (quotes-platform/) for web platform
  ✅ Create NEW React Native app for native platforms:
    - Mobile: iOS & Android (React Native core)
    - Desktop: Windows & macOS (React Native Windows, React Native macOS)
    - Wearables: Android Wear & Apple Watch (React Native extensions)
    - Web: Responsive design with offline PWA support (kept in Angular)
  ✅ Shared business logic via TypeScript modules/packages
  ✅ Shared data layer: Static JSON with platform-specific caching strategies
  ✅ Platform-specific UI: Angular for web, React Native for native experiences
  ✅ Monorepo structure: quotes-platform/ (Angular) + quotes-native/ (React Native)

Strategic Rationale:
  - Angular web app validates core UX and Buddhist content approach (completed V1)
  - React Native enables real device support across all major platforms with single codebase
  - Offline-first architecture critical for contemplative use (meditation sessions, travel)
  - Wearables expand daily touchpoints (watch complications, quick quotes, meditation timers)
  - Shared business logic reduces maintenance while allowing platform-optimized UIs
  - Code reuse: Data models, search logic, rotation algorithms, audio management
  - Platform-specific: Touch/gesture handling, offline storage, native notifications, watch complications

Platform Strategy:
  - Web (Angular): Desktop browsers, progressive web app, responsive design
  - Mobile (React Native): Native iOS/Android apps with full offline support
  - Desktop (React Native): Native Windows/macOS apps with system integration
  - Wearables (React Native): Android Wear/Apple Watch complications and standalone apps

Follow-up TODOs:
  ✅ Update plan-template.md with React Native project structure and mobile technical context
  ✅ Update spec-template.md with native mobile and wearable user story examples
  ✅ Update tasks-template.md with React Native task phases and mobile-specific examples
  - Create quotes-native/ project structure (React Native with Expo or bare workflow)
  - Extract shared business logic into shared TypeScript packages
  - Define platform-specific UI/UX patterns for iOS, Android, Windows, macOS, wearables
  - Document offline-first data synchronization strategy
  - Document wearables-specific features (complications, glances, quick actions)

Rationale: MAJOR version bump (3.0.0) - Fundamental architectural expansion from single-platform
web app (Angular) to multi-platform ecosystem (Angular web + React Native native). This enables:
1. Real device support (mobile, desktop, wearables) with native platform features
2. Offline-first architecture for contemplative use without internet dependency
3. Broader user reach across all platforms where users engage with wisdom content
4. Code reuse through shared TypeScript business logic while maintaining platform-optimized UIs
5. Strategic positioning: Angular proven on web, React Native enables native expansion with minimal duplication
This aligns with the vision of making Buddhist wisdom accessible everywhere users are, on any device.
-->

# Quotes Platform Constitution

## Core Principles

### I. Shared Static JSON Data Architecture

The platform MUST use static JSON data files as the single source of truth for all curated content across ALL platforms (web, mobile, desktop, wearables). All content operations (search, filter, display, random selection) MUST operate on this static data without backend server dependencies.

**Data Loading Strategy**: 
- **Web (Angular)**: Load complete dataset from static JSON file(s) on application initialization. All quotes available in memory for instant search, random selection, and display.
- **Mobile/Desktop (React Native)**: Bundle essential quotes with app, support incremental updates via app updates or dynamic downloads. Use platform-specific offline storage (AsyncStorage, MMKV, or SQLite).
- **Wearables**: Bundle curated subset of quotes (daily/weekly rotation) with watch app. Sync with phone app when paired.

**Content Domain & Taxonomy**: The dataset focuses on Buddhist wisdom content:
- **Buddhist Quotes**: Traditional Buddhist teachings and wisdom with attributed authors
- **Life Lessons**: Inspirational teachings and practical wisdom from Buddhist philosophy
- Additional content types (Vietnamese proverbs, ca dao, general wisdom) MAY be included if relevant to Buddhist philosophy

Each content item MUST include complete metadata (content text, author/source, category, tags, language indicator [vi/en]). The JSON schema MUST support all content types with consistent structure while allowing type-specific fields. Unicode UTF-8 encoding is MANDATORY for multilingual text preservation (Vietnamese diacritics, tone marks, special characters).

**Multi-Platform Architecture**: Pure static JSON model (no backend) across all platforms. This enables:
- Zero hosting/server costs
- Offline-first capabilities on all devices
- Predictable performance at scale
- Simple maintenance and updates
- Fast iteration and experimentation
- App store distribution without server dependencies

**Platform-Specific Caching**:
- **Web**: localStorage + IndexedDB for caching
- **Mobile/Desktop**: AsyncStorage, MMKV, or SQLite with encryption support
- **Wearables**: WatchOS/WearOS local storage with paired device sync

**Future Enhancement (V2+)**: User-generated content MAY be added in future versions with hybrid architecture (static curated + dynamic user submissions via cloud sync). This is deferred until core platform value is validated across all platforms.

**Rationale**: Static architecture ensures simplicity across all platforms, eliminates backend complexity, enables true offline-first capabilities on real devices, and provides predictable performance at scale for read-heavy content consumption. Shared data model enables code reuse while allowing platform-specific optimizations for storage and caching.

### II. Web Platform with Angular

Web platform development MUST use Angular (latest stable version at project start). The codebase MUST follow Angular's official style guide, use standalone components where appropriate, leverage Angular signals for reactive state, and implement lazy-loading for routes and data chunks. TypeScript MUST be used with strict mode enabled.

**Web-Specific Features**:
- Progressive Web App (PWA) with offline support via service workers
- Responsive design for desktop, tablet, and mobile browsers
- GitHub Pages or static hosting deployment
- Browser-based local storage (localStorage, IndexedDB)

**Rationale**: Angular provides a robust, enterprise-ready framework with strong typing, built-in tooling, and proven patterns for large-scale content platforms. Angular is MAINTAINED for web platform while React Native handles native platform experiences. This allows each platform to use the best tool for its ecosystem.

### III. Buddhist-Inspired Content-First UX Across All Platforms

The platform MUST prioritize content discovery and contemplative engagement with Buddhist aesthetic principles, optimized for cross-platform use (web browsers, mobile devices, desktop applications, wearables). The design MUST serve Buddhist practitioners with a lifestyle-oriented approach reflecting Buddhist philosophy and aphorisms.

**Cross-Platform Design System**:
- Consistent visual language across web (Angular), mobile/desktop (React Native), and wearables
- Platform-specific adaptations: web responsive, native touch gestures, watch complications
- Shared design tokens: colors, typography, spacing, animation timing
- Buddhist aesthetic: calming colors, ample whitespace, serene typography, mindful interactions

**Visual Design** (Platform-Adapted):
- **Web & Desktop**: Two-section layout (1/3 continuous display, 2/3 grid)
- **Mobile**: Single column with swipeable continuous display + scrollable grid
- **Wearables**: Watch face complications, glances, standalone quote display
- Cards MUST display full quote text content with author attribution
- MUST use calming, mindful design elements (soft colors, ample whitespace, serene typography)
- Typography MUST be optimized for contemplative reading:
  - Web/Desktop: 16px minimum
  - Mobile: 16-18px minimum
  - Wearables: Platform-optimized text scaling

**Core Interactions** (Platform-Adapted):
- Full-text search across quote content, author, and category (case-insensitive)
- Category filtering for thematic browsing
- Random quote selection for continuous display
- **Web**: Responsive grid (4/3/2/1 columns), mouse + keyboard navigation
- **Mobile/Tablet**: Touch gestures (swipe, tap, long-press), native navigation patterns
- **Desktop**: Native menus, keyboard shortcuts, system tray integration
- **Wearables**: Digital crown/bezel navigation, complications, force touch

**Auto-Rotation & Notifications** (Platform-Adapted):
- Continuous display with configurable interval (5-60s in 5s increments, default: 15s)
- Quote transition: fade-out current quote, then immediately fade-in next quote
- Notification sound/haptic feedback on every transition:
  - Web/Desktop: Audio notification (subtle bell/chime)
  - Mobile: Audio + haptic feedback (vibration)
  - Wearables: Haptic feedback only (preserve battery)
- User controls: Play/Pause button and Next button (skip to next quote immediately)
- Timer interval configurable via dropdown (web) or picker (native)
- Random quote selection from loaded dataset (prevent immediate repeats)

**Offline-First Design**:
- ALL platforms MUST function without internet connection after initial setup
- Web: Service workers + IndexedDB caching
- Mobile/Desktop: Bundled quotes + local database
- Wearables: Synced subset from paired device

**Platform-Specific Optimizations**:
- **Web**: Keyboard shortcuts, right-click context menu, browser extensions
- **Mobile**: System share sheet, widgets, background audio, push notifications
- **Desktop**: Menu bar app, system notifications, global keyboard shortcuts, startup launch
- **Wearables**: Complications (time-based quote display), glances, standalone app mode

**Vietnamese Text**: Proper Unicode normalization (NFC) for consistent diacritic rendering across all platforms and devices.

**Rationale**: Buddhist content requires presentation that honors its contemplative nature across all touchpoints in a practitioner's daily life. Multi-platform support enables engagement during meditation sessions (desktop), commutes (mobile), work breaks (web), and quick mindfulness moments (wearables). Platform-specific optimizations ensure native, intuitive experiences while maintaining consistent Buddhist aesthetic and philosophy.

### VII. Multi-Platform Architecture with React Native

Native platform development (iOS, Android, Windows, macOS, wearables) MUST use React Native to maximize code reuse while delivering platform-native experiences. The React Native codebase MUST follow React best practices, use functional components with hooks, leverage TypeScript for type safety, and implement platform-specific code paths where necessary.

**Platform Coverage**:
- **Mobile**: iOS and Android (React Native core)
- **Desktop**: Windows (React Native Windows), macOS (React Native macOS)
- **Wearables**: Android Wear (React Native extensions), Apple Watch (WatchKit bridge)
- **Web**: Maintained separately in Angular (not React Native Web) for optimal web experience

**Project Structure (Monorepo)**:
```
Quotes/
├── quotes-platform/          # Angular web app (existing)
├── quotes-native/            # NEW React Native app
│   ├── src/
│   │   ├── shared/          # Shared business logic (TypeScript)
│   │   ├── components/      # Shared React Native components
│   │   ├── ios/            # iOS-specific code
│   │   ├── android/        # Android-specific code
│   │   ├── windows/        # Windows-specific code
│   │   ├── macos/          # macOS-specific code
│   │   └── wearables/      # Watch-specific code
│   ├── ios/                # Native iOS project
│   ├── android/            # Native Android project
│   ├── windows/            # Native Windows project
│   └── macos/              # Native macOS project
└── shared-modules/         # Shared TypeScript business logic
    ├── models/             # Data models
    ├── services/           # Business logic (search, rotation)
    └── utils/              # Utility functions
```

**Platform-Specific Implementation Strategy**:
- **Core Features**: Shared across all platforms (search, rotation, filtering, audio)
- **UI Components**: Platform-adapted with conditional rendering (`Platform.OS`)
- **Navigation**: React Navigation with platform-specific configurations
- **Storage**: Platform-appropriate solutions (AsyncStorage, MMKV, SQLite)
- **Notifications**: Platform-native push notifications and local notifications
- **Background Tasks**: Platform-specific background execution (iOS Background Modes, Android Services)

**Wearables Support**:
- **Apple Watch**: 
  - WatchKit extension via React Native bridge
  - Complications: Modular, Graphic, Circular
  - Standalone watch app mode (run without iPhone)
  - Digital Crown navigation support
- **Android Wear**:
  - Wear OS Compose UI via React Native modules
  - Tiles: Quote of the day, timer controls
  - Complications: Short text, long text, ranged value
  - Rotary input support

**Development Approach**:
- Use Expo managed workflow for rapid development (can eject if needed for native modules)
- TypeScript throughout for type safety and shared models
- Platform-specific extensions only when necessary (prefer cross-platform solutions)
- Shared design system via React Native components
- Automated testing with Jest and React Native Testing Library

**Rationale**: React Native enables true native experiences across iOS, Android, Windows, macOS, and wearables with maximum code reuse (70-90%). Single team can maintain native apps across all major platforms. TypeScript enables sharing business logic with Angular web app. React Native's mature ecosystem and community support reduce development risk. Platform-specific optimizations ensure each platform feels native while shared code reduces maintenance burden.

### VIII. Code Sharing Strategy

Business logic, data models, and algorithms MUST be shared across web (Angular) and native (React Native) platforms via TypeScript modules. UI implementations MUST remain platform-specific to ensure optimal native experiences.

**Shared Code (TypeScript Modules)**:
- **Data Models**: Quote, Category, SearchResult, UserPreferences interfaces
- **Business Logic**: 
  - Search algorithms (full-text, fuzzy, category filtering)
  - Rotation logic (random selection, prevent repeats, timer management)
  - Content loading and parsing
  - Audio/haptic timing and coordination
- **Utilities**: Date formatting, text processing, Vietnamese text normalization
- **Constants**: Design tokens (colors, spacing, typography), configuration values

**Platform-Specific Code**:
- **UI Components**: 
  - Angular components for web (HTML, SCSS, Angular templates)
  - React Native components for native (JSX, StyleSheet, platform-specific styling)
- **Navigation**: Angular Router vs React Navigation
- **Storage**: 
  - Web: localStorage, IndexedDB, service workers
  - Native: AsyncStorage, MMKV, SQLite, platform keychain
- **Platform APIs**:
  - Web: Web Audio API, Service Workers, Push API
  - Native: Native audio modules, background tasks, push notifications, haptics

**Sharing Mechanism**:
- **Monorepo**: Lerna, Nx, or Yarn Workspaces for shared packages
- **NPM Packages**: Publish shared modules as internal npm packages
- **Git Submodules**: Shared code in separate repository (if team prefers)

**Shared Package Structure**:
```typescript
// @quotes/shared-models
export interface Quote {
  id: string;
  content: string;
  author: string;
  category: string;
  type: 'Quote' | 'Proverb' | 'CaDao' | 'WisdomSaying';
  tags: string[];
  language: 'vi' | 'en' | 'vi-en';
}

// @quotes/shared-services
export class SearchService {
  static search(quotes: Quote[], query: string): Quote[] {
    // Platform-agnostic search logic
  }
}

export class RotationService {
  static getRandomQuote(quotes: Quote[], excludeIds: string[]): Quote {
    // Platform-agnostic random selection
  }
}
```

**Platform Usage**:
```typescript
// Angular (Web)
import { Quote, SearchService } from '@quotes/shared-services';
// Use with Angular dependency injection

// React Native (Mobile/Desktop)
import { Quote, SearchService } from '@quotes/shared-services';
// Use with React hooks
```

**Testing Shared Code**:
- Shared modules MUST have their own test suites (Jest)
- Tests run independently of platform implementations
- Both Angular and React Native projects import and use shared modules
- Integration tests verify shared code works on each platform

**Rationale**: Code sharing maximizes development efficiency and ensures consistent behavior across all platforms. Business logic tested once works everywhere. Platform-specific UI implementations ensure each platform follows its native design patterns and user expectations. This strategy balances code reuse (70-80% of business logic) with platform optimization (native UI components and APIs).

### Audio Standards

- **Format**: 
  - Web: MP3 or OGG for browser compatibility (provide both formats for best cross-browser support)
  - Mobile/Desktop: Native audio formats (AAC for iOS, MP3 for Android/Windows)
  - Wearables: Haptic feedback preferred (battery conservation), audio optional
- **Sound Notification Requirements**:
  - MUST be subtle and calming (aligns with Buddhist aesthetic)
  - SHOULD be short duration (< 2 seconds)
  - MUST be non-intrusive (low volume by default, user-adjustable)
  - Examples: Soft bell tone, singing bowl, gentle chime, nature sounds (water droplet, wind chime)
- **Platform-Specific Implementation**:
  - **Web**: HTML5 `<audio>` element or Web Audio API, preload audio file for instant playback
  - **Mobile**: React Native Sound or Expo Audio API with background audio support
  - **Desktop**: Native audio APIs via React Native modules
  - **Wearables**: Haptic Engine API (iOS), Vibrator API (Android Wear)
- **User Controls** (Platform-Adapted):
  - Sound/haptic always ON by default (notification cue for quote transitions)
  - User CAN toggle sound on/off in settings (mobile/desktop system permissions)
  - Volume control via system volume (respects user's device settings)
  - Haptic intensity configurable on supported devices
- **Offline Support**:
  - Audio files MUST be bundled with app (no network dependency)
  - Web: Service worker caching of audio assets
- **File Size**: Audio file SHOULD be < 100KB for fast loading and minimal app size impact
- **Licensing**: Audio files MUST be properly licensed (Creative Commons, royalty-free, or original)

**Rationale**: Audio and haptic feedback create a meditative rhythm that enhances contemplative practice. Platform-specific implementations ensure optimal battery life (especially on wearables) while maintaining consistent Buddhist aesthetic across all devices.



**Rationale**: Buddhist content requires presentation that honors its contemplative nature while engaging practitioners through mindful interactions. Auto-rotation and audio cues create a meditative rhythm without requiring user attention, supporting passive contemplation. Mobile-first design ensures accessibility across all devices where practitioners engage with wisdom content. Auto-dismiss prevents screen burn-in and maintains visual freshness.

**Rationale**: Buddhist content requires presentation that honors its contemplative nature while engaging practitioners through mindful interactions. Auto-rotation and audio cues create a meditative rhythm without requiring user attention, supporting passive contemplation. Mobile-first design ensures accessibility across all devices where practitioners engage with wisdom content. Auto-dismiss prevents screen burn-in and maintains visual freshness.

### IV. Performance at Scale Across All Platforms

The platform MUST handle large content datasets (target: support up to 500K items for future growth) with sub-second search response times on ALL platforms (web, mobile, desktop, wearables). Performance targets MUST be platform-appropriate while maintaining consistent user experience.

**Platform-Specific Performance Targets**:
- **Web**: Initial page load < 3 seconds on 4G mobile, bundle size < 2MB initial payload
- **Mobile**: App launch < 2 seconds, smooth 60fps animations, memory-efficient for background operation
- **Desktop**: Instant launch (< 1 second), efficient CPU/memory usage, background operation support
- **Wearables**: Complication update < 500ms, minimal battery impact (< 1% per hour active use)

**Search & Filter Performance**:
- Sub-second search response on all platforms
- Web: Web Workers for non-blocking UI
- Mobile/Desktop: Background threads for heavy operations
- Wearables: Pre-indexed search on paired device, sync results to watch

**Data Loading & Caching**:
- **Web**: Chunked loading with service workers, IndexedDB for offline caching
- **Mobile/Desktop**: Bundle essential quotes (~5-10K), incremental updates via app updates
- **Wearables**: Sync curated subset (~100-500 quotes) from paired device
- All platforms: Efficient JSON parsing, lazy evaluation, virtual scrolling for long lists

**Auto-Rotation Performance**:
- Timer-based operations MUST NOT block UI rendering
- Quote transitions MUST be smooth (60fps animations on all platforms)
- Audio/haptic playback MUST be asynchronous and non-blocking
- Memory leaks MUST be prevented in long-running timer operations
- Background operation support (mobile continues rotation when app backgrounded)

**Platform-Specific Optimizations**:
- **Web**: Code splitting, tree-shaking, lazy loading, virtual DOM optimizations
- **Mobile**: 
  - Native list rendering (FlatList, SectionList)
  - Image/font optimization for device pixel ratios
  - Battery-efficient background tasks
  - Reduced motion support for accessibility
- **Desktop**: 
  - Native performance (compiled code where possible)
  - Efficient memory management for long-running sessions
  - GPU acceleration for animations
- **Wearables**:
  - Minimal complications (text-only preferred)
  - Optimized watch face integration
  - Battery-aware features (reduce updates when battery low)

**Bundle Size Management**:
- **Web**: < 2MB initial, code splitting for routes
- **Mobile**: < 50MB app size (App Store guidelines), < 100MB with quotes bundle
- **Desktop**: < 100MB installed size
- **Wearables**: < 10MB watch app extension

**Rationale**: Large datasets and multi-platform distribution require careful performance optimization. Each platform has unique constraints (battery life on wearables, bandwidth on mobile, memory on web) that must be respected while maintaining a consistent, responsive user experience. Performance at scale enables the platform to grow from initial quote set to comprehensive wisdom library without degrading experience.

### V. Simplicity and Maintainability

Features MUST be implemented with minimal complexity across all platforms. Avoid premature optimization, over-engineering, or speculative features. Code MUST be self-documenting with clear naming conventions. Dependencies MUST be justified and kept minimal. The codebase MUST remain approachable for contributors familiar with Angular (web) or React Native (mobile/desktop/wearables) basics.

**Simplicity Focus Across Platforms**: 
- Pure static architecture (no backend, no database, no authentication) across ALL platforms
- Client-side timers and state management only (no WebSockets, no real-time sync)
- Platform-native audio/haptic APIs (avoid heavy third-party libraries)
- Local storage for user preferences (platform-appropriate: localStorage, AsyncStorage, UserDefaults)
- Focused feature set: browse, search, random, auto-rotation, offline support

**Code Sharing Strategy**:
- Share business logic: data models, search algorithms, rotation logic, filtering
- Share design tokens: colors, spacing, typography values
- Platform-specific UI: Angular components (web), React Native components (native)
- Shared TypeScript modules via monorepo or npm packages

**Dependency Management**:
- **Web**: Minimal Angular dependencies, avoid heavy UI libraries
- **Mobile/Desktop**: Minimal React Native dependencies, prefer built-in components
- **Wearables**: Minimal watch extensions, leverage OS complications framework
- All platforms: Justify each dependency, prefer native APIs over third-party when possible

**Rationale**: Simplicity reduces maintenance burden across multiple platforms, lowers barriers to contribution, and ensures long-term sustainability. Multi-platform support increases complexity inherently - this principle ensures we don't compound it with unnecessary dependencies or over-engineering. Choose boring, proven technology over novel solutions. Code sharing maximizes reuse while platform-specific UIs ensure optimal native experiences.

### VI. Behavior-Driven Development (BDD) Testing

When tests are implemented, they MUST follow Behavior-Driven Development principles using Gherkin syntax for feature specifications. Testing approaches differ by platform but share the same BDD philosophy.

**Web Platform (Angular)**:
- E2E tests using Cucumber/Gherkin (.feature files) with Playwright execution
- Unit tests with Jasmine + Karma for components and services
- Cross-browser validation on Chromium, Firefox, and WebKit

**Native Platforms (React Native)**:
- E2E tests using Detox or Maestro with Gherkin-style test descriptions
- Unit tests with Jest and React Native Testing Library
- Component tests with React Native Testing Library
- Platform-specific tests for iOS and Android

**Shared Business Logic**:
- Unit tests with Jest for shared TypeScript modules
- Tests run independently of platform implementations
- Ensure consistent behavior across web and native platforms

**Feature Specifications**:
- All feature specs in `/specs/[feature]/spec.md` MUST use Gherkin-compatible acceptance criteria (Given-When-Then)
- Acceptance criteria translate directly to automated test scenarios
- Platform-specific test implementations use same scenarios with platform-appropriate tools

**Example BDD Scenarios (Platform-Agnostic)**:
```gherkin
Feature: Quote Auto-Rotation
  Scenario: User starts auto-rotation with default timer
    Given I am on the quotes display screen
    When I tap the Play button
    Then I should see a new random quote every 15 seconds
    And I should hear a notification sound on each transition
```

**Rationale**: BDD aligns tests with user requirements through human-readable specifications, enabling collaboration between technical and non-technical stakeholders. Gherkin provides living documentation that stays synchronized with test execution across all platforms. Platform-specific test tools (Playwright for web, Detox for mobile) ensure reliable, fast testing with modern automation capabilities while maintaining consistent BDD approach.

## Technical Standards

### Web Platform Requirements

- **Framework**: Angular (latest stable version, currently v18+)
- **Language**: TypeScript with strict mode and full type coverage
- **Data Format**: JSON (chunked/indexed for performance)
- **Audio**: HTML5 Audio API for sound notifications
- **Platform**: Progressive Web App (PWA) with service workers
- **Browser Support**: Modern evergreen browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
- **Responsive Web Design**: 
  - Desktop: 1024px+ (4-column grid)
  - Tablet: 768px-1023px (2-3 column grid)
  - Mobile: 320px-767px (1-2 column, scrollable or swipeable)
- **Viewport**: Supporting 320px-2560px widths with responsive breakpoints
- **Build Tool**: Angular CLI with production optimization enabled
- **Deployment**: GitHub Pages or modern static hosting (Netlify, Vercel, Cloudflare Pages)
- **Base Path**: Must support subdirectory deployment for GitHub Pages compatibility (`/<repo-name>/`)

### Native Platform Requirements (React Native)

- **Framework**: React Native (latest stable version)
- **Language**: TypeScript with strict mode throughout
- **Development**: Expo managed workflow (with eject capability for native modules)
- **State Management**: React Context + Hooks, Redux Toolkit (if needed for complex state)
- **Navigation**: React Navigation 6+ with platform-specific configurations
- **Storage**: 
  - AsyncStorage for simple key-value pairs
  - MMKV for high-performance storage
  - SQLite for structured data (optional, for large datasets)
- **Audio**: React Native Sound or Expo Audio API
- **Haptics**: React Native Haptic Feedback or Expo Haptics
- **Platform Support**:
  - **iOS**: iOS 13+ (React Native core)
  - **Android**: Android 6.0+ (API level 23+) (React Native core)
  - **Windows**: Windows 10+ (React Native Windows)
  - **macOS**: macOS 10.14+ (React Native macOS)
  - **Apple Watch**: watchOS 6+ (WatchKit extension)
  - **Android Wear**: Wear OS 2+ (Compose for Wear OS)
- **Build Tools**: 
  - iOS: Xcode, CocoaPods
  - Android: Android Studio, Gradle
  - Windows: Visual Studio, NuGet
  - macOS: Xcode, CocoaPods
- **Distribution**:
  - iOS: App Store
  - Android: Google Play Store
  - Windows: Microsoft Store
  - macOS: Mac App Store
  - Wearables: Bundled with mobile apps

### Shared Code Requirements

- **Language**: TypeScript with strict mode
- **Module System**: ES Modules (import/export)
- **Package Manager**: npm or yarn with workspaces
- **Monorepo Tool**: Lerna, Nx, or Yarn Workspaces (team choice)
- **Testing**: Jest for unit tests of shared modules
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier with consistent configuration across all platforms

### Data Standards (Cross-Platform)

- **Encoding**: UTF-8 mandatory for multilingual content support (Vietnamese diacritics, tone marks, special characters)
- **Structure**: Consistent schema across all JSON content objects with required fields:
  - `id` (unique identifier)
  - `content` (text body)
  - `author` (attribution - required for Buddhist quotes and life lessons)
  - `type` (BuddhistQuote | LifeLesson | optional: Proverb | CaDao | WisdomSaying)
  - `category` (thematic grouping)
  - `tags` (array of keywords)
  - `language` (vi | en | vi-en for bilingual)
- **Validation**: JSON schema validation during build process (all platforms)
- **Size Management**: 
  - Web: Individual JSON chunks MUST not exceed 1MB for optimal loading
  - Native: Bundle ~5-10K quotes with app, support incremental updates
  - Wearables: Curated subset ~100-500 quotes synced from paired device
- **Indexing**: Pre-built search indices for author, category, tags, and content type
- **Platform-Specific Caching**: 
  - **Web**: localStorage + IndexedDB for caching
  - **Native Mobile/Desktop**: AsyncStorage, MMKV, or SQLite with encryption support
  - **Wearables**: WatchOS/WearOS local storage with paired device sync
- **Cache Strategy**: Implement cache expiration and refresh logic to balance freshness and performance
- **Offline Support**: All platforms MUST function offline after initial setup/sync
- **Vietnamese Text**: Proper Unicode normalization (NFC) for consistent diacritic rendering across all platforms and devices

### Code Quality (Cross-Platform)

- **Linting**: ESLint with TypeScript rules for all platforms (Angular + React Native + shared modules)
- **Formatting**: Prettier with consistent configuration:
  - 2-space indentation
  - Single quotes
  - Trailing commas
  - Same config across web, native, and shared code
- **Terminology Standards**: Use consistent naming across entire codebase (web + native):
  - **Content items**: Refer generically as "content" or "items" in shared components
  - **Type-specific**: Use `BuddhistQuote`, `LifeLesson` (PascalCase) in TypeScript types/interfaces
  - **Timers**: Use `autoRotationTimer`, `autoDismissTimer` for clarity
  - **Audio**: Use `soundNotification`, `notificationSound` (avoid ambiguous "alert" or "beep")
  - **Haptics**: Use `hapticFeedback`, `vibration` consistently
  - **Vietnamese terms**: Use `ca-dao` (kebab-case) in URLs/routes if included, `CaDao` (PascalCase) in code
- **Testing Standards**: Optional but encouraged - when implemented, follow BDD principles (see Principle VI)
  - **Web Unit Tests**: Jasmine + Karma for Angular components and services
  - **Native Unit Tests**: Jest + React Native Testing Library for components and hooks
  - **Shared Module Tests**: Jest for business logic in shared TypeScript modules
  - **Web E2E Tests**: Cucumber/Gherkin (.feature files) + Playwright for cross-browser behavior validation
  - **Native E2E Tests**: Detox or Maestro with Gherkin-style test descriptions for iOS/Android
  - **Test Structure**: 
    - Web: `tests/features/` for Gherkin, `tests/steps/` for Playwright step definitions
    - Native: `__tests__/` for Jest, `e2e/` for Detox/Maestro
    - Shared: `__tests__/` in each shared module package
  - **BDD Workflow**: Write feature files first → implement step definitions → run with appropriate test tool
  - **Critical Test Scenarios**: Auto-rotation timing, audio/haptic playback, auto-dismiss, timer pause/resume, preference persistence, offline functionality
- **Documentation**: 
  - Platform-specific README files (web: quotes-platform/README.md, native: quotes-native/README.md)
  - Shared modules documentation
  - Architecture overview explaining code sharing strategy
  - Audio file attribution/licensing
  - Platform-specific setup instructions

### Platform Scope & Feature Strategy

**Current Status (V1)**: Web platform (Angular) is complete and validated with users. Multi-platform expansion is the next strategic phase.

**Phase 1 (Complete): Web Platform (Angular)**
- ✅ Continuous Quote Display with auto-rotation
- ✅ Quote Grid with responsive layout
- ✅ Full-text search and filtering
- ✅ Configurable timer intervals
- ✅ Audio notifications
- ✅ LocalStorage persistence
- ✅ Buddhist-inspired UX
- ✅ Mobile-responsive web design
- ✅ GitHub Pages deployment

**Phase 2 (In Progress): Native Platforms (React Native)**

**Core Features** (MUST implement across all native platforms):
- **Continuous Quote Display**: Same auto-rotation logic as web, platform-native UI
- **Quote Grid**: Platform-native list rendering (FlatList, native scrolling)
- **Search**: Full-text search with platform-native keyboard and input handling
- **Auto-Rotation**: Configurable intervals, background operation support (mobile)
- **Notifications**: Audio + haptic feedback (platform-appropriate)
- **Random Selection**: Same algorithm as web, prevent immediate repeats
- **Offline-First**: Bundle quotes with app, function without internet after install
- **User Preferences**: Platform-native storage (AsyncStorage, UserDefaults, SharedPreferences)

**Platform-Specific Features**:
- **Mobile (iOS/Android)**:
  - Home screen widgets (quote of the day)
  - Push notifications (daily quote reminders)
  - Background audio (continue rotation when app backgrounded)
  - System share sheet integration
  - Native gestures (swipe, pinch, long-press)
  - Dark mode support
- **Desktop (Windows/macOS)**:
  - Menu bar app (macOS) / system tray (Windows)
  - Global keyboard shortcuts
  - System notifications
  - Auto-launch on startup (optional)
  - Multiple window support
  - Native menus and right-click context
- **Wearables (Apple Watch/Android Wear)**:
  - Watch face complications (quote display)
  - Standalone app mode (function without phone)
  - Digital crown/bezel navigation
  - Haptic feedback only (preserve battery)
  - Quick actions (next quote, pause/play)
  - Glances/Tiles (quick quote view)

**Implementation Order** (by priority):
1. **Mobile Apps (P1)**: iOS and Android - largest user base, most requested
2. **Desktop Apps (P2)**: Windows and macOS - work/home use cases
3. **Wearables (P3)**: Apple Watch and Android Wear - quick mindfulness moments

**Shared Business Logic** (across all platforms):
- Data models (Quote, Category, Preferences)
- Search algorithms
- Rotation logic (random selection, timer management)
- Content loading and parsing
- Vietnamese text processing
- Audio/haptic timing coordination

**Design Validation Goals** (multi-platform):
- Test Buddhist-inspired aesthetic across all platforms
- Validate auto-rotation engagement on mobile vs desktop vs wearables
- Validate audio + haptic feedback combination (mobile/wearables)
- Measure cross-platform usability and consistency
- Gather feedback on platform-specific optimizations

**Explicitly OUT of Scope** (deferred to future versions):
- User accounts / authentication (all platforms)
- User-submitted content (all platforms)
- Social sharing features (may add platform-specific share sheets)
- Advanced analytics
- Multilingual UI (content may be multilingual, but UI is single language)
- Cloud sync between devices (future enhancement for cross-device quote history)

**Rationale**: Web platform (V1) validated core value proposition with users. React Native expansion enables reaching users on their preferred devices (mobile, desktop, wearables) with maximum code reuse (70-80%) and native experiences. Phased rollout (mobile → desktop → wearables) enables iterative validation and feedback while managing development complexity. Offline-first architecture critical for contemplative use cases (meditation, travel, commutes).

## Future Enhancements (V3+)

The following features are explicitly deferred from Phase 2 (native platform launch) to validate multi-platform core value proposition first:

### User-Generated Content & Community Features

- User submission forms for quotes and life lessons (all platforms)
- Content moderation workflow (pending → approved/rejected)
- User accounts and authentication (cross-platform sync via cloud backend)
- Community contribution badges/indicators
- Social sharing (native share sheets on mobile, share buttons on web)
- Favorites/bookmarks (save quotes for later, sync across devices)
- Personal collections (organize saved quotes, cloud sync)

### Advanced Features

- **Cloud Sync**: Sync user preferences, favorites, and reading history across all devices (web, mobile, desktop, wearables)
- **Advanced Search**: Fuzzy search, advanced filters, saved searches, search history
- **Multilingual UI**: Internationalization/localization of app interface (content already multilingual)
- **Analytics Dashboard**: Popular quotes, user engagement metrics, reading patterns
- **Daily Quote Notifications**: Smart timing based on user habits, customizable schedules
- **Meditation Timer Integration**: Combine quote rotation with meditation timer, bell intervals
- **Voice Reading**: Text-to-speech for audio playback of quotes (accessibility + meditation)
- **Custom Collections**: User-curated quote collections, themed playlists
- **API Access**: RESTful API for third-party integrations
- **Browser Extensions**: Chrome/Firefox extensions for quick quote access
- **Screen Savers**: Desktop screen savers with rotating quotes (Windows/macOS)

### Wearables Advanced Features (V3+)

- **Contextual Quotes**: Location-aware, time-aware, activity-aware quote selection
- **Health Integration**: Apple Health / Google Fit integration for mindfulness tracking
- **Meditation Sessions**: Guided meditation with timed quote intervals
- **Breathing Exercises**: Synchronized with quote display and haptic feedback
- **Complications Customization**: User-selected quote categories for complications

**Architecture Note**: User-generated content and cloud sync will require backend infrastructure (Firebase, Supabase, or custom Node.js API) with database, authentication, and real-time sync. This decision is deferred until Phase 2 (native platforms) validates multi-platform core value and user engagement across all devices.

**Rationale**: Focus Phase 2 on delivering core contemplative experience across all platforms (web, mobile, desktop, wearables) before adding community features. This ensures the foundation is solid and user experience is validated everywhere before investing in backend infrastructure. Cloud sync and UGC are valuable additions but not critical for initial multi-platform launch.

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

**Version**: 3.0.0 | **Ratified**: 2025-11-19 | **Last Amended**: 2025-11-20
