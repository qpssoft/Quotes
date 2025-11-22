# Tasks: Azure Cloud Backend with Clean Architecture

**Input**: Design documents from `/specs/004-azure-backend/`
**Prerequisites**: plan.md, spec.md (6 user stories with priorities P1-P5)

**Tests**: Tests are OPTIONAL per specification. Unit tests recommended for backend (xUnit), integration tests for Azure services, E2E tests optional for Admin Center (Playwright).

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US6)
- Include exact file paths in descriptions

## Path Conventions

- **Backend (C# .NET 8)**: `quotes-backend/src/Quotes.Core/`, `quotes-backend/src/Quotes.Application/`, `quotes-backend/src/Quotes.Infrastructure/`, `quotes-backend/src/Quotes.Functions/`
- **Admin Center (React)**: `quotes-admin/src/components/`, `quotes-admin/src/pages/`, `quotes-admin/src/services/`
- **Infrastructure (Bicep)**: `infrastructure/main.bicep`, `infrastructure/modules/`
- **Tests**: `quotes-backend/tests/`, `quotes-admin/src/__tests__/`
- **Client Integration**: `quotes-platform/`, `quotes-native/`, `quotes-electron/` (existing)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, Azure infrastructure, development environment

- [ ] T001 Create Azure subscription and Resource Group (quotes-backend-rg) in target region
- [ ] T002 Configure Azure AD B2C tenant (quotesbackend.onmicrosoft.com) via Azure Portal
- [ ] T003 [P] Register OAuth apps: Google Cloud Console (Client ID, Secret)
- [ ] T004 [P] Register OAuth apps: Facebook Developers (App ID, Secret)
- [ ] T005 [P] Register OAuth apps: Microsoft Azure AD (Client ID, Secret)
- [ ] T006 Configure Azure AD B2C social identity providers (Google, Facebook, Microsoft)
- [ ] T007 Create Azure Key Vault (quotes-backend-kv) and grant admin access
- [ ] T008 [P] Store OAuth secrets in Key Vault (GoogleClientSecret, FacebookAppSecret, MicrosoftClientSecret)
- [ ] T009 Initialize C# solution: `dotnet new sln -n Quotes.Backend` in quotes-backend/
- [ ] T010 [P] Create Quotes.Core project: `dotnet new classlib -n Quotes.Core` in quotes-backend/src/
- [ ] T011 [P] Create Quotes.Application project: `dotnet new classlib -n Quotes.Application` in quotes-backend/src/
- [ ] T012 [P] Create Quotes.Infrastructure project: `dotnet new classlib -n Quotes.Infrastructure` in quotes-backend/src/
- [ ] T013 [P] Create Quotes.Functions project: `dotnet new func -n Quotes.Functions` in quotes-backend/src/
- [ ] T014 Configure project references: Functions → Infrastructure → Application → Core
- [ ] T015 Add NuGet packages: Azure.Storage.Blobs, Microsoft.Identity.Web, Azure.Security.KeyVault.Secrets, Azure.ApplicationInsights
- [ ] T016 Initialize React Admin Center: `npx create-react-app quotes-admin --template typescript`
- [ ] T017 [P] Install Admin Center dependencies: Material-UI, React Router, Axios
- [ ] T018 [P] Create infrastructure/ directory and initialize Bicep module structure
- [ ] T019 [P] Setup GitHub Actions workflows: backend-ci.yml, admin-ci.yml, infrastructure-ci.yml in .github/workflows/
- [ ] T020 Install development tools: .NET 8 SDK, Azure Functions Core Tools, Azure CLI, Bicep CLI, Node.js 20+

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend services, authentication, Bicep infrastructure

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Infrastructure as Code (Bicep)

- [ ] T021 [P] Create main.bicep with parameters for environment (dev/staging/production)
- [ ] T022 [P] Create resourceGroup.bicep module in infrastructure/modules/
- [ ] T023 [P] Create storageAccount.bicep module (Blob containers: quotes, users)
- [ ] T024 [P] Create keyVault.bicep module with access policies for Function App managed identity
- [ ] T025 [P] Create appConfiguration.bicep module for environment settings
- [ ] T026 [P] Create applicationInsights.bicep module for logging/monitoring
- [ ] T027 [P] Create functionApp.bicep module (consumption plan, managed identity)
- [ ] T028 [P] Create staticWebApp.bicep module for Admin Center hosting
- [ ] T029 Create parameter files: dev.parameters.json, staging.parameters.json, production.parameters.json in infrastructure/parameters/
- [ ] T030 Deploy Bicep to dev environment: `az deployment sub create --location eastus --template-file main.bicep --parameters dev.parameters.json`
- [ ] T031 Verify all Azure resources created: Storage, Key Vault, App Configuration, Functions, Static Web App, Application Insights

### Core Layer (Entities)

- [ ] T032 [P] Create Quote entity in quotes-backend/src/Quotes.Core/Entities/Quote.cs (id, content, author, category, tags, language, type, createdAt, createdBy, isPublic)
- [ ] T033 [P] Create User entity in quotes-backend/src/Quotes.Core/Entities/User.cs (id, email, name, profilePicture, provider, role, createdAt, lastLogin, isActive)
- [ ] T034 [P] Create Category entity in quotes-backend/src/Quotes.Core/Entities/Category.cs (id, nameVi, nameEn, description, icon)
- [ ] T035 [P] Create UserQuoteSubmission entity in quotes-backend/src/Quotes.Core/Entities/UserQuoteSubmission.cs (id, quoteId, userId, status, submittedAt, reviewedAt, reviewedBy, rejectionReason)
- [ ] T036 [P] Create AuditLog entity in quotes-backend/src/Quotes.Core/Entities/AuditLog.cs (id, userId, action, targetId, targetType, timestamp, details)
- [ ] T037 [P] Create IQuoteRepository interface in quotes-backend/src/Quotes.Core/Interfaces/IQuoteRepository.cs
- [ ] T038 [P] Create IUserRepository interface in quotes-backend/src/Quotes.Core/Interfaces/IUserRepository.cs
- [ ] T039 [P] Create IEmailService interface in quotes-backend/src/Quotes.Core/Interfaces/IEmailService.cs

### Infrastructure Layer (Azure Integrations)

- [ ] T040 Create BlobQuoteRepository in quotes-backend/src/Quotes.Infrastructure/Repositories/BlobQuoteRepository.cs (GetAllAsync, GetByIdAsync, AddAsync, UpdateAsync, DeleteAsync)
- [ ] T041 Create BlobUserRepository in quotes-backend/src/Quotes.Infrastructure/Repositories/BlobUserRepository.cs (GetAllAsync, GetByIdAsync, UpdateAsync)
- [ ] T042 [P] Implement Key Vault integration in quotes-backend/src/Quotes.Infrastructure/Configuration/KeyVaultConfigurationProvider.cs (managed identity)
- [ ] T043 [P] Implement SendGrid email service in quotes-backend/src/Quotes.Infrastructure/Email/SendGridEmailService.cs (SendNotificationAsync)
- [ ] T044 [P] Implement Azure AD B2C authentication middleware in quotes-backend/src/Quotes.Infrastructure/Auth/AzureAdB2CAuthService.cs (JWT validation)
- [ ] T045 [P] Implement MemoryCacheService in quotes-backend/src/Quotes.Infrastructure/Caching/MemoryCacheService.cs (5-minute TTL)
- [ ] T046 Configure Application Insights telemetry in quotes-backend/src/Quotes.Infrastructure/Logging/ApplicationInsightsTelemetry.cs

### Application Layer (Use Cases)

- [ ] T047 [P] Create GetAllQuotesUseCase in quotes-backend/src/Quotes.Application/UseCases/GetAllQuotesUseCase.cs (with filtering by category, language, author)
- [ ] T048 [P] Create GetQuoteByIdUseCase in quotes-backend/src/Quotes.Application/UseCases/GetQuoteByIdUseCase.cs
- [ ] T049 [P] Create SubmitUserQuoteUseCase in quotes-backend/src/Quotes.Application/UseCases/SubmitUserQuoteUseCase.cs (validation, email notification)
- [ ] T050 [P] Create ApproveQuoteUseCase in quotes-backend/src/Quotes.Application/UseCases/ApproveQuoteUseCase.cs (move to public collection)
- [ ] T051 [P] Create RejectQuoteUseCase in quotes-backend/src/Quotes.Application/UseCases/RejectQuoteUseCase.cs (delete from user collection)
- [ ] T052 [P] Create ManageUserUseCase in quotes-backend/src/Quotes.Application/UseCases/ManageUserUseCase.cs (assign role, ban, delete)
- [ ] T053 [P] Create DTOs: QuoteDto, UserDto, CreateQuoteDto, UpdateQuoteDto in quotes-backend/src/Quotes.Application/DTOs/

### Presentation Layer (Azure Functions)

- [ ] T054 Configure Startup.cs in quotes-backend/src/Quotes.Functions/Startup.cs (dependency injection, Key Vault, Application Insights)
- [ ] T055 Create QuotesFunction in quotes-backend/src/Quotes.Functions/QuotesFunction.cs (GET /api/v1/quotes, GET /api/v1/quotes/{id})
- [ ] T056 [P] Implement rate limiting middleware in quotes-backend/src/Quotes.Functions/Middleware/RateLimitingMiddleware.cs (100/500/1000 req/min per user/IP)
- [ ] T057 [P] Implement CORS configuration in quotes-backend/src/Quotes.Functions/Startup.cs (localhost, GitHub Pages, Electron, React Native)
- [ ] T058 [P] Configure Swagger/OpenAPI in quotes-backend/src/Quotes.Functions/Startup.cs (Swashbuckle)
- [ ] T059 Configure host.json and local.settings.json with Key Vault references
- [ ] T060 Deploy Functions App to dev environment and verify health endpoint

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Anonymous Quote Access via API (Priority: P1) 🎯 MVP

**Goal**: Public API endpoint for fetching quotes (all quotes, filtered quotes, single quote) without authentication

**Independent Test**: Make HTTP GET request to `/api/v1/quotes` and verify 200 OK response with JSON array of quotes

### Implementation for User Story 1

- [ ] T061 [P] [US1] Implement GET /api/v1/quotes endpoint in quotes-backend/src/Quotes.Functions/QuotesFunction.cs (calls GetAllQuotesUseCase)
- [ ] T062 [P] [US1] Implement GET /api/v1/quotes?category={category}&language={lang}&author={author} query parameter handling
- [ ] T063 [P] [US1] Implement GET /api/v1/quotes/{id} endpoint in quotes-backend/src/Quotes.Functions/QuotesFunction.cs (calls GetQuoteByIdUseCase)
- [ ] T064 [US1] Add memory caching to GetAllQuotesUseCase (5-minute TTL, cache key by language)
- [ ] T065 [US1] Add rate limiting to anonymous requests (100 req/min per IP address)
- [ ] T066 [US1] Add CORS headers for client origins (localhost, GitHub Pages, Electron, React Native)
- [ ] T067 [US1] Add Application Insights logging for quote retrieval (request ID, duration, result count)
- [ ] T068 [P] [US1] Upload seed data (data_vi.json, data_en.json) to Azure Blob Storage quotes container
- [ ] T069 [US1] Test quote retrieval: curl https://<function-app>.azurewebsites.net/api/v1/quotes
- [ ] T070 [US1] Test filtering: curl "https://<function-app>.azurewebsites.net/api/v1/quotes?category=wisdom&language=vi"
- [ ] T071 [US1] Test single quote: curl https://<function-app>.azurewebsites.net/api/v1/quotes/{id}
- [ ] T072 [US1] Verify rate limiting: exceed 100 requests/min, expect 429 Too Many Requests
- [ ] T073 [US1] Verify response time: 95% of requests <500ms via Application Insights

**Checkpoint**: User Story 1 complete and independently testable. MVP functional.

---

## Phase 4: User Story 2 - User Authentication with Social Providers (Priority: P2)

**Goal**: OAuth 2.0 authentication (Google, Facebook, Microsoft) with JWT token issuance

**Independent Test**: Click "Sign in with Google" and verify JWT token storage and user profile retrieval

### Implementation for User Story 2

- [ ] T074 [P] [US2] Configure Azure AD B2C user flows (sign-up-sign-in) via Azure Portal
- [ ] T075 [P] [US2] Create AuthFunction in quotes-backend/src/Quotes.Functions/AuthFunction.cs (GET /api/v1/auth/login, POST /api/v1/auth/callback)
- [ ] T076 [US2] Implement JWT validation middleware in quotes-backend/src/Quotes.Infrastructure/Auth/JwtValidationMiddleware.cs (validate signature, claims, expiration)
- [ ] T077 [US2] Implement GET /api/v1/users/me endpoint in quotes-backend/src/Quotes.Functions/UsersFunction.cs (returns user profile from JWT)
- [ ] T078 [P] [US2] Create user profile on first login (store in Blob Storage users/{userId}.json)
- [ ] T079 [P] [US2] Implement token refresh logic in AuthFunction (POST /api/v1/auth/refresh)
- [ ] T080 [P] [US2] Implement logout endpoint in AuthFunction (POST /api/v1/auth/logout, clears token)
- [ ] T081 [US2] Add rate limiting to authenticated requests (500 req/min per user ID from JWT)
- [ ] T082 [US2] Add Application Insights logging for authentication events (provider, success/failure, user ID)
- [ ] T083 [P] [US2] Update Admin Center with OAuth login buttons (Google, Facebook, Microsoft) in quotes-admin/src/components/Login.tsx
- [ ] T084 [P] [US2] Implement authService in quotes-admin/src/services/authService.ts (login, logout, getToken, getUser)
- [ ] T085 [P] [US2] Create useAuth hook in quotes-admin/src/hooks/useAuth.ts (manages auth state)
- [ ] T086 [US2] Test Google OAuth flow: sign in, verify JWT token, verify user profile retrieval
- [ ] T087 [US2] Test Facebook OAuth flow: sign in, verify JWT token
- [ ] T088 [US2] Test Microsoft OAuth flow: sign in, verify JWT token
- [ ] T089 [US2] Test token persistence: close/reopen app, verify still logged in
- [ ] T090 [US2] Test token expiration: wait 1 hour, verify re-authentication prompt
- [ ] T091 [US2] Test logout: click logout, verify token cleared, redirected to homepage

**Checkpoint**: User Stories 1 AND 2 both work independently. Authentication functional.

---

## Phase 5: User Story 6 - Client Data Synchronization (Priority: P2)

**Goal**: Automatic quote data sync from Azure API when online, offline-first functionality

**Independent Test**: Open client app online, verify latest quotes fetched, go offline, verify cached quotes accessible

### Implementation for User Story 6

- [ ] T092 [P] [US6] Add Last-Modified header to quote responses in QuotesFunction.cs
- [ ] T093 [P] [US6] Implement sync endpoint GET /api/v1/quotes/sync with If-Modified-Since support
- [ ] T094 [P] [US6] Create sync service in quotes-platform/src/app/services/sync.service.ts (Angular web client)
- [ ] T095 [P] [US6] Create sync service in quotes-native/src/services/syncService.ts (React Native mobile client)
- [ ] T096 [P] [US6] Create sync service in quotes-electron/src/services/syncService.ts (Electron desktop client)
- [ ] T097 [US6] Implement online/offline detection in Angular (navigator.onLine + online/offline events)
- [ ] T098 [US6] Implement online/offline detection in React Native (NetInfo)
- [ ] T099 [US6] Implement online/offline detection in Electron (navigator.onLine)
- [ ] T100 [US6] Implement sync on app launch (Angular app.component.ts, React Native App.tsx, Electron main.ts)
- [ ] T101 [US6] Implement sync on connection restore (online event listener)
- [ ] T102 [P] [US6] Update localStorage caching in Angular (IndexedDB for large datasets)
- [ ] T103 [P] [US6] Update AsyncStorage caching in React Native
- [ ] T104 [P] [US6] Update electron-store caching in Electron
- [ ] T105 [US6] Add sync status notifications in Angular (snackbar: "Updated 5 new quotes")
- [ ] T106 [US6] Add sync status notifications in React Native (Toast)
- [ ] T107 [US6] Add sync status notifications in Electron (notification API)
- [ ] T108 [US6] Test Angular sync: open app online, verify quotes fetched, go offline, verify cached quotes accessible
- [ ] T109 [US6] Test React Native sync: open app online, verify quotes fetched, go offline, verify cached quotes accessible
- [ ] T110 [US6] Test Electron sync: open app online, verify quotes fetched, go offline, verify cached quotes accessible
- [ ] T111 [US6] Test first launch offline: verify bundled default quotes displayed with "Connect to sync latest quotes" message
- [ ] T112 [US6] Verify backward compatibility: ensure Quote JSON structure unchanged (id, content, author, category, tags, type)

**Checkpoint**: User Stories 1, 2, AND 6 all work independently. Client integration functional.

---

## Phase 6: User Story 3 - User Quote Submission (Priority: P3)

**Goal**: Authenticated users can submit quotes to personal collection

**Independent Test**: Log in, submit quote, verify it appears in "My Quotes" and triggers admin email

### Implementation for User Story 3

- [ ] T113 [P] [US3] Create QuoteSubmissionFunction in quotes-backend/src/Quotes.Functions/QuoteSubmissionFunction.cs (POST /api/v1/quotes)
- [ ] T114 [US3] Implement quote validation in SubmitUserQuoteUseCase (500 char content, 100 char author, return 400 Bad Request on failure)
- [ ] T115 [US3] Implement JWT authentication check (401 Unauthorized if missing/invalid token)
- [ ] T116 [US3] Extract userId from JWT claims in SubmitUserQuoteUseCase
- [ ] T117 [US3] Write quote to Blob Storage quotes/{userId}_data.json (append to array or create new file)
- [ ] T118 [US3] Trigger email notification to quangphamsoftvn@gmail.com via SendGridEmailService (include content, author, submitter name, Admin Center moderation link)
- [ ] T119 [US3] Return 201 Created with quote ID in response
- [ ] T120 [US3] Add Application Insights logging for quote submission (userId, quoteId, success/failure)
- [ ] T121 [P] [US3] Create GET /api/v1/users/me/quotes endpoint in UsersFunction.cs (returns user's personal quotes from {userId}_data.json)
- [ ] T122 [US3] Implement rate limiting for authenticated users (500 req/min per user ID)
- [ ] T123 [P] [US3] Create QuoteSubmissionForm component in quotes-admin/src/components/QuoteSubmissionForm.tsx (content, author, category inputs)
- [ ] T124 [P] [US3] Create MyQuotesPage in quotes-admin/src/pages/MyQuotesPage.tsx (displays user's submitted quotes)
- [ ] T125 [US3] Implement quote submission in quotesApi.ts (POST /api/v1/quotes with JWT Authorization header)
- [ ] T126 [US3] Test quote submission: log in, submit quote with valid data, verify 201 Created
- [ ] T127 [US3] Test validation: submit quote with content >500 chars, verify 400 Bad Request with error message
- [ ] T128 [US3] Test authentication: submit quote without JWT, verify 401 Unauthorized
- [ ] T129 [US3] Test "My Quotes" retrieval: log in, submit quote, refresh, verify quote persists
- [ ] T130 [US3] Test email notification: submit quote, verify email received at quangphamsoftvn@gmail.com with correct content
- [ ] T131 [US3] Test unauthenticated access: try to access quote submission form without login, verify redirected to login page

**Checkpoint**: User Stories 1, 2, 3, AND 6 all work independently. Quote submission functional.

---

## Phase 7: User Story 4 - Admin Quote Management (Priority: P4)

**Goal**: Admin Center for moderating user-submitted quotes (approve, reject, edit, delete)

**Independent Test**: Log in as admin, approve user-submitted quote, verify it moves to public collection

### Implementation for User Story 4

- [ ] T132 [P] [US4] Create QuoteManagementFunction in quotes-backend/src/Quotes.Functions/QuoteManagementFunction.cs (PUT /api/v1/quotes/{id}, DELETE /api/v1/quotes/{id})
- [ ] T133 [US4] Implement admin role check in QuoteManagementFunction (verify JWT role claim = "Admin", return 403 Forbidden if not)
- [ ] T134 [US4] Implement ApproveQuoteUseCase (move quote from {userId}_data.json to data_vi.json or data_en.json based on language)
- [ ] T135 [US4] Implement RejectQuoteUseCase (delete quote from {userId}_data.json, optionally send rejection email to user)
- [ ] T136 [US4] Implement UpdateQuoteUseCase (edit content/author/category in Blob Storage file)
- [ ] T137 [US4] Implement DeleteQuoteUseCase (delete quote from Blob Storage file)
- [ ] T138 [US4] Add audit logging for admin actions (Application Insights custom events: QUOTE_APPROVED, QUOTE_REJECTED, QUOTE_EDITED, QUOTE_DELETED)
- [ ] T139 [US4] Add rate limiting for admin users (1000 req/min per user ID)
- [ ] T140 [P] [US4] Create GET /api/v1/admin/submissions endpoint in QuoteManagementFunction.cs (returns all pending user-submitted quotes)
- [ ] T141 [P] [US4] Create Dashboard component in quotes-admin/src/pages/Dashboard.tsx (overview of public quotes, user-submitted quotes, stats)
- [ ] T142 [P] [US4] Create QuotesPage component in quotes-admin/src/pages/QuotesPage.tsx (manage all public quotes)
- [ ] T143 [P] [US4] Create SubmissionsPage component in quotes-admin/src/pages/SubmissionsPage.tsx (moderate user-submitted quotes)
- [ ] T144 [P] [US4] Create QuoteList component in quotes-admin/src/components/QuoteList.tsx (displays quotes with pagination, search, filtering)
- [ ] T145 [P] [US4] Create QuoteEditor component in quotes-admin/src/components/QuoteEditor.tsx (edit quote form with content, author, category)
- [ ] T146 [P] [US4] Create Layout component in quotes-admin/src/components/Layout.tsx (navigation sidebar, header, responsive)
- [ ] T147 [US4] Implement quotesApi.ts functions: approveQuote, rejectQuote, updateQuote, deleteQuote, getSubmissions
- [ ] T148 [US4] Setup React Router routes in quotes-admin/src/App.tsx (/admin/quotes, /admin/users, /admin/submissions)
- [ ] T149 [US4] Deploy Admin Center to Azure Static Web App (dev environment)
- [ ] T150 [US4] Test admin login: log in with admin account, verify access to Admin Center
- [ ] T151 [US4] Test non-admin access: log in with regular user, verify 403 Forbidden when accessing Admin Center
- [ ] T152 [US4] Test quote approval: view pending submission, click "Approve", verify quote moves to data_vi.json or data_en.json
- [ ] T153 [US4] Test quote rejection: view pending submission, click "Reject", verify quote deleted from {userId}_data.json
- [ ] T154 [US4] Test quote editing: view any quote, edit content/author/category, save, verify changes persisted in Blob Storage
- [ ] T155 [US4] Test quote deletion: view any quote, click "Delete", confirm, verify quote permanently removed
- [ ] T156 [US4] Test pagination: load 10,000+ quotes, verify page load time <2 seconds
- [ ] T157 [US4] Verify audit logs: check Application Insights for admin action events (QUOTE_APPROVED, etc.)

**Checkpoint**: User Stories 1, 2, 3, 4, AND 6 all work independently. Admin moderation functional.

---

## Phase 8: User Story 5 - Admin User Management (Priority: P5)

**Goal**: Admin can manage user accounts (view, assign roles, ban, delete)

**Independent Test**: Log in as admin, assign "Contributor" role to user, verify they can now submit quotes

### Implementation for User Story 5

- [ ] T158 [P] [US5] Create GET /api/v1/admin/users endpoint in UsersFunction.cs (returns all registered users from Blob Storage users/)
- [ ] T159 [P] [US5] Create PUT /api/v1/admin/users/{id} endpoint in UsersFunction.cs (assign role: Authenticated, Contributor, Admin)
- [ ] T160 [P] [US5] Create DELETE /api/v1/admin/users/{id} endpoint in UsersFunction.cs (ban user: set isActive = false, or delete user + all their quotes)
- [ ] T161 [US5] Implement admin role check (verify JWT role = "Admin", return 403 Forbidden if not)
- [ ] T162 [US5] Implement ManageUserUseCase for role assignment (update user role in Blob Storage users/{userId}.json)
- [ ] T163 [US5] Implement ManageUserUseCase for user ban (update isActive flag, invalidate JWT on next request)
- [ ] T164 [US5] Implement ManageUserUseCase for user deletion (delete users/{userId}.json and quotes/{userId}_data.json)
- [ ] T165 [US5] Add audit logging for user management actions (Application Insights: USER_ROLE_ASSIGNED, USER_BANNED, USER_DELETED)
- [ ] T166 [P] [US5] Create UsersPage component in quotes-admin/src/pages/UsersPage.tsx (list all users with email, name, registration date, role)
- [ ] T167 [P] [US5] Create UserList component in quotes-admin/src/components/UserList.tsx (displays users with pagination, search)
- [ ] T168 [P] [US5] Create UserEditor component in quotes-admin/src/components/UserEditor.tsx (assign role dropdown, ban/delete buttons)
- [ ] T169 [US5] Implement usersApi.ts functions: getUsers, assignRole, banUser, deleteUser
- [ ] T170 [US5] Test user list retrieval: log in as admin, view "User Management", verify all users displayed
- [ ] T171 [US5] Test role assignment: assign "Contributor" role to user, log in as that user, verify can submit quotes
- [ ] T172 [US5] Test admin role assignment: assign "Admin" role to user, log in as that user, verify access to Admin Center
- [ ] T173 [US5] Test user ban: click "Ban User", verify user cannot authenticate (401 Unauthorized)
- [ ] T174 [US5] Test user deletion: click "Delete User", confirm, verify user account and all their quotes permanently deleted
- [ ] T175 [US5] Verify audit logs: check Application Insights for user management events (USER_ROLE_ASSIGNED, etc.)

**Checkpoint**: All 6 user stories work independently. Full backend system functional.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final testing, optimization, documentation, production deployment

- [ ] T176 [P] Update README.md with feature overview, architecture diagram, setup instructions
- [ ] T177 [P] Write deployment guide in docs/deployment.md (Bicep deployment steps, Key Vault setup, Azure AD B2C configuration)
- [ ] T178 [P] Write client integration guide in docs/client-integration.md (API endpoints, authentication flow, TypeScript SDK examples)
- [ ] T179 [P] Write quickstart.md for local development (prerequisites, running Functions locally, running Admin Center locally)
- [ ] T180 Code cleanup: remove dead code, ensure consistent naming, refactor duplicated logic
- [ ] T181 Performance optimization: verify Blob Storage caching (5-minute TTL), analyze Application Insights metrics, tune rate limits
- [ ] T182 [P] Load testing with k6: simulate 1000 concurrent users, verify 95% of requests <500ms, zero errors
- [ ] T183 [P] Security scan: run GitHub secret scanning, Azure DevOps credential scanner, verify zero exposed secrets
- [ ] T184 Verify all secrets in Key Vault: OAuth secrets, storage connection strings, SendGrid API key, Application Insights key
- [ ] T185 [P] Unit tests for Core layer: entity validation, interface contracts (xUnit)
- [ ] T186 [P] Unit tests for Application layer: use case logic with mocked repositories (xUnit + Moq)
- [ ] T187 [P] Integration tests for Infrastructure layer: Blob Storage read/write, Key Vault secret retrieval (xUnit + Azure SDK)
- [ ] T188 [P] E2E tests for Admin Center: login flow, quote approval flow, user management flow (Playwright - optional)
- [ ] T189 Cost verification: check Azure Cost Management, verify <$20/month for 10K users (if exceeds, optimize Azure AD B2C usage)
- [ ] T190 Swagger documentation review: verify all API endpoints documented with request/response schemas, authentication requirements
- [ ] T191 CORS verification: test from all client origins (localhost, GitHub Pages, Electron, React Native)
- [ ] T192 RBAC verification: test all endpoints with different roles (Anonymous, Authenticated, Contributor, Admin), verify correct 401/403 responses
- [ ] T193 Deploy to staging environment: run Bicep deployment with staging.parameters.json
- [ ] T194 Staging smoke tests: verify all 6 user stories functional in staging
- [ ] T195 Production deployment: run Bicep deployment with production.parameters.json
- [ ] T196 Production smoke tests: verify health endpoint, quote retrieval, authentication, admin access
- [ ] T197 Configure production monitoring: set up Application Insights alerts for errors, high latency, rate limit exceeded
- [ ] T198 Configure backup strategy: enable Blob Storage soft delete (7-day retention), Key Vault backup

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - **US1 (P1)** can start immediately after Foundational
  - **US2 (P2)** can start immediately after Foundational (parallel with US1 if staffed)
  - **US6 (P2)** depends on US1 (needs quote API) and US2 (needs authentication for authenticated sync)
  - **US3 (P3)** depends on US2 (needs authentication)
  - **US4 (P4)** depends on US3 (needs user submissions to moderate)
  - **US5 (P5)** depends on US2 (needs user accounts)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

```
Setup (Phase 1)
       ↓
Foundational (Phase 2) ← CRITICAL BLOCKER
       ↓
       ├─→ US1 (P1) - Anonymous Quote Access ← MVP START
       │      ↓
       ├─→ US2 (P2) - User Authentication
       │      ↓
       │      ├─→ US6 (P2) - Client Sync (depends on US1 + US2)
       │      │
       │      ├─→ US3 (P3) - Quote Submission (depends on US2)
       │      │      ↓
       │      │      └─→ US4 (P4) - Admin Moderation (depends on US3)
       │      │
       │      └─→ US5 (P5) - User Management (depends on US2)
       │
       └─→ Polish (Phase 9) - After all stories complete
```

### Parallel Opportunities

**Phase 1 (Setup)**: Tasks T003-T005 (OAuth apps), T010-T013 (C# projects), T018 (Bicep modules) can run in parallel

**Phase 2 (Foundational)**: 
- Bicep modules (T022-T028) can run in parallel
- Core entities (T032-T036) can run in parallel
- Core interfaces (T037-T039) can run in parallel
- Application use cases (T047-T052) can run in parallel after Core complete
- Application DTOs (T053) can run in parallel with use cases
- Infrastructure services (T042-T046) can run in parallel after Core complete

**After Foundational**:
- US1 and US2 can start in parallel (different endpoints, no dependencies)
- Once US1 + US2 complete: US3, US5, and US6 can start in parallel
- US4 must wait for US3 to complete (needs user submissions)

### Within Each User Story

- US1: All tasks (T061-T068) can run in parallel (different files, no dependencies)
- US2: T074-T080 (backend) and T083-T085 (frontend) can run in parallel
- US6: Sync services for different clients (T094-T096) can run in parallel
- US3: Backend tasks (T113-T121) and frontend tasks (T123-T124) can run in parallel
- US4: Backend use cases (T134-T137), frontend components (T141-T146) can run in parallel
- US5: Backend endpoints (T158-T160), frontend components (T166-T168) can run in parallel

**Total Task Count**: 198 tasks
- Setup: 20 tasks
- Foundational: 40 tasks
- US1: 13 tasks
- US2: 18 tasks
- US6: 21 tasks
- US3: 19 tasks
- US4: 26 tasks
- US5: 18 tasks
- Polish: 23 tasks

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T020) - 3-4 days
2. Complete Phase 2: Foundational (T021-T060) - 5-7 days
3. Complete Phase 3: User Story 1 (T061-T073) - 2-3 days
4. **STOP and VALIDATE**: Test US1 independently, verify public API functional
5. Deploy to staging, demo MVP (Week 2-3)

### Incremental Delivery (Recommended)

1. **Week 1**: Setup + Foundational → Foundation ready
2. **Week 2**: US1 (P1) → Test independently → Deploy (MVP!)
3. **Week 3**: US2 (P2) → Test independently → Deploy (Authentication)
4. **Week 3-4**: US6 (P2) → Test independently → Deploy (Client Sync)
5. **Week 4-5**: US3 (P3) → Test independently → Deploy (Quote Submission)
6. **Week 5**: US4 (P4) → Test independently → Deploy (Admin Moderation)
7. **Week 6**: US5 (P5) → Test independently → Deploy (User Management)
8. **Week 6**: Polish (Phase 9) → Load testing, security scan, production deployment

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With 3 developers:

1. **All**: Complete Setup + Foundational together (Week 1-2)
2. **Once Foundational done**:
   - Developer A: US1 (P1) → US6 (P2) after US1+US2
   - Developer B: US2 (P2) → US3 (P3) after US2
   - Developer C: Foundational refinements → US5 (P5) after US2
3. **Week 5-6**: Developer A on US4, Developers B+C on Polish + testing

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [US#] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Foundational phase (Phase 2) is CRITICAL - blocks all user stories
- Stop at any checkpoint to validate story independently
- All secrets MUST be in Key Vault (no hardcoded secrets in code)
- All API endpoints MUST use URL versioning (/api/v1/*)
- All admin endpoints MUST check JWT role claim (return 403 if not Admin)
- All authenticated endpoints MUST validate JWT (return 401 if missing/invalid)
- Commit after each task or logical group
- Run secret scanning in CI after each commit
- Verify backward compatibility: Quote JSON structure unchanged for client integration
