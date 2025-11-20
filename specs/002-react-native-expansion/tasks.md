````markdown
# Tasks: Multi-Platform React Native Expansion

**Feature Branch**: `002-react-native-expansion`  
**Input**: Design documents from `/specs/002-react-native-expansion/`  
**Prerequisites**: ✅ plan.md, ✅ spec.md, ✅ research.md, ✅ data-model.md, ✅ contracts/, ✅ quickstart.md

**Tests**: Tests are OPTIONAL per constitution. This feature focuses on rapid multi-platform validation. Testing is recommended for Phase 2+ production release.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize monorepo structure and shared business logic foundation

**Duration**: Week 1 (5-7 days)

### Monorepo Initialization

- [ ] T001 Create monorepo package.json at repository root with Yarn Workspaces configuration (workspaces: quotes-platform, quotes-native, shared-modules)
- [ ] T002 [P] Update root .gitignore to include node_modules, dist, build, .expo, ios/Pods, android/.gradle
- [ ] T003 [P] Create shared-modules directory with package.json (@quotes/shared-modules, TypeScript configuration)
- [ ] T004 Configure shared-modules/tsconfig.json with strict mode, ES2020 target, declaration files enabled

### Shared Business Logic (TypeScript Models)

- [ ] T005 [P] Create quote.model.ts in shared-modules/src/models/ (QuoteType enum, Language enum, Quote interface per data-model.md)
- [ ] T006 [P] Create category.model.ts in shared-modules/src/models/ (Category interface, CATEGORIES constant per data-model.md)
- [ ] T007 [P] Create user-preferences.model.ts in shared-modules/src/models/ (UserPreferences interface, NotificationPosition enum, KeyboardShortcuts interface per data-model.md)
- [ ] T008 [P] Create sync-state.model.ts in shared-modules/src/models/ (SyncState interface for V3+ Firebase compatibility per data-model.md)
- [ ] T009 Create index.ts in shared-modules/src/models/ exporting all models (public API)

### Shared Business Logic (Services Interfaces)

- [ ] T010 [P] Create storage.service.ts in shared-modules/src/services/ (IStorageService interface per contracts/storage-service.contract.md)
- [ ] T011 [P] Create search.service.ts in shared-modules/src/services/ (SearchService class implementation per contracts/search-service.contract.md)
- [ ] T012 [P] Create rotation.service.ts in shared-modules/src/services/ (RotationService class implementation per contracts/rotation-service.contract.md)
- [ ] T013 [P] Create audio.service.ts in shared-modules/src/services/ (IAudioService interface per contracts/audio-service.contract.md)
- [ ] T014 [P] Create haptic.service.ts in shared-modules/src/services/ (IHapticService interface per contracts/haptic-service.contract.md)
- [ ] T015 Create index.ts in shared-modules/src/services/ exporting all service interfaces

### Shared Utilities

- [ ] T016 [P] Create text-utils.ts in shared-modules/src/utils/ (Vietnamese NFC normalization, diacritic-insensitive comparison functions)
- [ ] T017 [P] Create uuid.ts in shared-modules/src/utils/ (UUID v4 generation function for cross-platform compatibility)
- [ ] T018 [P] Create date-utils.ts in shared-modules/src/utils/ (ISO 8601 date formatting, timestamp utilities)
- [ ] T019 Create index.ts in shared-modules/src/utils/ exporting all utilities

### Shared Module Testing & Build

- [ ] T020 Configure Jest for shared-modules/__tests__/ (jest.config.js with TypeScript support)
- [ ] T021 [P] Write unit tests for SearchService in shared-modules/__tests__/services/search.service.test.ts (>80% coverage target)
- [ ] T022 [P] Write unit tests for RotationService in shared-modules/__tests__/services/rotation.service.test.ts (>80% coverage target)
- [ ] T023 [P] Write unit tests for text-utils.ts in shared-modules/__tests__/utils/text-utils.test.ts (Vietnamese text normalization validation)
- [ ] T024 Build shared-modules with TypeScript compiler (yarn build, output to dist/)
- [ ] T025 Verify shared-modules builds successfully and exports all public APIs from dist/index.js

**Checkpoint**: Shared business logic foundation complete - can be imported by both web and native platforms

---

## Phase 2: Foundational (React Native Project Setup)

**Purpose**: Initialize React Native project structure - BLOCKS all user story implementation

**Duration**: Week 1-2 (7-10 days)

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Expo Managed Workflow Initialization

- [ ] T026 Create quotes-native directory at repository root
- [ ] T027 Initialize Expo managed workflow project in quotes-native using `npx create-expo-app . --template blank-typescript`
- [ ] T028 Configure quotes-native/app.json with app metadata (name: "Buddhist Quotes", slug: "buddhist-quotes", version: "1.0.0")
- [ ] T029 Update quotes-native/app.json with bundle identifiers (iOS: com.qpssoft.quotes.ios, Android: com.qpssoft.quotes.android)
- [ ] T030 [P] Configure quotes-native/app.json with splash screen and app icon placeholders (Buddhist-inspired design)
- [ ] T031 Configure quotes-native/tsconfig.json with strict mode matching shared-modules configuration

### React Native Dependencies

