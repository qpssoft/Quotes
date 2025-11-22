# Implementation Plan: Azure Cloud Backend with Clean Architecture

**Branch**: `004-azure-backend` | **Date**: 2025-11-22 | **Spec**: [spec.md](./spec.md)

## Summary

Build a low-cost Azure Cloud backend ($20/month target) using Clean Architecture with C# Azure Functions for serverless REST API, React + TypeScript Admin Center hosted as Azure Static Web App, OAuth 2.0 authentication (Google/Facebook/Microsoft) via Azure AD B2C, Azure Blob Storage for quote data (JSON files), Azure Key Vault for secrets management, and Azure Bicep Infrastructure as Code for repeatable deployments across environments. System integrates with existing Angular web, React Native mobile, and Electron desktop clients via RESTful API with offline-first synchronization.

## Technical Context

**Language/Version**: C# .NET 8 (Azure Functions), TypeScript 5.x + React 18 (Admin Center)

**Primary Dependencies**:
- **Backend**: Azure Functions v4, Azure.Storage.Blobs SDK, Microsoft.Identity (Azure AD B2C), Swashbuckle (Swagger), Azure.ApplicationInsights
- **Admin Center**: React 18, TypeScript 5.x, Material-UI v5, React Router v6, Axios, Playwright (E2E testing)
- **Infrastructure**: Azure Bicep CLI, Azure CLI, Azure Key Vault SDK
- **Client SDKs**: Azure Communication Services or SendGrid (email notifications)

**Storage**:
- **Azure Blob Storage**: JSON files (`data_vi.json`, `data_en.json`, `{userId}_data.json`), Strong consistency, LRS/GRS redundancy
- **Azure Key Vault**: OAuth secrets, connection strings, API keys, JWT signing keys
- **Azure App Configuration**: Non-sensitive environment settings (API URLs, rate limits, feature flags)

**Testing**:
- **Backend**: xUnit + Moq (unit tests), Postman/REST Client (integration tests), k6 (load tests)
- **Admin Center**: Jest + React Testing Library (unit tests), Playwright (E2E tests - required)
- **Infrastructure**: Azure Resource Manager validation (Bicep linting)

**Target Platform**: Azure Cloud (consumption-based), cross-platform clients (web/mobile/desktop)

