---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification. When tests ARE included, follow Principle VI (BDD Testing) using Cucumber/Gherkin feature files with Playwright execution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Angular web app (Web Platform)**: `quotes-platform/src/app/`, `quotes-platform/src/assets/`, `quotes-platform/tests/`
- **React Native app (Native Platforms)**: `quotes-native/src/`, `quotes-native/ios/`, `quotes-native/android/`, `quotes-native/windows/`, `quotes-native/macos/`, `quotes-native/__tests__/`
- **Shared modules**: `shared-modules/models/`, `shared-modules/services/`, `shared-modules/utils/`, `shared-modules/__tests__/`
- **BDD E2E tests**: 
  - Web: `quotes-platform/tests/features/*.feature` (Gherkin), `quotes-platform/tests/steps/*.ts` (Playwright)
  - Native: `quotes-native/e2e/*.spec.js` (Detox/Maestro)
- **Single project (if applicable)**: `src/`, `tests/` at repository root (for libraries or backend services)
- Paths shown below are EXAMPLES - adjust based on plan.md project structure

<!-- 
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.
  
  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/
  
  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment
  
  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

**For Web Platform (Angular)**:
- [ ] T001 Create Angular project using Angular CLI with routing and SCSS/CSS
- [ ] T002 Configure TypeScript strict mode and ESLint with Angular rules
- [ ] T003 [P] Setup Prettier formatting and editor config
- [ ] T004 [P] Initialize Git repository with .gitignore for Angular projects

**For Native Platform (React Native)**:
- [ ] T001 Create React Native project using Expo CLI or React Native CLI
- [ ] T002 Configure TypeScript strict mode and ESLint with React Native rules
- [ ] T003 [P] Setup Prettier formatting and editor config (shared with web)
- [ ] T004 Setup iOS project (Xcode, CocoaPods)
- [ ] T005 Setup Android project (Android Studio, Gradle)
- [ ] T006 [P] Setup Windows project (React Native Windows, Visual Studio)
- [ ] T007 [P] Setup macOS project (React Native macOS, Xcode)
- [ ] T008 [P] Configure platform-specific build scripts

**For Monorepo (Both Platforms)**:
- [ ] T001 Initialize monorepo structure with Lerna, Nx, or Yarn Workspaces
- [ ] T002 Create shared-modules package with TypeScript configuration
- [ ] T003 [P] Setup cross-platform Prettier and ESLint configuration
- [ ] T004 Configure build scripts for all platforms
- [ ] T005 Setup Git with .gitignore for multi-platform monorepo

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

**For Web Platform (Angular)**:
- [ ] T010 Create core module structure (src/app/core/, src/app/shared/)
- [ ] T011 [P] Setup JSON data loading service with chunking strategy
- [ ] T012 [P] Implement routing structure and lazy-loading configuration (GitHub Pages base path)
- [ ] T013 Create base models/interfaces for content entities in src/app/models/
- [ ] T014 Configure error handling service and HTTP interceptors (if needed)
- [ ] T015 Setup environment configuration (development/production with GitHub Pages paths)
- [ ] T016 [P] Create shared UI components (card layout, loading states, Buddhist-inspired styles)
- [ ] T017 [P] Setup search indexing strategy for JSON data
- [ ] T018 [P] Implement localStorage/IndexedDB caching service

**For Native Platform (React Native)**:
- [ ] T010 Create project structure (src/components/, src/screens/, src/services/, src/navigation/)
- [ ] T011 [P] Setup JSON data bundling and loading service
- [ ] T012 [P] Implement React Navigation configuration (Stack, Tab, Drawer as needed)
- [ ] T013 Create shared TypeScript models/interfaces for content entities in src/models/
- [ ] T014 Configure error handling and global error boundary
- [ ] T015 Setup environment configuration (development/production, platform-specific configs)
- [ ] T016 [P] Create shared React Native components (Quote card, Loading states, Buddhist UI)
- [ ] T017 [P] Setup search service with background thread support
- [ ] T018 [P] Implement AsyncStorage/MMKV caching service
- [ ] T019 [P] Setup platform detection utilities (Platform.OS checks)
- [ ] T020 [P] Configure audio service (React Native Sound or Expo Audio)
- [ ] T021 [P] Configure haptic feedback service (platform-specific)