- [ ] T032 Install React Navigation dependencies in quotes-native (yarn add @react-navigation/native @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context)
- [ ] T033 Install Expo audio dependencies (yarn add expo-av)
- [ ] T034 Install Expo haptics dependencies (yarn add expo-haptics)
- [ ] T035 Install AsyncStorage (yarn add @react-native-async-storage/async-storage)
- [ ] T036 Add shared-modules as dependency in quotes-native/package.json (yarn add @quotes/shared-modules@1.0.0)
- [ ] T037 [P] Configure ESLint for React Native with TypeScript (quotes-native/.eslintrc.js matching shared-modules rules)
- [ ] T038 [P] Configure Prettier for React Native (quotes-native/.prettierrc matching shared-modules formatting)

### React Native Project Structure

- [ ] T039 Create quotes-native/src/ directory structure (App.tsx, components/, screens/, services/, navigation/, hooks/, constants/)
- [ ] T040 [P] Create quotes-native/src/constants/Colors.ts with Buddhist-inspired design tokens (calming colors, serene palette)
- [ ] T041 [P] Create quotes-native/src/constants/Config.ts with app configuration (timer intervals, defaults, storage keys)
- [ ] T042 Create quotes-native/assets/ directory structure (audio/, data/, images/)
- [ ] T043 [P] Copy audio notification file to quotes-native/assets/audio/notification.mp3 (from web platform or find Buddhist bell sound <100KB)
- [ ] T044 [P] Copy quotes.json to quotes-native/assets/data/quotes.json (bundle ~5-10K quotes for mobile app)

### Platform-Specific Storage Service

- [ ] T045 Create NativeStorageService.ts in quotes-native/src/services/storage/ implementing IStorageService from shared-modules
- [ ] T046 Implement NativeStorageService.savePreferences using AsyncStorage.setItem with JSON serialization
- [ ] T047 Implement NativeStorageService.loadPreferences using AsyncStorage.getItem with Date deserialization (handle createdAt, updatedAt)
- [ ] T048 Implement NativeStorageService.saveFavorites using AsyncStorage.setItem with string array serialization
- [ ] T049 Implement NativeStorageService.loadFavorites using AsyncStorage.getItem returning string[] of quote IDs
- [ ] T050 [P] Write unit tests for NativeStorageService in quotes-native/__tests__/services/storage/NativeStorageService.test.ts

### Platform-Specific Audio Service

