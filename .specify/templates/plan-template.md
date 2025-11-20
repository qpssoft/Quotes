# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. For Quotes Platform, default values are provided below based on
  the constitution requirements. Update as needed for specific features.
-->

**Language/Version**: TypeScript 5.x (with strict mode), Angular 18+ (web) OR React Native latest (native platforms)
**Primary Dependencies**: 
  - Web: Angular CLI, RxJS, Angular Router, Angular Forms
  - Native: React Native, React Navigation, Expo (optional), React Native Sound/Haptics
  - Shared: TypeScript shared modules for business logic
**Storage**: 
  - Web: Static JSON files, localStorage + IndexedDB for caching
  - Native: Bundled JSON, AsyncStorage/MMKV/SQLite for offline data
  - Wearables: Synced subset from paired device
**Testing**: 
  - Web: Jasmine + Karma (unit), Cucumber/Gherkin + Playwright (e2e) - optional
  - Native: Jest + React Native Testing Library (unit), Detox/Maestro (e2e) - optional
  - Shared: Jest for shared business logic modules
**Target Platform**: 
  - Web: Modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions), mobile-responsive
  - Mobile: iOS 13+, Android 6.0+ (API 23+)
  - Desktop: Windows 10+, macOS 10.14+
  - Wearables: watchOS 6+, Wear OS 2+
**Project Type**: 
  - Monorepo with Angular web app (quotes-platform/) + React Native native app (quotes-native/)
  - Shared business logic via TypeScript modules (shared-modules/)
**Performance Goals**: 
  - Web: <3s initial load on 4G, <1s search response, <2MB initial bundle
  - Native: <2s app launch, 60fps animations, <50MB app size
  - Wearables: <500ms complication update, <1% battery per hour
**Constraints**: 
  - No backend server (all platforms use static/bundled JSON)
  - Offline-first (must function without internet after setup)
  - Platform-specific UI (Angular for web, React Native for native)
  - Shared business logic (search, rotation, data models)
  - App store guidelines (iOS, Android, Windows, macOS)
  - Vietnamese text (UTF-8 with diacritics across all platforms)
**Scale/Scope**: 
  - 500K+ Buddhist wisdom content items (quotes, proverbs, ca dao)
  - Multi-platform: web, iOS, Android, Windows, macOS, Apple Watch, Android Wear
  - Multi-field search, category filtering, random selection with caching
  - Buddhist-inspired design aesthetic (consistent across platforms)
  - Phase 2: Native platform expansion (mobile → desktop → wearables)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with principles from `.specify/memory/constitution.md`:

- [ ] **Shared Static JSON Data Architecture**: Does the design use static JSON files across all platforms? No backend dependencies? Platform-specific caching strategies defined (web: localStorage/IndexedDB, native: AsyncStorage/MMKV, wearables: paired device sync)? Performance optimizations planned for 500K records? Content taxonomy supports all types? UTF-8 encoding for Vietnamese text?
- [ ] **Web Platform with Angular**: Is Angular used for web platform? TypeScript strict mode? Angular style guide followed? PWA configuration for offline support? GitHub Pages deployment configured?
- [ ] **Native Platforms with React Native** (if applicable): Is React Native used for iOS, Android, Windows, macOS, wearables? TypeScript throughout? Platform-specific code paths planned? Expo or bare workflow justified? Wearables extensions configured?
- [ ] **Buddhist-Inspired UX Across All Platforms**: Is Buddhist aesthetic applied consistently (calming colors, whitespace, serene typography)? Platform-specific adaptations defined (web responsive, native gestures, watch complications)? Offline-first design? Audio + haptic feedback planned appropriately per platform? Vietnamese text renders correctly?
- [ ] **Performance at Scale**: Platform-specific performance targets defined? Sub-second search times planned? Bundle size constraints met (web <2MB, native <50MB, wearables <10MB)? Background operation support (mobile)? Battery efficiency planned (wearables)?
- [ ] **Simplicity**: Is the solution minimal? Dependencies justified per platform? Code sharing strategy clear? Platform-specific UI implementations justified? Avoiding over-engineering?
- [ ] **Multi-Platform Architecture** (if applicable): React Native project structure defined? Monorepo configuration planned? Platform-specific features documented (mobile widgets, desktop menu bar, wearables complications)?
- [ ] **Code Sharing Strategy**: Shared business logic identified? Shared TypeScript modules structure defined? Platform-specific UI implementations clear? Testing strategy for shared modules?
- [ ] **BDD Testing (if tests included)**: Are acceptance criteria written in Given-When-Then (Gherkin) format? Are platform-appropriate test tools selected (Playwright for web, Detox for native)? Test structure includes feature files and step definitions?

