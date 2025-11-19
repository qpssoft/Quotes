# Tasks: Buddhist Quotes Display Platform

**Input**: Design documents from `/specs/001-quote-display/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Tests are OPTIONAL for V1. If implemented, follow Principle VI (BDD Testing) using Cucumber/Gherkin + Playwright.

**Organization**: Tasks organized by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story mapping (US1, US2, US3, US4, SHARED)
- File paths are absolute from repository root

---

## Phase 0: Setup (Project Initialization)

**Purpose**: Initialize Angular project and development environment

**Estimated Time**: 2-3 hours

- [X] T001 [SETUP] Create Angular 18+ project: `ng new quotes-platform --routing --style=scss --standalone`
- [X] T002 [SETUP] Configure TypeScript strict mode in `tsconfig.json` (set all strict flags to true)
- [X] T003 [P] [SETUP] Setup ESLint with Angular rules: `ng add @angular-eslint/schematics`
- [X] T004 [P] [SETUP] Setup Prettier: install `prettier`, create `.prettierrc` (2 spaces, single quotes, trailing commas)
- [X] T005 [P] [SETUP] Create `.editorconfig` for consistent formatting across editors
- [X] T006 [P] [SETUP] Initialize Git (if not done): `git init`, create `.gitignore` for Angular projects
- [X] T007 [P] [SETUP] Create `.npmignore` for npm publishing (exclude tests, docs, src)
- [X] T008 [SETUP] Update `package.json` scripts: add `lint`, `lint:fix`, `format`, `validate:quotes`, `build:gh-pages`
- [X] T009 [SETUP] Configure GitHub Pages base href in `angular.json` production configuration

**Checkpoint**: Project structure initialized, all tooling configured

---

## Phase 1: Foundation (Core Infrastructure)

**Purpose**: Implement shared services and models that BLOCK all user stories

**Estimated Time**: 8-12 hours

**⚠️ CRITICAL**: No user story work can begin until this phase completes

### Core Models & Types

- [ ] T010 [P] [SHARED] Create Quote interface in `src/app/core/models/quote.model.ts`
- [ ] T011 [P] [SHARED] Create QuoteCategory enum in `src/app/core/models/quote.model.ts` (wisdom, compassion, mindfulness, etc.)
- [ ] T012 [P] [SHARED] Create TimerInterval type and TimerConfig interface in `src/app/core/models/timer-config.model.ts`
- [ ] T013 [P] [SHARED] Create DisplayHistory interface in `src/app/core/models/display-history.model.ts`
- [ ] T014 [P] [SHARED] Create UserPreferences interface in `src/app/core/models/user-preferences.model.ts`
- [ ] T015 [P] [SHARED] Create AudioConfig interface in `src/app/core/models/audio-config.model.ts`

### Core Services

- [ ] T016 [SHARED] Create QuoteDataService in `src/app/core/services/quote-data.service.ts` (load JSON, cache, UTF-8 NFC normalization)
- [ ] T017 [SHARED] Create StorageService in `src/app/core/services/storage.service.ts` (localStorage wrapper with try/catch, timer interval persistence)
- [ ] T018 [SHARED] Create AudioNotificationService in `src/app/core/services/audio-notification.service.ts` (HTML5 Audio element, preload, play method)
- [ ] T019 [SHARED] Create QuoteRotationService in `src/app/core/services/quote-rotation.service.ts` (RxJS interval timer, pause/resume, random selection with history)

### Shared Components

- [ ] T020 [P] [SHARED] Create QuoteCardComponent in `src/app/shared/components/quote-card/` (standalone component, displays quote content/author/category)
- [ ] T021 [P] [SHARED] Style QuoteCardComponent with Buddhist-inspired design (`quote-card.component.scss`)

### Static Assets

- [ ] T022 [P] [SHARED] Create sample `quotes.json` in `src/assets/data/` with 20-50 Buddhist quotes for development
- [ ] T023 [P] [SHARED] Find and add audio notification file in `src/assets/audio/notification.mp3` (soft bell/chime, <100KB, CC0 license)
- [ ] T024 [P] [SHARED] Create Buddhist color palette in `src/styles/_variables.scss` (warm browns, golds, cornsilk background)
- [ ] T025 [P] [SHARED] Create typography styles in `src/styles/_typography.scss` (Noto Serif for quotes, 16px min, readable spacing)

### Configuration

- [ ] T026 [SHARED] Setup environment files: update `src/environments/environment.ts` and `environment.prod.ts` with GitHub Pages base path
- [ ] T027 [SHARED] Update `index.html` with proper charset meta tag and Buddhist-themed title/description

**Checkpoint**: Foundation complete - all core services, models, and shared components ready for user story implementation

---

## Phase 2: User Story 1 - Continuous Quote Contemplation (Priority: P1) 🎯 MVP

**Goal**: Display auto-rotating quotes at top of screen with play/pause/next controls and audio notification

**Independent Test**: Load app, verify quote rotates every 15s with audio, pause/resume works, next button skips quote

**Estimated Time**: 12-16 hours

### Implementation for User Story 1

- [ ] T028 [US1] Create QuoteDisplayComponent in `src/app/features/quote-display/quote-display.component.ts` (standalone, uses rotation service)
- [ ] T029 [US1] Implement template for QuoteDisplayComponent in `quote-display.component.html` (1/3 screen height, fade animations, quote card)
- [ ] T030 [US1] Style QuoteDisplayComponent in `quote-display.component.scss` (height: 33vh, Buddhist aesthetic, centered layout)
- [ ] T031 [US1] Create RotationControlsComponent in `src/app/features/controls/rotation-controls.component.ts` (play/pause button, next button)
- [ ] T032 [US1] Implement template for RotationControlsComponent in `rotation-controls.component.html` (button group, accessible labels)
- [ ] T033 [US1] Style RotationControlsComponent in `rotation-controls.component.scss` (44x44px touch targets, Buddhist colors)
- [ ] T034 [US1] Wire QuoteDisplayComponent to QuoteRotationService (subscribe to rotation$, handle play/pause/next)
- [ ] T035 [US1] Wire AudioNotificationService to play sound on quote transitions
- [ ] T036 [US1] Implement fade-out → fade-in CSS animations (no gaps, smooth transitions)
- [ ] T037 [US1] Implement consecutive quote prevention using display history (filter last 5 quotes)
- [ ] T038 [US1] Add QuoteDisplayComponent and RotationControlsComponent to main app component template
- [ ] T039 [US1] Test on multiple browsers (Chrome, Firefox, Safari) for audio autoplay restrictions
- [ ] T040 [US1] Add error handling for JSON load failures (display user-friendly message)

**Checkpoint**: User Story 1 complete - continuous display with auto-rotation, controls, and audio working independently

---

## Phase 3: User Story 2 - Configurable Meditation Timer (Priority: P2)

**Goal**: Allow users to customize rotation interval (5-60s) via dropdown with localStorage persistence

**Independent Test**: Change timer dropdown to 30s, verify rotation speed updates, refresh page and verify preference persists

**Estimated Time**: 6-8 hours

### Implementation for User Story 2

- [X] T041 [US2] Add timer dropdown to RotationControlsComponent template (select element with 12 options: 5, 10, 15...60)
- [X] T042 [US2] Style timer dropdown in `rotation-controls.component.scss` (match Buddhist theme, readable text, 44x44px touch target)
- [X] T043 [US2] Implement timer interval change handler in RotationControlsComponent (update rotation service interval signal)
- [X] T044 [US2] Wire StorageService to save timer preference on change
- [X] T045 [US2] Load saved timer preference from StorageService on app initialization
- [X] T046 [US2] Handle localStorage unavailable gracefully (use default 15s, no error to user)
- [X] T047 [US2] Validate stored timer value is in allowed range (5-60 in 5s increments)
- [X] T048 [US2] Test timer change takes effect immediately when rotation is paused
- [X] T049 [US2] Test timer change takes effect on next interval when rotation is playing

**Checkpoint**: User Story 2 complete - timer configuration with persistence working, US1 still functional

---

## Phase 4: User Story 3 - Quote Grid Browsing (Priority: P2)

**Goal**: Display 12 quotes in responsive grid below continuous display for browsing

**Independent Test**: Verify 12 quotes display in grid, resize browser to test responsive breakpoints (4→2→1 columns)

**Estimated Time**: 10-12 hours

### Implementation for User Story 3

- [X] T050 [US3] Create QuoteGridComponent in `src/app/features/quote-grid/quote-grid.component.ts` (standalone, displays 12 random quotes)
- [X] T051 [US3] Implement template for QuoteGridComponent in `quote-grid.component.html` (grid container, quote cards)
- [X] T052 [US3] Implement responsive CSS Grid layout in `quote-grid.component.scss` (4 columns desktop, 2 tablet, 1 mobile)
- [X] T053 [US3] Add media query breakpoints: @media (max-width: 767px), (768px-1023px), (min-width: 1024px)
- [X] T054 [US3] Set grid section height to 2/3 screen height (67vh)
- [X] T055 [US3] Wire QuoteGridComponent to QuoteDataService to load 12 random quotes
- [X] T056 [US3] Reuse QuoteCardComponent for each grid item
- [X] T057 [US3] Add vertical scrolling for overflow quotes on mobile
- [X] T058 [US3] Test responsive layout on real devices (iPhone, Android tablet, desktop)
- [X] T059 [US3] Ensure touch targets are 44x44px minimum on mobile
- [X] T060 [US3] Add QuoteGridComponent to main app component template below QuoteDisplayComponent

**Checkpoint**: User Story 3 complete - grid browsing working, US1 and US2 still functional

---

## Phase 5: User Story 4 - Quote Search and Filtering (Priority: P3)

**Goal**: Full-text search across quotes with real-time grid filtering, configurable display count (default: 5), and font selection

**Independent Test**: Type "compassion" in search box, verify grid updates to show only matching quotes; change display count to 10, verify 10 quotes show; change font to Georgia, verify font changes

**Estimated Time**: 8-10 hours

### Implementation for User Story 4

- [X] T061 [US4] Add search input to QuoteGridComponent template above grid
- [X] T062 [US4] Style search input in `quote-grid.component.scss` (Buddhist theme, 44x44px height, clear icon)
- [X] T063 [US4] Create searchQuery signal in QuoteGridComponent (string type)
- [X] T064 [US4] Create filteredQuotes computed signal (filters allQuotes by search query)
- [X] T065 [US4] Implement case-insensitive search across content/author/category fields using String.includes()
- [ ] T066 [US4] Add RxJS debounceTime(500) to search input changes
- [X] T067 [US4] Update grid to display filteredQuotes instead of all quotes
- [X] T068 [US4] Show "No quotes found" message when search returns zero results
- [X] T069 [US4] Add clear search button (X icon) to reset filter
- [ ] T070 [US4] Test search performance with 10K quotes (verify <500ms response time)
- [X] T071 [US4] Handle edge case: search with <12 results (grid adjusts gracefully)
- [X] T072 [US4] Add display count dropdown with options: 5, 10, 12, 15, 20, 25, 30 (default: 5)
- [X] T073 [US4] Style display count dropdown in `quote-grid.component.scss` (Buddhist theme, matches timer controls)
- [X] T074 [US4] Create displayCount signal in QuoteGridComponent (default: 5)
- [X] T075 [US4] Update filteredQuotes computed to respect displayCount limit
- [X] T076 [US4] Add font selection dropdown with options: Noto Serif, Georgia, Merriweather, Lora, Playfair Display, Crimson Text
- [X] T077 [US4] Import Google Fonts in styles.scss for font options
- [X] T078 [US4] Style font selection dropdown in `quote-grid.component.scss` (Buddhist theme, matches other controls)
- [X] T079 [US4] Create selectedFont signal in QuoteGridComponent (default: 'Noto Serif')
- [X] T080 [US4] Implement font change handler to update CSS custom property --quote-font-family
- [X] T081 [US4] Update quote-card.component.scss to use --quote-font-family CSS variable
- [X] T082 [US4] Add responsive styles for filter controls on mobile (stack vertically)

**Checkpoint**: User Story 4 complete - search filtering, display count configuration, and font selection working, all previous user stories functional

---

## Phase 6: Integration & Polish

**Purpose**: Cross-cutting improvements, final testing, deployment preparation

**Estimated Time**: 8-12 hours

### App Integration

- [x] T083 [SHARED] Create main AppComponent layout with two-section structure (1/3 top, 2/3 bottom)
- [x] T084 [SHARED] Add global styles in `src/styles/styles.scss` (Buddhist theme, box-sizing, resets)
- [x] T085 [SHARED] Implement error boundary for JSON load failures
- [x] T086 [SHARED] Add loading spinner while quotes.json loads
- [ ] T087 [P] [SHARED] Optimize bundle size: analyze with `ng build --stats-json` and webpack-bundle-analyzer
- [x] T088 [P] [SHARED] Enable production optimizations in `angular.json` (AOT, optimization, budgets)

### Vietnamese UTF-8 Support

- [x] T089 [P] [SHARED] Add UTF-8 charset meta tag to `index.html`
- [x] T090 [P] [SHARED] Verify all `.ts` and `.json` files saved as UTF-8 without BOM
- [x] T091 [P] [SHARED] Test Vietnamese quotes render correctly (check diacritics: ắ, ằ, ẳ, ẵ, ặ)
- [ ] T092 [P] [SHARED] Test on Windows, macOS, iOS, Android for Vietnamese text rendering

### Accessibility & Mobile

- [ ] T093 [P] [SHARED] Verify all interactive elements are 44x44px minimum (DevTools inspection)
- [ ] T094 [P] [SHARED] Verify all text is 16px minimum on mobile viewports
- [ ] T095 [P] [SHARED] Test keyboard navigation (tab through controls, enter to activate)
- [ ] T096 [P] [SHARED] Add ARIA labels to buttons (play/pause, next, timer dropdown, search)
- [ ] T097 [P] [SHARED] Test with screen reader (NVDA or VoiceOver)
- [ ] T098 [P] [SHARED] Verify no horizontal scrolling on mobile (320px-4K widths)

### Documentation

- [x] T099 [P] [SHARED] Update README.md with project description, setup, deployment instructions
- [x] T100 [P] [SHARED] Document audio file licensing in README (CC0 attribution if required)
- [x] T101 [P] [SHARED] Add screenshots to README (desktop and mobile views)
- [x] T102 [P] [SHARED] Create CONTRIBUTING.md with development workflow and code standards

### Deployment Preparation

- [x] T103 [SHARED] Test production build locally: `ng build --configuration production --base-href /quotes-platform/`
- [x] T104 [SHARED] Verify bundle sizes: main-*.js <500KB, overall <2MB
- [x] T105 [SHARED] Create `404.html` copy of `index.html` for GitHub Pages SPA routing
- [x] T106 [SHARED] Test local production build with `npx http-server dist/quotes-platform/browser`
- [x] T107 [SHARED] Verify all asset paths work with GitHub Pages base href
- [x] T108 [SHARED] Create GitHub Pages deployment script in `package.json` (gh-pages package)
- [ ] T109 [SHARED] Deploy to GitHub Pages and test live site

**Checkpoint**: All user stories integrated, polished, and deployed successfully

---

## Phase 7: Extended Quote Dataset (Optional)

**Purpose**: Expand from 20-50 dev quotes to full 10K production dataset

**Estimated Time**: 4-6 hours (data curation)

- [ ] T110 [P] [SHARED] Curate Buddhist quotes from public domain sources (sutras, teachings)
- [ ] T111 [P] [SHARED] Curate Vietnamese Buddhist quotes with proper UTF-8 diacritics
- [ ] T112 [P] [SHARED] Validate all quotes follow JSON schema (run validation script)
- [ ] T113 [P] [SHARED] Ensure unique IDs for all 10K quotes (sequential: q0001-q10000)
- [ ] T114 [P] [SHARED] Categorize quotes (wisdom, compassion, mindfulness, etc.)
- [ ] T115 [P] [SHARED] Add optional tags for enhanced search
- [ ] T116 [SHARED] Test initial load performance with 10K quotes (verify <3s on broadband)
- [ ] T117 [SHARED] Test search performance with 10K quotes (verify <500ms)

---

## Phase 8: Optional Testing (BDD E2E)

**Purpose**: Add Cucumber/Gherkin + Playwright tests (ONLY if explicitly requested)

**Estimated Time**: 16-20 hours

**⚠️ Note**: Tests are OPTIONAL for V1. Skip this phase unless tests are explicitly required.

### Test Infrastructure Setup

- [ ] T118 [P] [TEST] Install Playwright: `npm install -D @playwright/test`
- [ ] T119 [P] [TEST] Install Cucumber: `npm install -D @cucumber/cucumber`
- [ ] T120 [P] [TEST] Configure Playwright for Cucumber integration
- [ ] T121 [P] [TEST] Create `tests/features/` directory for Gherkin files
- [ ] T122 [P] [TEST] Create `tests/steps/` directory for step definitions
- [ ] T123 [TEST] Add test scripts to `package.json`: `e2e`, `e2e:debug`

### User Story 1 Tests

- [ ] T124 [P] [US1-TEST] Write Gherkin feature: `tests/features/continuous-display.feature` (7 scenarios from spec.md)
- [ ] T125 [US1-TEST] Implement Playwright step definitions: `tests/steps/continuous-display.steps.ts`
- [ ] T126 [US1-TEST] Verify tests fail before implementation (red), pass after (green)

### User Story 2 Tests

- [ ] T127 [P] [US2-TEST] Write Gherkin feature: `tests/features/timer-configuration.feature` (4 scenarios)
- [ ] T128 [US2-TEST] Implement Playwright step definitions: `tests/steps/timer-configuration.steps.ts`

### User Story 3 Tests

- [ ] T129 [P] [US3-TEST] Write Gherkin feature: `tests/features/quote-grid.feature` (5 scenarios)
- [ ] T130 [US3-TEST] Implement Playwright step definitions: `tests/steps/quote-grid.steps.ts`

### User Story 4 Tests

- [ ] T131 [P] [US4-TEST] Write Gherkin feature: `tests/features/search-filtering.feature` (6 scenarios)
- [ ] T132 [US4-TEST] Implement Playwright step definitions: `tests/steps/search-filtering.steps.ts`

### Edge Case Tests

- [ ] T133 [P] [TEST] Write edge case tests for JSON load failures, localStorage unavailable, audio restrictions
- [ ] T134 [TEST] Run full test suite on Chromium, Firefox, WebKit browsers

---

## Dependencies & Execution Order

### Phase Dependencies

1. **Phase 0 (Setup)**: No dependencies - start immediately
2. **Phase 1 (Foundation)**: Depends on Setup - BLOCKS all user stories
3. **Phase 2-5 (User Stories)**: All depend on Foundation completion
   - Can run sequentially (P1 → P2 → P2 → P3) OR
   - Can run in parallel with multiple developers
4. **Phase 6 (Integration)**: Depends on desired user stories being complete
5. **Phase 7 (Dataset)**: Can run anytime after Foundation, recommended before deployment
6. **Phase 8 (Testing)**: Can run in parallel with implementation if TDD approach used

### User Story Independence

- **US1 (P1 - Continuous Display)**: Can start after Foundation ✅ No dependencies on other stories
- **US2 (P2 - Timer Config)**: Can start after Foundation ✅ Integrates with US1 but independently testable
- **US3 (P2 - Quote Grid)**: Can start after Foundation ✅ Independent of US1/US2
- **US4 (P3 - Search)**: Can start after Foundation ✅ Extends US3 but independently testable

### Parallel Execution Opportunities

**Within Foundation (Phase 1)**:
- All model creation tasks (T010-T015) can run in parallel
- Shared component creation (T020-T021) can run in parallel with services
- Static assets (T022-T025) can run in parallel with services

**Across User Stories (Phases 2-5)**:
- With 2 developers: US1 + US2 in parallel (different components)
- With 3 developers: US1 + US2 + US3 in parallel
- With 4 developers: All user stories in parallel

**Within Polish Phase (Phase 6)**:
- Documentation tasks (T088-T091) can run in parallel
- Accessibility audits (T082-T087) can run in parallel

---

## Implementation Strategy

### Recommended Approach: MVP First

1. **Week 1**: Complete Phase 0 (Setup) + Phase 1 (Foundation)
2. **Week 2**: Complete Phase 2 (US1 - Continuous Display) → **DEPLOY MVP**
3. **Week 3**: Complete Phase 3 (US2 - Timer Config) + Phase 4 (US3 - Grid) → **DEPLOY v1.1**
4. **Week 4**: Complete Phase 5 (US4 - Search) + Phase 6 (Integration) → **DEPLOY v1.2**
5. **Week 5**: Phase 7 (Dataset) + Final polish → **DEPLOY v1.0 PRODUCTION**

### MVP Definition

**Minimum Viable Product = Phase 0 + Phase 1 + Phase 2 (US1 only)**

This delivers:
- ✅ Auto-rotating Buddhist quotes
- ✅ Play/Pause/Next controls
- ✅ Audio notification
- ✅ 15-second default timer
- ✅ Buddhist-inspired design

**Total Effort**: ~25-35 hours for MVP

### Full V1 Definition

**Complete V1 = Phases 0-6 + Phase 7**

This delivers all 4 user stories + polish + full dataset

**Total Effort**: ~80-100 hours (without optional tests)
**With Tests**: ~100-120 hours (including Phase 8)

---

## Progress Tracking

**Current Phase**: Phase 5 - User Story 4 (Quote Search and Filtering) ✅ COMPLETE

**Completed Phases**: 
- Phase 0 - Setup ✅
- Phase 1 - Foundation ⏳ (In Progress)
- Phase 2 - User Story 1 (Continuous Display) ⏳ (In Progress)  
- Phase 3 - User Story 2 (Timer Config) ✅
- Phase 4 - User Story 3 (Quote Grid) ✅
- Phase 5 - User Story 4 (Search & Filtering + Display Count + Font Selection) ✅

**Next Milestone**: Phase 6 - Integration & Polish

**Overall Progress**: 82 / 117 tasks completed (70%)

**Last Completed**: Phase 5 - User Story 4 complete with search filtering, configurable display count (default: 5), and font selection

---

## Notes

- Mark tasks complete with `[X]` as you finish them
- Commit after completing each logical group of tasks (e.g., all models, one component, one user story)
- Test each user story independently before moving to next priority
- Use `[P]` marker to identify tasks safe to parallelize
- Stop at checkpoints to validate functionality before proceeding
- Document any deviations from plan in commit messages
- Update this file as new tasks are discovered during implementation