- [ ] T051 Create NativeAudioService.ts in quotes-native/src/services/audio/ implementing IAudioService from shared-modules
- [ ] T052 Implement NativeAudioService.loadSound preloading assets/audio/notification.mp3 using Expo Audio API (Audio.Sound.createAsync)
- [ ] T053 Implement NativeAudioService.play with error handling and volume control (respect user's soundEnabled preference)
- [ ] T054 Implement NativeAudioService.setVolume (0.0-1.0 range)
- [ ] T055 [P] Write unit tests for NativeAudioService in quotes-native/__tests__/services/audio/NativeAudioService.test.ts

### Platform-Specific Haptic Service

- [ ] T056 Create HapticService.ts in quotes-native/src/services/haptic/ implementing IHapticService from shared-modules
- [ ] T057 Implement HapticService.trigger using Expo Haptics (Haptics.impactAsync with ImpactFeedbackStyle.Light)
- [ ] T058 Implement HapticService.setIntensity for battery-aware haptic intensity reduction (20% battery: reduce intensity, 10% battery: disable)
- [ ] T059 [P] Write unit tests for HapticService in quotes-native/__tests__/services/haptic/HapticService.test.ts

### Background Service (Optional Advanced Feature)

- [ ] T060 Create BackgroundService.ts in quotes-native/src/services/background/ for optional background auto-rotation
- [ ] T061 Implement BackgroundService.requestPermission (iOS: background audio capability, Android: foreground service permission)
- [ ] T062 Implement BackgroundService.enableBackgroundMode with battery impact warning dialog ("~5-10% battery drain per hour")
- [ ] T063 Implement BackgroundService.disableBackgroundMode with cleanup
- [ ] T064 Add background audio configuration to app.json (iOS: UIBackgroundModes audio, Android: foreground service)

**Checkpoint**: React Native foundation ready - all platform services implemented, can start building UI

---

## Phase 3: User Story 1 - Mobile Quote Browsing (Priority: P1) 🎯 MVP

**Goal**: Enable Buddhist practitioners to browse and view quotes on mobile devices (iOS/Android) with native gestures, offline support, and haptic feedback

**Independent Test**: Install mobile app, enable airplane mode, open app → should see all quotes, swipe through grid smoothly, tap Play → auto-rotation starts with haptic feedback every 15s

**Why P1**: Mobile is most-requested platform, largest user base, enables offline access during commutes and meditation sessions

**Duration**: Week 2-5 (14-21 days)

### React Hooks for State Management

- [ ] T065 [P] [US1] Create useQuotes.ts hook in quotes-native/src/hooks/ (load quotes from assets/data/quotes.json, cache in AsyncStorage using NativeStorageService)
- [ ] T066 [P] [US1] Create useRotation.ts hook in quotes-native/src/hooks/ (auto-rotation logic using RotationService from shared-modules, timer state management)
- [ ] T067 [P] [US1] Create usePreferences.ts hook in quotes-native/src/hooks/ (load/save UserPreferences using NativeStorageService, provide preference update functions)

### Shared Components (Quote Display)

- [ ] T068 [P] [US1] Create QuoteCard.tsx component in quotes-native/src/components/ (display single quote with content, author, category, Buddhist-inspired card styling)
- [ ] T069 [US1] Add fade-in/fade-out animation to QuoteCard for smooth transitions (using Animated API or React Native Reanimated)
- [ ] T070 [P] [US1] Create QuoteGrid.tsx component in quotes-native/src/components/ (FlatList rendering with search filtering, 1-column mobile layout)
- [ ] T071 [US1] Implement QuoteGrid swipe gestures for smooth native scrolling (optimize FlatList performance with getItemLayout)
- [ ] T072 [P] [US1] Create RotationControls.tsx component in quotes-native/src/components/ (Play/Pause/Next buttons, timer interval picker 5-60s)

### Main Screen (Home)

- [ ] T073 [US1] Create HomeScreen.tsx in quotes-native/src/screens/ (main quotes screen with continuous display + quote grid layout)
- [ ] T074 [US1] Integrate useQuotes hook in HomeScreen to load and display quotes from bundled JSON
- [ ] T075 [US1] Integrate useRotation hook in HomeScreen for auto-rotation functionality (default 15s interval)
- [ ] T076 [US1] Implement Play button → start auto-rotation with haptic feedback on each transition (HapticService.trigger)
- [ ] T077 [US1] Implement Pause button → stop auto-rotation, maintain current quote
- [ ] T078 [US1] Implement Next button → skip to next random quote immediately with haptic feedback
- [ ] T079 [US1] Add audio notification on quote transitions (NativeAudioService.play when soundEnabled=true in preferences)
- [ ] T080 [US1] Implement timer interval picker → update preferences and restart rotation with new interval

### Search Screen

- [ ] T081 [US1] Create SearchScreen.tsx in quotes-native/src/screens/ (search input with filtered results)
- [ ] T082 [US1] Integrate SearchService from shared-modules for full-text search (content, author, category, tags)
- [ ] T083 [US1] Implement Vietnamese diacritic-insensitive search using text-utils from shared-modules (NFC normalization)
- [ ] T084 [US1] Display real-time search results in QuoteGrid with <1s response time
- [ ] T085 [US1] Add category filtering UI (dropdown or chips for Category selection)

### Favorites Screen

- [ ] T086 [US1] Create FavoritesScreen.tsx in quotes-native/src/screens/ (display saved quotes list)
- [ ] T087 [US1] Implement Add/Remove favorite functionality with heart icon toggle (update preferences.favorites array)
- [ ] T088 [US1] Persist favorites in AsyncStorage using NativeStorageService
- [ ] T089 [US1] Display favorites in QuoteGrid component (filter quotes by favorites array)

### Settings Screen

- [ ] T090 [US1] Create SettingsScreen.tsx in quotes-native/src/screens/ (user preferences UI)
- [ ] T091 [P] [US1] Add timer interval picker (Slider 5-60s, step: 5s, default: 15s)
- [ ] T092 [P] [US1] Add sound toggle switch (enable/disable audio notifications on transitions)
- [ ] T093 [P] [US1] Add haptic toggle switch (enable/disable haptic feedback on transitions)
- [ ] T094 [US1] Add background mode toggle with permission request (show battery impact warning "~5-10% drain per hour" using BackgroundService)
- [ ] T095 [US1] Persist all preference changes using usePreferences hook (save to AsyncStorage immediately)

### Navigation Setup

- [ ] T096 [US1] Create AppNavigator.tsx in quotes-native/src/navigation/ (Bottom tab navigator: Home, Search, Favorites, Settings)
- [ ] T097 [US1] Configure tab bar with Buddhist-inspired icons and styling (calming colors from Colors.ts)
- [ ] T098 [US1] Add platform-specific tab bar styling (iOS vs Android native patterns)
- [ ] T099 [US1] Update App.tsx to wrap AppNavigator with NavigationContainer

### Testing & Refinement

- [ ] T100 [US1] Manual test on iOS physical device (iPhone): quotes load offline, swipe gestures smooth, haptic feedback works, audio plays on transitions
- [ ] T101 [US1] Manual test on Android physical device (Pixel/Samsung): quotes load offline, swipe gestures smooth, haptic feedback works, audio plays on transitions
- [ ] T102 [US1] Test Vietnamese text rendering with NFC normalization on both iOS and Android (verify diacritics display correctly)
- [ ] T103 [US1] Test offline functionality: enable airplane mode, close app, reopen → all quotes available, search works, favorites persist
- [ ] T104 [US1] Test background mode with battery monitoring: enable background rotation, monitor battery drain over 1 hour (target <10% drain)
- [ ] T105 [US1] Test app performance: app launch <2s, 60fps animations during quote transitions, search response <1s
- [ ] T106 [US1] Fix bugs identified in testing and polish UI for Buddhist aesthetic (calming colors, whitespace, serene typography)

**Checkpoint**: User Story 1 complete - Mobile quote browsing fully functional on iOS and Android with offline support, native gestures, haptic feedback

---

## Phase 4: User Story 2 - Desktop Quote Application (Priority: P2)

**Goal**: Launch native desktop applications (Windows/macOS) that run in menu bar/system tray with global keyboard shortcuts

**Independent Test**: Install desktop app, verify menu bar icon (macOS) or system tray icon (Windows), press Ctrl+C → quote notification appears in configured corner, press Ctrl+V → next quote appears

**Why P2**: Desktop apps enable system integration for seamless work-life mindfulness practice without opening browser

**Duration**: Week 6-8 (14-21 days)

**Prerequisites**: Phase 3 (User Story 1) complete, Expo ejected to bare workflow

### Bare Workflow Migration

- [ ] T107 [US2] Eject from Expo managed workflow to bare workflow (run `expo eject` in quotes-native/, choose "bare workflow")
- [ ] T108 [US2] Verify iOS build still works after ejection (`npx react-native run-ios`)
- [ ] T109 [US2] Verify Android build still works after ejection (`npx react-native run-android`)
- [ ] T110 [US2] Migrate from Expo Audio to React Native Sound if needed (update NativeAudioService.ts to use react-native-sound)
- [ ] T111 [US2] Migrate from Expo Haptics to React Native Haptic Feedback if needed (update HapticService.ts)

### React Native Windows Setup

- [ ] T112 [US2] Initialize React Native Windows in quotes-native (`npx react-native-windows-init --overwrite`)
- [ ] T113 [US2] Verify windows/ directory created with Visual Studio solution (.sln)
- [ ] T114 [P] [US2] Create WindowsStorageService.ts in quotes-native/src/services/storage/windows/ implementing IStorageService using Windows.Storage.LocalSettings API
- [ ] T115 [P] [US2] Create WindowsAudioService.ts in quotes-native/src/services/audio/windows/ implementing IAudioService using Windows.Media.Playback API
- [ ] T116 [US2] Test Windows build (`npx react-native run-windows`)

### Windows Desktop-Specific Features

- [ ] T117 [P] [US2] Implement system tray icon integration for Windows (create native module or use community package)
- [ ] T118 [P] [US2] Implement global keyboard shortcuts for Windows (register Ctrl+C/Ctrl+X for show quote, Ctrl+V/Ctrl+N for next quote)
- [ ] T119 [US2] Create quote notification overlay component for Windows (display in user-configured corner position, 9 position options)
- [ ] T120 [US2] Implement notification positioning logic (detect mouse cursor location for multi-display support)
- [ ] T121 [P] [US2] Implement auto-launch on startup for Windows (optional user setting, add registry entry)
- [ ] T122 [US2] Add settings UI for keyboard shortcut customization and notification position selection

### React Native macOS Setup

- [ ] T123 [US2] Initialize React Native macOS in quotes-native (`npx react-native-macos-init --overwrite`)
- [ ] T124 [US2] Install CocoaPods dependencies for macOS (`cd macos && pod install`)
- [ ] T125 [P] [US2] Create MacStorageService.ts in quotes-native/src/services/storage/macos/ implementing IStorageService using UserDefaults API
- [ ] T126 [P] [US2] Create MacAudioService.ts in quotes-native/src/services/audio/macos/ implementing IAudioService using AVFoundation API
- [ ] T127 [US2] Test macOS build (`npx react-native run-macos`)

### macOS Desktop-Specific Features

- [ ] T128 [P] [US2] Implement menu bar app integration for macOS (NSStatusItem with click-to-show quote)
- [ ] T129 [P] [US2] Implement global keyboard shortcuts for macOS (register Cmd+C/Cmd+X for show quote, Cmd+V/Cmd+N for next quote)
- [ ] T130 [US2] Create quote notification overlay component for macOS (display in user-configured corner position)
- [ ] T131 [US2] Implement notification positioning logic for macOS (detect active display, position overlay)
- [ ] T132 [P] [US2] Implement auto-launch on startup for macOS (add to Login Items via native API)
- [ ] T133 [US2] Add settings UI for keyboard shortcut customization and notification position selection

### Desktop UI Polish

- [ ] T134 [P] [US2] Increase font sizes for desktop readability (16-18px minimum, larger than mobile)
- [ ] T135 [P] [US2] Optimize layouts for mouse interaction (larger click targets, hover states)
- [ ] T136 [US2] Test keyboard navigation (Tab, Enter, Arrow keys for all interactive elements)
- [ ] T137 [US2] Implement native menus for Windows and macOS (File, Edit, View, Help)

### Testing & Refinement

- [ ] T138 [US2] Manual test on Windows 10/11: menu bar icon works, Ctrl+C shows quote, notification positioning correct, auto-launch works
- [ ] T139 [US2] Manual test on macOS 13+: menu bar app works, Cmd+C shows quote, notification positioning correct, auto-launch works
- [ ] T140 [US2] Test multi-display support on both platforms (notification appears on active display)
- [ ] T141 [US2] Test all 9 notification positions (corners, edges, center)
- [ ] T142 [US2] Test keyboard shortcut customization (change from Ctrl+C to Ctrl+X, verify persistence)
- [ ] T143 [US2] Fix bugs and polish desktop UI for consistency with mobile Buddhist aesthetic

**Checkpoint**: User Story 2 complete - Desktop apps functional on Windows and macOS with system integration features

---

## Phase 5: User Story 3 - Wearables Quick Access (Priority: P3)

**Goal**: Launch smartwatch apps (Apple Watch/Android Wear) with complications, standalone mode, and haptic feedback for brief mindfulness moments

**Independent Test**: Install watch app, add quote complication to watch face → see current quote, rotate digital crown → navigate through quotes with haptic feedback, disconnect from phone → standalone mode works with 50 synced quotes

**Why P3**: Wearables extend mindfulness practice to micro-moments throughout the day (waiting, between meetings)

**Duration**: Week 9-11 (14-21 days)

**Prerequisites**: Phase 3 (User Story 1) complete, bare workflow (from Phase 4)

### Apple Watch Development

- [ ] T144 [US3] Open quotes-native/ios/QuotesNative.xcworkspace in Xcode
- [ ] T145 [US3] Create WatchKit extension (File → New → Target → Watch App, name: QuotesWatch, language: Swift, UI: SwiftUI)
- [ ] T146 [P] [US3] Implement quote display view in SwiftUI (QuoteView.swift in QuotesWatch Extension, display content + author)
- [ ] T147 [P] [US3] Implement Digital Crown navigation (WKInterfaceController with crown rotation handling, navigate through quotes)
- [ ] T148 [P] [US3] Create watch complications (Modular, Graphic Circular, Graphic Corner - display quote excerpt)
- [ ] T149 [US3] Configure App Groups for data sharing between iOS app and Watch app (group.com.qpssoft.quotes)
- [ ] T150 [US3] Implement watch sync service in iOS app (sync 50 quotes to shared UserDefaults via App Groups)
- [ ] T151 [US3] Implement standalone mode (Watch app reads quotes from shared UserDefaults, functions offline)
- [ ] T152 [P] [US3] Add haptic feedback on quote transitions (WKInterfaceDevice.current().play(.click))
- [ ] T153 [US3] Implement quote rotation algorithm (same as other platforms, prevent immediate repeats)
- [ ] T154 [US3] Test on physical Apple Watch (watchOS 9+, verify complications render on multiple watch face styles)

### Android Wear Development

- [ ] T155 [US3] Open quotes-native/android/ in Android Studio
- [ ] T156 [US3] Create Wear OS module (File → New → Module → Wear OS Module, name: wear)
- [ ] T157 [P] [US3] Implement quote display composable in Jetpack Compose for Wear OS (QuoteScreen.kt, display content + author)
- [ ] T158 [P] [US3] Implement rotary input navigation (RotaryScrollableColumn with rotary event handling)
- [ ] T159 [P] [US3] Create Wear OS tiles (Quote of the day tile, timer controls tile)
- [ ] T160 [US3] Configure Wearable Data Layer for Android (add play-services-wearable dependency)
- [ ] T161 [US3] Implement watch sync service in Android app (sync 50 quotes via DataClient to Wear app)
- [ ] T162 [US3] Implement standalone mode (Wear app reads quotes from local storage, functions offline)
- [ ] T163 [P] [US3] Add vibration feedback on quote transitions (Vibrator API with short pulse pattern)
- [ ] T164 [US3] Implement quote rotation algorithm (same as other platforms using shared RotationService)
- [ ] T165 [US3] Test on physical Wear OS device (Wear OS 3+, verify tiles render correctly)

### Wearables Battery Optimization

- [ ] T166 [P] [US3] Implement battery-aware haptic intensity reduction (20% battery: reduce intensity, 10% battery: disable haptics)
- [ ] T167 [P] [US3] Implement battery-aware auto-rotation disabling (10% battery: disable auto-rotation, manual navigation still works)
- [ ] T168 [US3] Monitor battery usage on Apple Watch over 1 hour active use (target <1% battery per hour)
- [ ] T169 [US3] Monitor battery usage on Android Wear over 1 hour active use (target <1% battery per hour)

### Testing & Refinement

- [ ] T170 [US3] Test Apple Watch app on physical device (watch face complications, digital crown navigation, haptic feedback)
- [ ] T171 [US3] Test Android Wear app on physical device (tiles, rotary input, vibration feedback)
- [ ] T172 [US3] Test standalone mode on both platforms (disconnect from phone, verify 50 quotes available, manual sync works)
- [ ] T173 [US3] Test Vietnamese text rendering on wearables (verify NFC normalization, diacritics display correctly on small screens)
- [ ] T174 [US3] Test battery efficiency (active use <1% per hour on both platforms)
- [ ] T175 [US3] Fix bugs and optimize wearables UI for small screen readability

**Checkpoint**: User Story 3 complete - Wearables apps functional on Apple Watch and Android Wear with complications and standalone mode

---

## Phase 6: User Story 4 - Local Preferences Management (Priority: P3)

**Goal**: Enable personalized experience on each device with preferences (favorites, reading history, timer settings) saved locally

**Independent Test**: Favorite a quote on mobile, close app, reopen → quote still marked as favorite; change timer on desktop, restart → timer uses updated interval

**Why P3**: Users need consistent personalization on each device they use regularly (cloud sync deferred to V3+)

**Duration**: Week 5-7 (overlaps with other user stories, incremental work)

**Note**: This user story is largely implemented as part of US1, US2, US3. These tasks fill gaps and ensure completeness.

### Local Preferences Persistence (Cross-Platform)

- [ ] T176 [P] [US4] Verify NativeStorageService persists UserPreferences correctly on mobile (test favorites, timer interval, sound/haptic toggles)
- [ ] T177 [P] [US4] Verify WindowsStorageService persists UserPreferences correctly on desktop (test notification position, keyboard shortcuts)
- [ ] T178 [P] [US4] Verify MacStorageService persists UserPreferences correctly on desktop (test notification position, keyboard shortcuts)
- [ ] T179 [P] [US4] Verify watch apps persist watch-specific preferences (Apple Watch: UserDefaults, Android Wear: SharedPreferences)

### Reading History Tracking

- [ ] T180 [P] [US4] Implement reading history tracking in useQuotes hook (append quote IDs to preferences.readingHistory, max 100 items FIFO)
- [ ] T181 [US4] Display reading history in Settings screen (show last 10-20 viewed quotes with timestamps)
- [ ] T182 [US4] Implement history clearing functionality (button to clear reading history, reset readingHistory array)

### Favorites Management

- [ ] T183 [P] [US4] Verify favorites sync correctly with FavoritesScreen on mobile (add/remove favorites, persist immediately)
- [ ] T184 [US4] Add favorites count display in Settings screen (show total favorited quotes)
- [ ] T185 [US4] Implement favorites export functionality (optional: export favorites as JSON file for backup)

### Offline Preferences Management

- [ ] T186 [US4] Test offline favorites persistence on mobile (airplane mode: add favorite, close app, reopen → favorite persists)
- [ ] T187 [US4] Test offline timer changes on desktop (offline: change timer interval, restart app → new interval persists)
- [ ] T188 [US4] Test offline reading history on all platforms (verify history persists without internet connection)

### Future V3+ Cloud Sync Preparation

- [ ] T189 [P] [US4] Verify SyncState model included in UserPreferences with syncState: null (placeholder for Firebase integration)
- [ ] T190 [P] [US4] Document Firebase-compatible data structure in data-model.md (Firestore paths, document schema)
- [ ] T191 [US4] Add "Cloud Sync" toggle in Settings screen (disabled/grayed out with "Coming in V3+" label)

**Checkpoint**: User Story 4 complete - Local preferences management robust across all platforms, architecture ready for V3+ cloud sync

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements affecting multiple user stories, prepare for app store submission

**Duration**: Week 11-12 (7-10 days)

### Documentation & Code Quality

- [ ] T192 [P] Update root README.md with multi-platform overview (web, mobile, desktop, wearables), quickstart links, architecture diagram
- [ ] T193 [P] Update quotes-platform/README.md (no changes needed, Angular web app unchanged)
- [ ] T194 [P] Update quotes-native/README.md with React Native setup instructions, platform-specific notes, troubleshooting
- [ ] T195 [P] Update shared-modules/README.md with API documentation (models, services, utilities)
- [ ] T196 Code cleanup and refactoring (remove dead code, unused imports, improve naming consistency across platforms)
- [ ] T197 Run ESLint across all workspaces and fix violations (yarn lint --fix)
- [ ] T198 Run Prettier across all workspaces to ensure consistent formatting (yarn format)

### Performance Optimization

- [ ] T199 [P] Analyze mobile bundle size (iOS IPA, Android APK/AAB) and verify <50MB app size constraint
- [ ] T200 [P] Analyze desktop bundle size (Windows MSIX, macOS app) and verify <100MB installed size constraint
- [ ] T201 Optimize quote loading on mobile (lazy load quotes in chunks, cache in AsyncStorage after first load)
- [ ] T202 Optimize search performance (ensure <1s response time on all platforms with 5-10K quotes)
- [ ] T203 Profile app launch time on mobile (target <2s, optimize AsyncStorage reads, preload critical data)
- [ ] T204 Profile desktop app launch time (target <1s, optimize local storage reads)

### Accessibility & UX Polish

- [ ] T205 [P] Accessibility audit for mobile (test with TalkBack on Android, VoiceOver on iOS)
- [ ] T206 [P] Accessibility audit for desktop (keyboard navigation, screen reader support)
- [ ] T207 Add reduced motion support (respect user's system preference, disable animations if needed)
- [ ] T208 Test color contrast ratios (ensure WCAG AA compliance for Buddhist-inspired colors)
- [ ] T209 [P] Polish Buddhist aesthetic across all platforms (consistent calming colors, whitespace, serene typography)
- [ ] T210 Add loading states and error handling polish (skeleton screens, empty states, error messages)

### App Store Preparation

- [ ] T211 [P] Generate iOS app screenshots (6.5" iPhone, 5.5" iPhone - required for App Store)
- [ ] T212 [P] Generate Android app screenshots (Phone, 7" Tablet, 10" Tablet - required for Google Play)
- [ ] T213 [P] Generate Windows app screenshots for Microsoft Store
- [ ] T214 [P] Generate macOS app screenshots for Mac App Store
- [ ] T215 Write App Store description (iOS, focus on mindfulness, Buddhist wisdom, offline access)
- [ ] T216 Write Google Play description (Android, focus on native gestures, haptic feedback, offline quotes)
- [ ] T217 Write Microsoft Store description (Windows, focus on system tray, global shortcuts, work productivity)
- [ ] T218 Write Mac App Store description (macOS, focus on menu bar app, seamless integration)
- [ ] T219 [P] Select app store keywords for discoverability (Buddhist, meditation, mindfulness, quotes, wisdom, offline, Vietnamese)
- [ ] T220 [P] Create app store preview videos (optional but recommended, 30-second demo of key features)

### Build & Deployment

- [ ] T221 Setup Expo Application Services (EAS) account for mobile builds (configure eas.json)
- [ ] T222 Build iOS release IPA using EAS (`eas build --platform ios --profile production`)
- [ ] T223 Build Android release APK/AAB using EAS (`eas build --platform android --profile production`)
- [ ] T224 Build Windows release MSIX package (`npx react-native run-windows --release`)
- [ ] T225 Build macOS release app bundle (`npx react-native run-macos --release`)
- [ ] T226 [P] Test iOS release build on physical device (install IPA via TestFlight, verify all features work)
- [ ] T227 [P] Test Android release build on physical device (install APK via adb or Google Play Internal Testing, verify all features work)
- [ ] T228 [P] Test Windows release build on Windows 10/11 (install MSIX, verify all features work)
- [ ] T229 [P] Test macOS release build on macOS 13+ (install app, verify all features work)

### App Store Submission

- [ ] T230 Submit iOS app to App Store Connect (upload IPA, fill app listing, submit for review)
- [ ] T231 Submit Android app to Google Play Console (upload AAB, fill app listing, submit for review)
- [ ] T232 Submit Windows app to Microsoft Partner Center (upload MSIX, fill app listing, submit for review)
- [ ] T233 Submit macOS app to Mac App Store (upload via Xcode, fill app listing, submit for review)
- [ ] T234 Monitor app review status and respond to any rejection feedback (typical review time: 1-3 days iOS, 1-7 days Android, 1-7 days Windows/macOS)

### Launch Preparation

- [ ] T235 [P] Create launch announcement (blog post, social media content, Buddhist communities outreach)
- [ ] T236 [P] Setup analytics tracking (optional: Firebase Analytics, Mixpanel, or privacy-friendly alternative)
- [ ] T237 [P] Setup crash reporting (optional: Sentry, Firebase Crashlytics for production monitoring)
- [ ] T238 Plan beta testing program (TestFlight for iOS, Google Play Beta for Android, 10+ beta testers per platform)
- [ ] T239 Prepare support channels (GitHub Issues, email support, FAQ documentation)

**Checkpoint**: Multi-platform app ready for app store launch across iOS, Android, Windows, macOS, Apple Watch, Android Wear

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKS all user stories
    ↓
    ├─→ Phase 3 (US1: Mobile) ← MVP, can start immediately after Phase 2
    ├─→ Phase 4 (US2: Desktop) ← Requires US1 complete (bare workflow dependency)
    ├─→ Phase 5 (US3: Wearables) ← Requires US1 complete (mobile app as sync source)
    └─→ Phase 6 (US4: Preferences) ← Incremental, overlaps with US1-US3
    ↓
Phase 7 (Polish & App Store Submission)
```

### User Story Dependencies

- **US1 (Mobile)**: Can start immediately after Phase 2 - No dependencies on other stories
- **US2 (Desktop)**: Depends on US1 complete (requires bare workflow ejection)
- **US3 (Wearables)**: Depends on US1 complete (mobile app syncs quotes to watch)
- **US4 (Preferences)**: Largely implemented within US1-US3, final verification tasks

### Critical Path

**Shortest path to MVP (Mobile Only)**:
1. Phase 1: Setup (Week 1) → 25 tasks
2. Phase 2: Foundational (Week 1-2) → 39 tasks
3. Phase 3: User Story 1 (Week 2-5) → 42 tasks
4. Phase 7: Polish & Submit Mobile Only (Week 6-7) → ~20 tasks
**Total: ~126 tasks, 7 weeks to mobile MVP launch**

**Full Multi-Platform Release**:
1. Phase 1-2: Setup + Foundational (Week 1-2) → 64 tasks
2. Phase 3: US1 Mobile (Week 2-5) → 42 tasks
3. Phase 4: US2 Desktop (Week 6-8) → 37 tasks
4. Phase 5: US3 Wearables (Week 9-11) → 32 tasks
5. Phase 6: US4 Preferences (overlaps) → 16 tasks
6. Phase 7: Polish & Submit All (Week 11-12) → 48 tasks
**Total: 239 tasks, 12 weeks to full multi-platform launch**

### Parallel Opportunities

**Within Phase 1 (Setup)**: All tasks marked [P] can run in parallel
- T002, T003 (root config)
- T005-T008 (models in parallel)
- T010-T014 (service interfaces in parallel)
- T016-T018 (utilities in parallel)
- T021-T023 (tests in parallel)

**Within Phase 2 (Foundational)**: All tasks marked [P] can run in parallel
- T030-T031, T037-T038 (config in parallel)
- T040-T044 (assets in parallel)
- T050, T055, T059 (service tests in parallel)

**Across User Stories**: Once Phase 2 completes, US1 and US4 can start in parallel (US4 is incremental)

**Recommended Team Strategy (3 developers)**:
- Week 1-2: All 3 devs → Setup + Foundational (establish foundation together)
- Week 2-5: Dev A → US1 Mobile, Dev B → US4 Preferences (incremental), Dev C → Shared module refinements
- Week 6-8: Dev A → US2 Desktop (after ejection), Dev B → Polish US1, Dev C → Documentation
- Week 9-11: Dev A → US3 Wearables, Dev B → US2 Desktop polish, Dev C → App store prep
- Week 11-12: All 3 devs → Polish & Submission

---

## Implementation Strategy

### MVP First (Mobile Only - Recommended)

**Goal**: Validate mobile platform value with users before investing in desktop/wearables

1. ✅ Complete Phase 1: Setup (Week 1)
2. ✅ Complete Phase 2: Foundational (Week 1-2) - BLOCKS all stories
3. ✅ Complete Phase 3: User Story 1 - Mobile (Week 2-5)
4. ✅ Complete Phase 6: User Story 4 - Preferences (subset, mobile only)
5. ✅ Complete Phase 7: Polish & Submit (mobile only subset)
6. **STOP and VALIDATE**: Deploy to TestFlight/Google Play Beta, gather user feedback (2-4 weeks)
7. If validated → proceed to desktop and wearables
8. If not validated → pivot or iterate on mobile

**Benefits**: Fastest time to user feedback, validates multi-platform architecture, smaller scope for first release

### Incremental Delivery (Platform by Platform)

**Goal**: Deliver value incrementally, validate each platform before next

1. Week 1-7: Mobile MVP (Phase 1-3 + US4 subset + Polish subset) → Launch iOS & Android
2. Week 8-10: Desktop (Phase 4 + US4 desktop) → Launch Windows & macOS
3. Week 11-13: Wearables (Phase 5 + US4 wearables) → Launch Apple Watch & Android Wear
4. Week 14: Final polish across all platforms → Update all apps with refinements

**Benefits**: Each platform validated before next, user feedback incorporated iteratively, manageable scope per release

### Full Multi-Platform Launch (Parallel Teams)

**Goal**: Launch all platforms simultaneously (requires 3+ developers)

1. Week 1-2: All devs → Setup + Foundational (foundation for all platforms)
2. Week 2-5: Dev A → Mobile, Dev B → Desktop (start after ejection Week 3), Dev C → Shared/US4
3. Week 6-8: Dev A → Wearables (iOS), Dev B → Wearables (Android), Dev C → Polish all
4. Week 9-10: All devs → Final polish, testing, app store submission
5. Week 11-12: App store review, launch coordination

**Benefits**: All platforms launch together, maximum impact, unified marketing, but higher risk and coordination complexity

---

## Success Criteria Verification

### Phase 3 (US1: Mobile) Verification Checklist

**Acceptance Scenarios from spec.md**:
- [x] T100-T101: Installed app opens without internet, all quotes available
- [x] T071, T084: Swipe up/down scrolls smoothly with native FlatList rendering
- [x] T078-T079: Swipe left/right navigates quotes with native gesture animation (or Next button)
- [x] T076-T077: Tap Play → auto-rotation starts with haptic feedback every 15s (configurable)

**Success Criteria from spec.md**:
- [x] SC-001: Search response <1s (verify T082-T084)
- [x] SC-002: App launch <2s mobile (verify T105)
- [x] SC-004: Random quote from cache <100ms (verify T065, T076)
- [x] SC-006: Native gestures recognized (verify T071, T078)
- [x] SC-007: Function offline 30+ days (verify T103)

### Phase 4 (US2: Desktop) Verification Checklist

**Acceptance Scenarios from spec.md**:
- [x] T117, T128: Desktop app appears in menu bar (macOS) or system tray (Windows)
- [x] T117, T128: Click menu bar icon → quote display window appears
- [x] T118, T129: Press global shortcut (Ctrl+C or Ctrl+X) → quote notification appears in configured position
- [x] T118, T129: Press next quote shortcut (Ctrl+V or Ctrl+N) → next random quote appears
- [x] T121, T132: Enable auto-launch → app starts on restart in menu bar

**Success Criteria from spec.md**:
- [x] SC-001: Search response <1s desktop (verify shared SearchService)
- [x] SC-002: Desktop launch <1s (verify T204)
- [x] SC-006: Keyboard shortcuts work (verify T118, T129, T136)

### Phase 5 (US3: Wearables) Verification Checklist

**Acceptance Scenarios from spec.md**:
- [x] T148, T159: Add quote complication to watch face → current quote text displayed
- [x] T147, T158: Rotate digital crown/bezel → navigate through quotes
- [x] T152, T163: Auto-rotation enabled → gentle haptic pulse on new quote (no audio)
- [x] T151, T162: Away from phone → watch app functions in standalone mode with 50 synced quotes

**Success Criteria from spec.md**:
- [x] SC-001: Search response <1s wearables (verify shared SearchService)
- [x] SC-002: Complication update <500ms (verify T148, T159)
- [x] SC-006: Complications render on all watch face styles (verify T154, T165)
- [x] SC-008: Battery <1% per hour active use (verify T168-T169)

### Phase 6 (US4: Preferences) Verification Checklist

**Acceptance Scenarios from spec.md**:
- [x] T176-T179: Favorite quote, close app, reopen → quote marked as favorite
- [x] T176-T179: Change timer interval, restart app → timer uses updated interval
- [x] T186: Offline, favorite quote → persists in local storage
- [x] T180-T181: Read 10 quotes, check reading history → shows all 10 quotes from this device

**Success Criteria from spec.md**:
- [x] SC-009: User preferences persist with 100% reliability (verify T176-T179, T186-T188)

---

## Notes

- **[P] tasks**: Different files, no dependencies, can parallelize
- **[Story] label**: Maps task to specific user story for traceability
- **Independent user stories**: Each story (US1-US4) can be tested independently after Foundational phase
- **Verify tests fail before implementing**: If tests included, write tests first, ensure red → green workflow
- **Commit frequently**: After each task or logical group for easy rollback
- **Stop at checkpoints**: Validate each story independently before moving to next priority
- **Avoid cross-story dependencies**: Keep stories independent for parallel development and incremental delivery

---

## Total Task Count by Phase

- **Phase 1 (Setup)**: 25 tasks
- **Phase 2 (Foundational)**: 39 tasks
- **Phase 3 (US1: Mobile)**: 42 tasks
- **Phase 4 (US2: Desktop)**: 37 tasks
- **Phase 5 (US3: Wearables)**: 32 tasks
- **Phase 6 (US4: Preferences)**: 16 tasks
- **Phase 7 (Polish & Launch)**: 48 tasks

**Grand Total**: 239 tasks across 12 weeks (estimated 8-12 weeks actual duration with parallel work)

---

**Next Action**: Begin Phase 1 Task T001 - Create monorepo package.json at repository root

````