**Violations Requiring Justification**: [List any principle violations and document in Complexity Tracking section below]

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths. The delivered plan must not include Option labels.
  
  For Quotes Platform: Use Angular web app structure (Option 2) since the project
  is an Angular-based frontend application with static JSON data.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (library, CLI tool, or backend-only service)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [DEFAULT FOR WEB PLATFORM] Option 2: Angular web application
# Use this structure for the Quotes web platform (quotes-platform/)
frontend/                   # or root-level if no backend
├── src/
│   ├── app/
│   │   ├── core/          # Singleton services, guards, interceptors
│   │   ├── shared/        # Shared components, directives, pipes
│   │   ├── features/      # Feature modules (quotes, search, browse)
│   │   ├── models/        # TypeScript interfaces and types
│   │   └── services/      # Data services, state management
│   ├── assets/
│   │   └── data/          # Static JSON quote files (chunked)
│   └── environments/
└── tests/
    ├── e2e/               # End-to-end tests (optional - if using Playwright without Cucumber)
    ├── features/          # Cucumber/Gherkin feature files (optional BDD e2e tests)
    ├── steps/             # Playwright step definitions for Gherkin scenarios (optional BDD e2e tests)
    └── unit/              # Component and service unit tests (optional)

# [FOR NATIVE PLATFORMS] Option 3: React Native application
# Use this structure for native platforms (quotes-native/)
quotes-native/
├── src/
│   ├── shared/            # Shared business logic (TypeScript)
│   ├── components/        # Shared React Native components
│   ├── screens/           # Screen components (navigation destinations)
│   ├── navigation/        # React Navigation configuration
│   ├── services/          # Platform-specific services (audio, haptics, storage)
│   ├── ios/              # iOS-specific code (optional)
│   ├── android/          # Android-specific code (optional)
│   ├── windows/          # Windows-specific code (React Native Windows)
│   ├── macos/            # macOS-specific code (React Native macOS)
│   └── wearables/        # Watch-specific code (WatchKit, Wear OS)
├── ios/                  # Native iOS project (Xcode)
├── android/              # Native Android project (Android Studio)
├── windows/              # Native Windows project (Visual Studio)
├── macos/                # Native macOS project (Xcode)
└── __tests__/            # Jest unit tests
    └── e2e/              # Detox/Maestro e2e tests (optional)

# [FOR MONOREPO] Option 4: Multi-platform monorepo
# Use this structure when building both web (Angular) and native (React Native)
Quotes/                    # Repository root
├── quotes-platform/      # Angular web app (existing)
│   ├── src/
│   │   └── app/
│   └── tests/
├── quotes-native/        # NEW React Native app
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── ios/
│   │   ├── android/
│   │   ├── windows/
│   │   ├── macos/
│   │   └── wearables/
│   ├── ios/              # Native projects
│   ├── android/
│   ├── windows/
│   ├── macos/
│   └── __tests__/
├── shared-modules/       # Shared TypeScript business logic
│   ├── models/           # Data models (Quote, Category, etc.)
│   ├── services/         # Business logic (search, rotation)
│   ├── utils/            # Utility functions
│   └── __tests__/        # Jest tests for shared modules
├── specs/                # Feature specifications (Speckit)
└── .github/              # CI/CD workflows

# [REMOVE IF UNUSED] Option 5: Mobile + API (legacy pattern, not used for Quotes)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