**For Shared Modules (Monorepo)**:
- [ ] T010 Create shared data models package (shared-modules/models/)
- [ ] T011 [P] Create shared business logic package (shared-modules/services/)
- [ ] T012 [P] Create shared utilities package (shared-modules/utils/)
- [ ] T013 Implement shared SearchService (platform-agnostic search logic)
- [ ] T014 Implement shared RotationService (random selection, timer logic)
- [ ] T015 [P] Setup shared TypeScript configuration and build scripts
- [ ] T016 [P] Configure Jest for shared module unit tests

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**
> **BDD Approach**: Create Gherkin feature file first, then implement Playwright step definitions

- [ ] T012 [P] [US1] Unit test for [component/service] in src/app/[feature]/[name].spec.ts
- [ ] T013 [P] [US1] Write Gherkin feature file for [user journey] in tests/features/[name].feature
- [ ] T014 [P] [US1] Implement Playwright step definitions in tests/steps/[name].steps.ts
- [ ] T015 [US1] Verify Cucumber/Playwright test fails (red), then passes after implementation (green)

### Implementation for User Story 1

- [ ] T016 [P] [US1] Create [Model/Interface] in src/app/models/[entity].ts
- [ ] T017 [P] [US1] Create [Component] in src/app/features/[feature]/[component]/
- [ ] T018 [US1] Implement [Service] in src/app/services/[service].service.ts
- [ ] T019 [US1] Implement [component template and styles] in [component].component.html/scss
- [ ] T020 [US1] Add routing configuration for [feature] in app-routing.module.ts
- [ ] T021 [US1] Add error handling and loading states

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T022 [P] [US2] Unit test for [component/service] in src/app/[feature]/[name].spec.ts
- [ ] T023 [P] [US2] Write Gherkin feature file for [user journey] in tests/features/[name].feature
- [ ] T024 [P] [US2] Implement Playwright step definitions in tests/steps/[name].steps.ts

### Implementation for User Story 2

- [ ] T025 [P] [US2] Create [Model/Interface] in src/app/models/[entity].ts
- [ ] T026 [P] [US2] Create [Component] in src/app/features/[feature]/[component]/
- [ ] T027 [US2] Implement [Service] in src/app/services/[service].service.ts
- [ ] T028 [US2] Implement [component template and styles]
- [ ] T029 [US2] Integrate with User Story 1 components (if needed via shared services)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T030 [P] [US3] Unit test for [component/service] in src/app/[feature]/[name].spec.ts
- [ ] T031 [P] [US3] Write Gherkin feature file for [user journey] in tests/features/[name].feature
- [ ] T032 [P] [US3] Implement Playwright step definitions in tests/steps/[name].steps.ts

### Implementation for User Story 3

- [ ] T033 [P] [US3] Create [Model/Interface] in src/app/models/[entity].ts
- [ ] T034 [P] [US3] Create [Component] in src/app/features/[feature]/[component]/
- [ ] T035 [US3] Implement [Service] in src/app/services/[service].service.ts
- [ ] T036 [US3] Implement [component template and styles]

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Update README.md and documentation in docs/
- [ ] TXXX Code cleanup and refactoring (dead code removal, naming consistency)
- [ ] TXXX Performance optimization across all stories (bundle analysis, lazy loading)
- [ ] TXXX [P] Additional unit tests (if requested) in src/app/**/*.spec.ts
- [ ] TXXX Accessibility audit and WCAG compliance fixes
- [ ] TXXX [P] Build production bundle and verify size constraints (<2MB)
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Unit test for [component/service] in src/app/[feature]/[name].spec.ts"
Task: "Write Gherkin feature file for [user journey] in tests/features/[name].feature"
Task: "Implement Playwright step definitions in tests/steps/[name].steps.ts"

# Launch all Angular artifacts for User Story 1 together:
Task: "Create [Model/Interface] in src/app/models/[entity].ts"
Task: "Create [Component] in src/app/features/[feature]/[component]/"
Task: "Implement [Service] in src/app/services/[service].service.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