**Project Type**: Multi-component cloud system
- Azure Functions App (C# .NET 8)
- React SPA (TypeScript)
- Bicep IaC templates
- Client integration libraries (TypeScript)

**Performance Goals**:
- API: <500ms response time (95th percentile), 1000 concurrent users
- Admin Center: <2s page load, 10K+ quotes with pagination
- Authentication: <3s OAuth flow completion
- Infrastructure: <5 minutes full stack deployment

**Constraints**:
- **Cost**: <$20/month for 10K users, 1M API requests (Azure Free Tier optimization)
- **Security**: All secrets in Key Vault, managed identity authentication, HTTPS only
- **Backward Compatibility**: Existing Quote JSON interface maintained
- **Offline-First Clients**: API designed for sync, not real-time
- **Stateless**: No server sessions, JWT-based auth
- **Single Region**: No multi-region deployment for MVP

**Scale/Scope**:
- 10,000 public quotes, 100 quotes per user
- 10,000 users (Year 1), 1M API requests/month
- 6 user stories (P1-P5 prioritization)
- 16 functional requirements
- 14 success criteria

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Shared Static JSON Data Architecture**: ✅ JSON structure maintained for client backward compatibility. Azure Blob Storage serves static files via Azure Functions API. Client-side caching (localStorage, AsyncStorage, electron-store) unchanged. UTF-8 for Vietnamese text.
- [x] **Clean Architecture**: ✅ C# implementation with Core (Entities), Application (Use Cases), Infrastructure (Azure Blob, AD B2C), Presentation (HTTP triggers). Dependency inversion respected.
- [x] **Performance at Scale**: ✅ Serverless consumption plan (auto-scale), API rate limiting per-user (100/500/1000 req/min), 5-minute Blob Storage caching, 95% of requests <500ms target.
- [x] **Simplicity**: ✅ Minimal dependencies (Azure Functions v4, Blob SDK, AD B2C). No custom auth (using Azure AD B2C). No database (Blob Storage JSON). IaC with Bicep (no manual Portal clicks).
- [x] **Security-First**: ✅ All secrets in Key Vault, managed identity authentication, HTTPS enforced, CORS configured, RBAC via JWT claims, Application Insights audit logging.
- [x] **Cost Optimization**: ✅ Consumption plan (pay-per-execution), Blob Storage (cheap object storage), Azure Free Tier utilization, Static Web App (free hosting), no database costs.
- [x] **BDD Testing**: ✅ Acceptance criteria in Given-When-Then format in spec.md. E2E tests with Playwright required for Admin Center (login, quote approval, user management flows). Load testing with k6 required for performance validation.

**Violations Requiring Justification**: None. Feature adheres to all constitutional principles.

## Project Structure

### Documentation (this feature)

```text
specs/004-azure-backend/
├── spec.md                  # Feature specification with 6 user stories
├── plan.md                  # This file (implementation plan)
├── tasks.md                 # Generated task breakdown (created by /speckit.tasks)
├── research.md              # (Optional) Azure service selection, cost analysis
├── data-model.md            # (Optional) Entity diagrams (Quote, User, Category, etc.)
├── contracts/               # (Optional) OpenAPI/Swagger specs for API endpoints
│   ├── quotes-api.yaml
│   ├── users-api.yaml
│   └── admin-api.yaml
└── quickstart.md            # (Optional) Local development setup guide
```

### Source Code (repository root)

```text
Quotes/                              # Repository root (existing)
├── quotes-platform/                 # Angular web app (existing, will integrate with API)
├── quotes-native/                   # React Native app (existing, will integrate with API)
├── quotes-electron/                 # Electron desktop (existing, will integrate with API)
├── shared-modules/                  # Shared TypeScript modules (existing)
│
├── quotes-backend/                  # NEW: Azure Backend (C# .NET 8)
│   ├── src/
│   │   ├── Quotes.Core/            # Core layer (entities, interfaces)
│   │   │   ├── Entities/
│   │   │   │   ├── Quote.cs
│   │   │   │   ├── User.cs
│   │   │   │   ├── Category.cs
│   │   │   │   ├── UserQuoteSubmission.cs
│   │   │   │   └── AuditLog.cs
│   │   │   └── Interfaces/
│   │   │       ├── IQuoteRepository.cs
│   │   │       ├── IUserRepository.cs
│   │   │       └── IEmailService.cs
│   │   │
│   │   ├── Quotes.Application/     # Application layer (use cases)
│   │   │   ├── UseCases/
│   │   │   │   ├── GetAllQuotesUseCase.cs
│   │   │   │   ├── GetQuoteByIdUseCase.cs
│   │   │   │   ├── SubmitUserQuoteUseCase.cs
│   │   │   │   ├── ApproveQuoteUseCase.cs
│   │   │   │   └── ManageUserUseCase.cs
│   │   │   └── DTOs/
│   │   │       ├── QuoteDto.cs
│   │   │       └── UserDto.cs
│   │   │
│   │   ├── Quotes.Infrastructure/  # Infrastructure layer (Azure services)
│   │   │   ├── Repositories/
│   │   │   │   ├── BlobQuoteRepository.cs
│   │   │   │   └── BlobUserRepository.cs
│   │   │   ├── Auth/
│   │   │   │   └── AzureAdB2CAuthService.cs
│   │   │   ├── Email/
│   │   │   │   └── SendGridEmailService.cs
│   │   │   └── Caching/
│   │   │       └── MemoryCacheService.cs
│   │   │
│   │   └── Quotes.Functions/       # Presentation layer (Azure Functions HTTP triggers)
│   │       ├── QuotesFunction.cs   # GET /api/v1/quotes, GET /api/v1/quotes/{id}
│   │       ├── QuoteSubmissionFunction.cs  # POST /api/v1/quotes
│   │       ├── QuoteManagementFunction.cs  # PUT/DELETE /api/v1/quotes/{id}
│   │       ├── UsersFunction.cs    # Admin user management
│   │       ├── Startup.cs          # Dependency injection configuration
│   │       ├── host.json
│   │       └── local.settings.json
│   │
│   ├── tests/
│   │   ├── Quotes.Core.Tests/      # Unit tests for entities and interfaces
│   │   ├── Quotes.Application.Tests/  # Unit tests for use cases
│   │   ├── Quotes.Infrastructure.Tests/  # Integration tests for Azure services
│   │   └── Quotes.Functions.Tests/ # HTTP trigger tests
│   │
│   └── Quotes.Backend.sln          # Solution file
│
├── quotes-admin/                    # NEW: React Admin Center (TypeScript)
│   ├── src/
│   │   ├── components/             # Reusable React components
│   │   │   ├── QuoteList.tsx
│   │   │   ├── QuoteEditor.tsx
│   │   │   ├── UserList.tsx
│   │   │   └── Layout.tsx
│   │   ├── pages/                  # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── QuotesPage.tsx
│   │   │   ├── UsersPage.tsx
│   │   │   └── SubmissionsPage.tsx
│   │   ├── services/               # API client services
│   │   │   ├── quotesApi.ts
│   │   │   ├── usersApi.ts
│   │   │   └── authService.ts
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   └── useQuotes.ts
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── staticwebapp.config.json    # Azure Static Web App configuration
│
├── infrastructure/                  # NEW: Azure Bicep IaC templates
│   ├── main.bicep                  # Main deployment template
│   ├── modules/
│   │   ├── resourceGroup.bicep
│   │   ├── storageAccount.bicep    # Blob Storage for quotes
│   │   ├── functionApp.bicep       # Azure Functions (consumption plan)
│   │   ├── staticWebApp.bicep      # Admin Center hosting
│   │   ├── keyVault.bicep          # Secrets management
│   │   ├── appConfiguration.bicep  # Environment settings
│   │   ├── applicationInsights.bicep  # Logging and monitoring
│   │   └── adB2C.bicep             # Azure AD B2C tenant configuration
│   ├── parameters/
│   │   ├── dev.parameters.json
│   │   ├── staging.parameters.json
│   │   └── production.parameters.json
│   └── deploy.ps1                  # Deployment script
│
├── .github/
│   └── workflows/
│       ├── backend-ci.yml          # Backend CI/CD pipeline
│       ├── admin-ci.yml            # Admin Center CI/CD pipeline
│       └── infrastructure-ci.yml   # Bicep validation and deployment
│
└── specs/                          # Feature specifications (existing)
    └── 004-azure-backend/
```

**Structure Decision**: Monorepo with separate projects for backend (C# .NET 8), Admin Center (React TypeScript), and Infrastructure (Bicep). Clean Architecture implemented in backend with Core/Application/Infrastructure/Presentation layers. Existing client apps (Angular, React Native, Electron) remain in current structure and integrate via API client libraries.

## Complexity Tracking

No constitutional violations. Feature adheres to all principles:
- Clean Architecture respected (4 layers)
- Azure Free Tier optimization (<$20/month cost target)
- Simplicity (serverless, no custom auth, no database)
- Security-first (Key Vault, managed identity)
- Backward compatibility (JSON structure maintained)

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Applications                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Angular Web  │ │React Native │ │   Electron   │        │
│  │  (Platform)  │ │   (Mobile)   │ │  (Desktop)   │        │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘        │
│         │                 │                 │                │
│         └─────────────────┴─────────────────┘                │
│                           │                                  │
│                           │ HTTPS/REST                       │
│                           ▼                                  │
│         ┌─────────────────────────────────────┐             │
│         │     Azure API Management (Future)    │             │
│         │         CORS + Rate Limiting          │             │
│         └───────────────┬─────────────────────┘             │
└─────────────────────────┼─────────────────────────────────┘
                          │
            ┌─────────────┼─────────────┐
            │   Azure Functions App      │
            │  (C# .NET 8 - Serverless)  │
            │                            │
            │  ┌──────────────────────┐ │
            │  │ Presentation Layer   │ │
            │  │ (HTTP Triggers)      │ │
            │  ├──────────────────────┤ │
            │  │ Application Layer    │ │
            │  │ (Use Cases)          │ │
            │  ├──────────────────────┤ │
            │  │ Infrastructure Layer │ │
            │  │ (Repositories)       │ │
            │  ├──────────────────────┤ │
            │  │ Core Layer           │ │
            │  │ (Entities)           │ │
            │  └──────────────────────┘ │
            └────┬──────┬──────┬────────┘
                 │      │      │
    ┌────────────┘      │      └────────────┐
    │                   │                    │
    ▼                   ▼                    ▼
┌────────────┐   ┌──────────────┐   ┌──────────────┐
│Azure Blob  │   │ Azure AD B2C │   │   Key Vault  │
│  Storage   │   │(OAuth 2.0)   │   │  (Secrets)   │
│ (Quotes)   │   │              │   │              │
└────────────┘   └──────────────┘   └──────────────┘
                         │
                ┌────────┴────────┐
                │                 │
                ▼                 ▼
         ┌─────────────┐   ┌─────────────┐
         │   Google    │   │  Facebook   │
         │   OAuth     │   │   OAuth     │
         └─────────────┘   └─────────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │  Microsoft  │
                  │   OAuth     │
                  └─────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Admin Center (React SPA)                        │
│  ┌──────────────────────────────────────────────┐           │
│  │   Azure Static Web App (Free Tier)           │           │
│  │                                               │           │
│  │  Routes:                                      │           │
│  │   - /admin/quotes     (Quote Management)     │           │
│  │   - /admin/users      (User Management)      │           │
│  │   - /admin/submissions (Moderation Queue)    │           │
│  └──────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS/REST (Admin JWT)
                          ▼
                 Azure Functions App
                 (Same as above)

┌─────────────────────────────────────────────────────────────┐
│           Monitoring & Logging                               │
│  ┌──────────────────────────────────────────────┐           │
│  │   Azure Application Insights                 │           │
│  │   - Request telemetry                        │           │
│  │   - Error tracking                           │           │
│  │   - Performance metrics                      │           │
│  │   - Custom events (audit log)                │           │
│  └──────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Quote Retrieval (Anonymous)**:
1. Client → GET /api/v1/quotes → Azure Functions
2. Functions → Check memory cache (5 min TTL)
3. If miss → Blob Storage → Load data_vi.json/data_en.json
4. Apply filtering (category/language/author)
5. Return JSON → Client caches locally

**User Authentication**:
1. Client → Redirect to Azure AD B2C login
2. User selects provider (Google/Facebook/Microsoft)
3. OAuth flow → Provider consent → AD B2C
4. AD B2C issues JWT with claims (userId, email, role)
5. Client stores JWT → Include in Authorization header

**Quote Submission (Authenticated)**:
1. Client → POST /api/v1/quotes + JWT → Azure Functions
2. Functions → Validate JWT → Extract userId
3. Validate quote (500 char content, 100 char author)
4. Write to {userId}_data.json in Blob Storage
5. Trigger email notification to admin (SendGrid)
6. Return 201 Created

**Admin Moderation**:
1. Admin → GET /admin/submissions → React Admin Center
2. Admin Center → GET /api/v1/submissions + Admin JWT → Functions
3. Functions → Check JWT role (Admin required)
4. Load all {userId}_data.json files → Filter pending
5. Admin → Approve quote
6. Admin Center → PUT /api/v1/quotes/{id} → Functions
7. Functions → Move quote from user file to data_vi.json/data_en.json
8. Blob Storage updated

### Security Model

**Authentication Flow**:
- Azure AD B2C as identity provider
- Social providers: Google, Facebook, Microsoft
- JWT tokens signed with Azure AD B2C keys
- Token expiration: 1 hour (configurable)
- Refresh tokens: 7 days

**Authorization (RBAC)**:
- Anonymous: GET /api/v1/quotes (public)
- Authenticated: POST /api/v1/quotes (personal quotes)
- Admin: PUT/DELETE /api/v1/quotes/{id}, User management

**Secrets Management**:
- All secrets in Azure Key Vault
- Managed identity authentication (no connection strings in code)
- Key Vault references in App Configuration
- Secrets: OAuth client secrets, storage keys, SendGrid API key, App Insights key

**Network Security**:
- HTTPS enforced (TLS 1.2+)
- CORS configured for allowed origins
- Rate limiting per-user/IP (100/500/1000 req/min)
- Azure Functions firewall rules (optional)

## Implementation Phases

### Phase 1: Setup & Infrastructure (Week 1)
**Objective**: Establish Azure infrastructure and development environment

**Tasks**:
- Create Azure subscription and Resource Group
- Configure Azure AD B2C tenant with social providers (Google, Facebook, Microsoft)
- Create OAuth apps on Google Cloud Console, Facebook Developers, Azure AD
- Write Bicep templates for all Azure resources (Storage, Functions, Key Vault, App Configuration, Static Web App, Application Insights)
- Deploy infrastructure to dev environment
- Set up local development environment (.NET 8 SDK, Azure Functions Core Tools, Azure CLI, Bicep CLI)
- Initialize C# solution with Clean Architecture structure (Core, Application, Infrastructure, Functions projects)
- Initialize React Admin Center project (Create React App + TypeScript + Material-UI)
- Configure CI/CD pipelines (GitHub Actions)

**Deliverables**:
- Azure infrastructure deployed (dev environment)
- C# solution structure created
- React project initialized
- Bicep templates validated

### Phase 2: Foundational (Blocking Prerequisites) (Week 2)
**Objective**: Implement core backend services and authentication

**Tasks**:
- Implement Core layer entities (Quote, User, Category)
- Implement Infrastructure layer: BlobQuoteRepository, BlobUserRepository
- Implement Azure AD B2C authentication middleware
- Implement Key Vault integration with managed identity
- Implement Application Insights logging
- Create Azure Functions HTTP triggers (Quotes, QuoteSubmission)
- Configure Swagger/OpenAPI documentation
- Write unit tests for Core and Application layers
- Deploy to dev environment and test

**Deliverables**:
- Backend API with authentication working
- Blob Storage integration functional
- Key Vault secrets accessible via managed identity
- Swagger documentation live

### Phase 3: User Story 1 - Anonymous Quote Access (Week 2-3)
**Objective**: Public API for fetching quotes

**Tasks**:
- Implement GetAllQuotesUseCase with filtering (category, language, author)
- Implement GetQuoteByIdUseCase
- Add memory caching (5-minute TTL)
- Implement rate limiting (100 req/min per IP for anonymous)
- Add CORS configuration for client origins
- Write integration tests for quote retrieval
- Update client libraries (TypeScript) for API integration
- Test with Angular web client

**Deliverables**:
- GET /api/v1/quotes working with filters
- GET /api/v1/quotes/{id} working
- Client integration tested
- Performance: <500ms response time

**Independent Test**: Make HTTP GET request to /api/v1/quotes and verify JSON response with 200 OK

### Phase 4: User Story 2 - User Authentication (Week 3-4)
**Objective**: OAuth 2.0 authentication with social providers

**Tasks**:
- Implement Azure AD B2C authentication flow
- Configure redirect URIs for all clients (web, mobile, desktop)
- Implement JWT validation middleware
- Implement token refresh logic
- Add user profile endpoints (GET /api/v1/users/me)
- Implement logout functionality
- Test authentication flow with all three providers
- Update client libraries with auth helpers
- Test with React Native and Electron clients

**Deliverables**:
- OAuth flow working with Google, Facebook, Microsoft
- JWT tokens issued and validated
- User profile retrieval functional
- Token persistence in clients

**Independent Test**: Click "Sign in with Google" and verify JWT token storage and user profile retrieval

### Phase 5: User Story 6 - Client Data Synchronization (Week 4)
**Objective**: Automatic data sync when online

**Tasks**:
- Implement sync endpoint (GET /api/v1/quotes/sync with ETag/If-Modified-Since)
- Add Last-Modified headers to quote responses
- Implement client sync logic (Angular, React Native, Electron)
- Add sync status notifications in clients
- Test offline-to-online transition
- Verify backward compatibility with local JSON structure

**Deliverables**:
- Sync endpoint working
- Clients fetch latest quotes on connection restore
- Offline mode functional
- Backward compatibility maintained

**Independent Test**: Open client app online, verify latest quotes fetched, go offline, verify cached quotes accessible

### Phase 6: User Story 3 - User Quote Submission (Week 5)
**Objective**: Authenticated users can submit quotes

**Tasks**:
- Implement SubmitUserQuoteUseCase
- Implement POST /api/v1/quotes endpoint (authenticated)
- Add validation (500 char content, 100 char author)
- Implement {userId}_data.json creation in Blob Storage
- Implement email notification to admin (SendGrid integration)
- Add "My Quotes" endpoint (GET /api/v1/users/me/quotes)
- Test quote submission and persistence
- Update Admin Center to display pending submissions

**Deliverables**:
- POST /api/v1/quotes working (authenticated users only)
- User quotes persisted in Blob Storage
- Email notifications sent to quangphamsoftvn@gmail.com
- "My Quotes" retrieval functional

**Independent Test**: Log in, submit quote, verify it appears in "My Quotes" and triggers admin email

### Phase 7: User Story 4 - Admin Quote Management (Week 5-6)
**Objective**: Admin Center for quote moderation

**Tasks**:
- Implement Admin Center Dashboard (React)
- Implement QuoteList component with pagination, search, filtering
- Implement QuoteEditor component
- Implement ApproveQuoteUseCase, RejectQuoteUseCase
- Implement PUT /api/v1/quotes/{id} (admin only)
- Implement DELETE /api/v1/quotes/{id} (admin only)
- Add RBAC enforcement (admin JWT claims)
- Test quote approval (move from user file to public file)
- Test quote rejection (delete from user file)
- Write Playwright E2E tests for quote approval workflow
- Write Playwright E2E tests for RBAC enforcement (non-admin gets 403)
- Deploy Admin Center to Azure Static Web App

**Deliverables**:
- Admin Center deployed and functional
- Quote approval/rejection working
- Public quote collection updated on approval
- RBAC enforced (403 for non-admin)

**Independent Test**: Log in as admin, approve user-submitted quote, verify it appears in public collection

### Phase 8: User Story 5 - Admin User Management (Week 6)
**Objective**: Admin can manage users and roles

**Tasks**:
- Implement UserList component in Admin Center
- Implement ManageUserUseCase (assign roles, ban users)
- Implement GET /api/v1/admin/users endpoint
- Implement PUT /api/v1/admin/users/{id} (role assignment)
- Implement DELETE /api/v1/admin/users/{id} (ban/delete)
- Add audit logging for admin actions (Application Insights)
- Test role assignment and verification
- Test user ban (authentication fails)
- Write Playwright E2E tests for user role assignment workflow
- Write Playwright E2E tests for user ban workflow

**Deliverables**:
- User management UI functional
- Role assignment working (Authenticated → Contributor → Admin)
- User ban working (isActive flag)
- Audit logs in Application Insights

**Independent Test**: Assign "Contributor" role to user, verify they can submit quotes

### Phase 9: Polish & Cross-Cutting (Week 6)
**Objective**: Final testing, optimization, documentation

**Tasks**:
- Run complete Playwright E2E test suite (login, quote approval, user management, RBAC)
- Load testing (k6) with 1000 concurrent users
- Security scan (GitHub secret scanning, Azure DevOps credential scanner)
- Verify all secrets in Key Vault (zero hardcoded)
- Performance optimization (Blob Storage caching tuning)
- Cost verification (<$20/month for 10K users)
- Complete API documentation (Swagger)
- Write deployment guide
- Write client integration guide
- Test staging environment deployment
- Run E2E tests against staging environment
- Production deployment
- Run E2E smoke tests against production

**Deliverables**:
- Playwright E2E tests passed (100% critical workflows covered)
- Load testing passed (1000 concurrent users)
- Security scan passed (zero exposed secrets)
- Cost target met (<$20/month)
- Documentation complete
- Production deployed

## Cost Analysis

### Year 1 (Azure Free Tier)
- **Azure Functions**: 1M executions free + $0.20/million after = ~$0.00 (within free tier)
- **Blob Storage**: 5GB free + $0.02/GB after = ~$0.00 (within free tier)
- **Application Insights**: 1GB data free + $2.30/GB after = ~$0.00 (within free tier)
- **Azure AD B2C**: 50K MAU free + $0.00325/MAU after = ~$0.00 (within free tier)
- **Static Web App**: Free tier = $0.00
- **Key Vault**: $0.03/10K operations = ~$0.03/month
- **App Configuration**: Free tier (1000 requests/day) = $0.00
- **SendGrid**: 100 emails/day free = $0.00

**Total Year 1**: ~$0.04/month

### Year 2+ (Post Free Tier)
- **Azure Functions**: 2M executions × $0.20/million = $0.40
- **Blob Storage**: 10GB × $0.02/GB = $0.20
- **Application Insights**: 2GB × $2.30/GB = $4.60 (or use sampling)
- **Azure AD B2C**: 10K MAU × $0.00325 = $32.50 (need optimization or free tier extension)
- **Static Web App**: Free tier = $0.00
- **Key Vault**: $0.03
- **SendGrid**: 100 emails/day free = $0.00

**Total Year 2+**: ~$37.73/month (⚠️ Exceeds $20 target due to AD B2C)

**Cost Optimization Strategies**:
- Use Azure AD B2C free tier for first 50K MAU
- Implement caching to reduce Functions executions
- Use Application Insights sampling (90% reduction → $0.46/month)
- Consider self-hosted identity solution for <$20/month (removes AD B2C)

## Testing Strategy

### Unit Tests (Backend)
- **Quotes.Core.Tests**: Entity validation logic
- **Quotes.Application.Tests**: Use case logic (mocked repositories)
- **Quotes.Infrastructure.Tests**: Azure SDK integrations (mocked Blob SDK)
- **Quotes.Functions.Tests**: HTTP trigger logic (mocked dependencies)
- **Target**: 80% code coverage
- **Tools**: xUnit, Moq, FluentAssertions

### Integration Tests (Backend)
- **Blob Storage**: Actual read/write to dev storage account
- **Key Vault**: Secret retrieval with managed identity
- **Azure AD B2C**: Token validation (real tokens from dev tenant)
- **Tools**: xUnit, Azure SDK, Postman/REST Client

### E2E Tests (Admin Center - Required)
- **Playwright**: Login flow, quote approval flow, user management flow
- **Scenarios**:
  - Admin login with Azure AD B2C (Google OAuth)
  - Navigate to Submissions page and approve pending quote
  - Navigate to Users page and assign Contributor role
  - Navigate to Quotes page and edit public quote
  - Test RBAC: verify non-admin user gets 403 on admin routes
- **Target**: 100% coverage of critical admin workflows
- **Tools**: Playwright, @playwright/test

### Load Tests
- **k6**: 1000 concurrent users, quote retrieval, quote submission
- **Target**: 95% of requests <500ms, zero errors
- **Tools**: k6 (open source)

### Security Tests
- **Secret Scanning**: GitHub secret scanning, Azure DevOps credential scanner
- **Target**: Zero secrets in code, all in Key Vault
- **OWASP**: SQL injection (N/A - no SQL), XSS (React escaping), CSRF (SameSite cookies)

## Deployment Strategy

### Environments
1. **Development**: `dev.azurewebsites.net`, local Azure Storage Emulator, dev AD B2C tenant
2. **Staging**: `staging.azurewebsites.net`, staging storage account, staging AD B2C tenant
3. **Production**: `api.buddhistquotes.com` (custom domain), production storage, production AD B2C tenant

### CI/CD Pipelines
- **Backend CI**: Build → Unit Tests → Integration Tests → Package → Deploy to Dev
- **Admin CI**: Build → Unit Tests → Playwright E2E Tests → Deploy to Static Web App (Dev)
- **Infrastructure CI**: Bicep Lint → ARM Validation → Deploy to Dev → Smoke Tests

### Deployment Process
1. Commit to `004-azure-backend` branch
2. CI pipeline runs (tests + build)
3. Deploy to dev environment automatically
4. Manual approval for staging deployment
5. Staging smoke tests
6. Manual approval for production deployment
7. Production deployment (blue-green or canary)
8. Post-deployment smoke tests

### Rollback Strategy
- Azure Functions: Redeploy previous slot (deployment slots)
- Static Web App: Rollback to previous commit (Git-based deployment)
- Bicep: Redeploy previous parameter version
- Blob Storage: Restore from blob snapshots (24-hour retention)

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Azure AD B2C cost exceeds budget | High | Medium | Use free tier (50K MAU), implement caching, consider self-hosted auth |
| OAuth provider downtime (Google/Facebook/Microsoft) | Medium | Low | Multi-provider support (fallback), clear error messages |
| Blob Storage unavailable | High | Very Low | Memory caching (5 min), 503 + Retry-After header, 99.99% SLA |
| Concurrent edit conflicts (admins) | Low | Low | Last write wins (MVP), add ETag-based locking later |
| Client backward compatibility breaks | High | Medium | Maintain JSON structure, version API (v1), test with all clients |
| Key Vault secrets leak | Critical | Very Low | Managed identity only, secret scanning in CI, no secrets in code |
| Rate limiting too restrictive | Medium | Medium | Monitor Application Insights, adjust limits via App Configuration |
| Admin account compromise | High | Low | MFA required (Azure AD B2C), audit logging, IP whitelisting (optional) |

## Success Metrics

- **SC-001**: API <500ms response time (95th percentile) ✅ Measured via Application Insights
- **SC-005**: Cost <$20/month for 10K users ⚠️ Requires AD B2C optimization
- **SC-009**: RBAC 100% enforced ✅ Unit tests + integration tests
- **SC-013**: Infrastructure deployment <5 minutes ✅ Bicep automation
- **SC-014**: Zero secrets in code ✅ Secret scanning in CI

## Next Steps

1. Run `/speckit.tasks` to generate detailed task breakdown
2. Create Azure subscription and Resource Group
3. Configure Azure AD B2C tenant with OAuth apps
4. Initialize C# solution and React project
5. Write Bicep templates for infrastructure
6. Begin Phase 1: Setup & Infrastructure
