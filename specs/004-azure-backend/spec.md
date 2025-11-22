# Feature Specification: Azure Cloud Backend with Clean Architecture

**Feature Branch**: `004-azure-backend`  
**Created**: 2025-11-22  
**Status**: Draft  
**Input**: Build low-cost backend with Azure Cloud using Clean Architecture C# Azure Functions for API, React admin center for quote/user management, authentication with Google/Facebook/Microsoft, Azure Blob Storage for quotes data, and client integration with existing Angular/React/React Native/Electron apps

## Clarifications

### Session 2025-11-22

- Q: What about filtering/search endpoints for quotes by category, language, or author? → A: Add filtering endpoints - GET /api/quotes?category={category}&language={lang}&author={author} to support client-side performance
- Q: Admin notification mechanism - how should admins be notified of new quote submissions? → A: Email notifications via Azure Communication Services/SendGrid to quangphamsoftvn@gmail.com
- Q: Quote content length limits - what are the maximum character lengths for quote content and author fields? → A: Content: 500 characters, Author: 100 characters
- Q: API versioning strategy - how should the API handle future breaking changes? → A: URL versioning (/api/v1/quotes)
- Q: Rate limiting scope - should rate limits apply per-user or globally per endpoint? → A: Per user/client IP (each user/IP has their own quota)

## User Scenarios & Testing

### User Story 1 - Anonymous Quote Access via API (Priority: P1)

As an anonymous user, I want to fetch quotes from a public API endpoint so that any client application (web, mobile, desktop) can display Buddhist quotes without authentication.

**Why this priority**: This is the foundation of the entire system. Without a working API that serves quotes, no other features matter. This enables all existing clients to migrate from local JSON files to a cloud-based data source.

**Independent Test**: Can be fully tested by making an HTTP GET request to `/api/quotes` and verifying the JSON response contains valid quote data. Delivers immediate value by enabling cloud-based quote distribution.

**Acceptance Scenarios**:

1. **Given** the API is deployed, **When** a client sends GET `/api/quotes`, **Then** the system returns a 200 OK response with all quotes in JSON format matching the existing Quote interface
2. **Given** the API is deployed, **When** a client sends GET `/api/quotes/{id}`, **Then** the system returns a single quote with matching ID or 404 if not found
3. **Given** the quotes data file is updated in Azure Blob Storage, **When** a client fetches quotes, **Then** the API serves the latest version without manual intervention
4. **Given** 100 concurrent clients request quotes, **When** the API receives all requests simultaneously, **Then** all clients receive responses within 2 seconds with no errors

---

### User Story 2 - User Authentication with Social Providers (Priority: P2)

As a user, I want to sign in using my Google, Facebook, or Microsoft account so that I can access personalized features (favorites, custom quotes) without creating yet another username and password.

**Why this priority**: Authentication enables personalization and user-specific features. It's required before users can contribute quotes or manage favorites. Social auth reduces friction (no password management) and leverages trusted providers.

**Independent Test**: Can be tested by clicking "Sign in with Google" and verifying successful authentication, token storage, and user profile retrieval. Delivers value by enabling personalized experiences.

**Acceptance Scenarios**:

1. **Given** a user is on the login page, **When** they click "Sign in with Google", **Then** they are redirected to Google OAuth consent screen, authenticate, and return to the app with a valid JWT token
2. **Given** a user is on the login page, **When** they click "Sign in with Facebook", **Then** they complete Facebook OAuth flow and receive a JWT token with user profile data (name, email, profile picture)
3. **Given** a user is on the login page, **When** they click "Sign in with Microsoft", **Then** they complete Microsoft OAuth flow and receive a JWT token
4. **Given** an authenticated user, **When** they close and reopen the app, **Then** they remain logged in (token persisted in localStorage/AsyncStorage)
5. **Given** an authenticated user, **When** their token expires, **Then** they are prompted to re-authenticate
6. **Given** an authenticated user, **When** they click "Logout", **Then** their token is cleared and they are redirected to the public homepage

---

### User Story 3 - User Quote Submission (Priority: P3)

As an authenticated user, I want to submit my own Buddhist quotes or wisdom sayings so that I can contribute to the community and see my submissions reflected in my personal collection.

**Why this priority**: This enables community contribution and user-generated content, enhancing engagement. It's lower priority than core API and auth because the app is valuable with just the base quote collection.

**Independent Test**: Can be tested by logging in, submitting a quote through the UI, and verifying it appears in "My Quotes" and is stored in Azure Blob Storage as `{userId}_data.json`.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they submit a quote with content, author, and category, **Then** the system saves it to their personal collection (`{userId}_data.json`) and returns a success confirmation
2. **Given** an authenticated user, **When** they view "My Quotes", **Then** they see all their submitted quotes with options to edit or delete
3. **Given** an authenticated user submits a quote, **When** they refresh the app, **Then** their submitted quote persists in their collection
4. **Given** an unauthenticated user, **When** they try to access the quote submission form, **Then** they are redirected to the login page

---

### User Story 4 - Admin Quote Management (Priority: P4)

As an admin, I want to manage all quotes (public and user-submitted) through a dedicated admin center so that I can curate content quality, moderate submissions, and maintain the quote database.

**Why this priority**: Admin capabilities are essential for long-term quality control but not needed for initial launch. The system is functional without it, but content quality will degrade over time without moderation.

**Independent Test**: Can be tested by logging in as an admin user, viewing all quotes (public + user-submitted), editing a quote, and verifying changes are reflected in Azure Blob Storage.

**Acceptance Scenarios**:

1. **Given** an admin user is authenticated, **When** they access the Admin Center, **Then** they see a dashboard with all public quotes and user-submitted quotes
2. **Given** an admin views a user-submitted quote, **When** they click "Approve", **Then** the quote is moved from the user's collection to the public collection (`data_vi.json` or `data_en.json`)
3. **Given** an admin views a user-submitted quote, **When** they click "Reject", **Then** the quote is deleted from the user's collection with an optional reason sent to the user
4. **Given** an admin views any quote, **When** they edit content/author/category and save, **Then** the changes are persisted in Azure Blob Storage
5. **Given** an admin views any quote, **When** they click "Delete" and confirm, **Then** the quote is permanently removed
6. **Given** a non-admin user, **When** they try to access the Admin Center URL, **Then** they receive a 403 Forbidden response

---

### User Story 5 - Admin User Management (Priority: P5)

As an admin, I want to manage user accounts (view, assign roles, ban users) so that I can control who has access to submission features and admin capabilities.

**Why this priority**: User management is an operational necessity but lowest priority for MVP. The system can launch with a single hardcoded admin account. This becomes important as the user base grows.

**Independent Test**: Can be tested by logging in as an admin, viewing all registered users, assigning "Contributor" role to a user, and verifying that user can now submit quotes.

**Acceptance Scenarios**:

1. **Given** an admin is authenticated, **When** they access "User Management", **Then** they see a list of all users with email, name, registration date, and current role
2. **Given** an admin views a user, **When** they assign the "Contributor" role, **Then** that user gains permission to submit quotes
3. **Given** an admin views a user, **When** they assign the "Admin" role, **Then** that user gains access to the Admin Center
4. **Given** an admin views a user, **When** they click "Ban User", **Then** that user's account is disabled and they cannot authenticate
5. **Given** an admin views a user, **When** they click "Delete User", **Then** the user's account and all their submitted quotes are permanently deleted

---

### User Story 6 - Client Data Synchronization (Priority: P2)

As a user on any client platform (Angular web, React Native mobile, Electron desktop), I want the app to automatically sync quote data from the Azure backend when online so that I always have the latest quotes while maintaining offline functionality.

**Why this priority**: This is critical for client integration and ensures a smooth transition from local JSON files to cloud-based storage. It's high priority because it directly impacts user experience across all platforms.

**Independent Test**: Can be tested by opening any client app with internet connection, verifying it fetches latest quotes from Azure, and then going offline to confirm quotes remain accessible.

**Acceptance Scenarios**:

1. **Given** a client app with local quote data, **When** the app detects an internet connection, **Then** it fetches the latest public quotes from Azure and updates localStorage/IndexedDB/AsyncStorage
2. **Given** a client app is offline, **When** a user views quotes, **Then** they see the cached local quotes without errors
3. **Given** an authenticated user on a client app, **When** the app syncs online, **Then** it fetches the user's personal quotes (`{userId}_data.json`) and merges them with public quotes
4. **Given** a client app syncs new data, **When** the sync completes, **Then** the app shows a subtle notification (e.g., "Updated 5 new quotes")
5. **Given** a client app has no internet connection on first launch, **When** the user opens the app, **Then** they see bundled default quotes with a message "Connect to sync latest quotes"

---

### Edge Cases

- **What happens when a user submits a quote with offensive/inappropriate content?** Admin moderation queue (future enhancement) or automatic profanity filter (out of scope for MVP).
- **What happens when Azure Blob Storage is unavailable?** API returns cached quotes from Azure Functions runtime memory (5-minute cache) or returns 503 Service Unavailable with "Retry-After" header.
- **What happens when a user's personal quote file exceeds 1MB?** System enforces a 100-quote limit per user with a message "Maximum 100 personal quotes reached. Delete some to add more."
- **What happens when two admins edit the same quote simultaneously?** Last write wins (optimistic concurrency). Future enhancement: pessimistic locking or ETag-based conflict resolution.
- **What happens when a social auth provider (Google/Facebook/Microsoft) is down?** User sees error message "Authentication service unavailable. Try again later." Other providers remain functional.
- **What happens when a client's cached data is corrupted?** Client detects invalid JSON, clears cache, and re-fetches from Azure on next sync.
- **What happens when an authenticated user's token is revoked by the provider?** API returns 401 Unauthorized, client clears token and prompts re-login.

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a RESTful API implemented as Azure Functions (serverless) with URL versioning and endpoints: GET `/api/v1/quotes` (all quotes), GET `/api/v1/quotes?category={category}&language={lang}&author={author}` (filtered quotes), GET `/api/v1/quotes/{id}` (single quote), POST `/api/v1/quotes` (submit user quote, authenticated), PUT `/api/v1/quotes/{id}` (edit quote, admin only), DELETE `/api/v1/quotes/{id}` (delete quote, admin only)

- **FR-002**: System MUST implement Clean Architecture in C# with layers: Core (Entities: Quote, User, Category), Application (Use Cases: GetAllQuotes, SubmitUserQuote, ApproveQuote), Infrastructure (Azure Blob Storage repository, Azure AD B2C auth), and Presentation (Azure Functions HTTP triggers with Swagger/OpenAPI documentation). Infrastructure MUST be defined as code using Azure Bicep templates for repeatable deployments across environments (dev, staging, production)

- **FR-003**: System MUST authenticate users via OAuth 2.0 with three providers: Google (Google Identity Platform), Facebook (Facebook Login), Microsoft (Azure AD B2C social identity providers), issuing JWT tokens signed with Azure AD B2C keys. OAuth client secrets, API keys, and JWT signing keys MUST be stored in Azure Key Vault with managed identity access from Azure Functions (no secrets in code or configuration files)

- **FR-004**: System MUST store quote data in Azure Blob Storage with three file types: `data_vi.json` (Vietnamese public quotes), `data_en.json` (English public quotes), `{userId}_data.json` (per-user personal quotes), all using the existing Quote interface structure. Storage account connection strings and access keys MUST be stored in Azure Key Vault and referenced via Azure App Configuration

- **FR-005**: System MUST provide an Admin Center SPA (Single Page Application) built with React, TypeScript, and Material-UI, hosted as an Azure Static Web App with routes: `/admin/quotes` (manage all quotes), `/admin/users` (manage users and permissions), `/admin/submissions` (moderate user-submitted quotes)

- **FR-006**: System MUST implement role-based access control (RBAC) with roles: Anonymous (read public quotes), Authenticated (submit personal quotes), Contributor (submit + view all personal quotes), Admin (full CRUD on quotes + user management), enforced via JWT claims

- **FR-007**: Client applications (Angular web, React Native mobile, Electron desktop) MUST detect internet connectivity and automatically fetch updated quote data from Azure API on app launch or when connection is restored, storing fetched data in platform-appropriate cache (localStorage for web, AsyncStorage for React Native, electron-store for Electron)

- **FR-008**: Client applications MUST maintain offline-first functionality, serving quotes from local cache when offline, with no degradation of core quote display, random rotation, search, and favorites features

- **FR-009**: System MUST expose Swagger UI documentation at `/api/swagger` for all API endpoints, including request/response schemas, authentication requirements, and example payloads

- **FR-010**: System MUST log all API requests, errors, and admin actions to Azure Application Insights with structured logging (request ID, user ID, timestamp, action, result) for monitoring, debugging, and audit trails. Application Insights instrumentation key and connection string MUST be stored in Azure Key Vault

- **FR-011**: System MUST implement API rate limiting per user/client IP address: 100 requests per minute per IP for anonymous users, 500 requests per minute per authenticated user (identified by JWT user ID), 1000 requests per minute per admin user, returning 429 Too Many Requests with "Retry-After" header when exceeded, preventing individual abuse while allowing scale

- **FR-012**: System MUST support CORS (Cross-Origin Resource Sharing) for client origins: localhost (development), GitHub Pages domain (Angular web), Electron app origin, React Native mobile (no origin), with credentials allowed for authenticated requests

- **FR-013**: System MUST send email notifications to quangphamsoftvn@gmail.com when users submit quotes for review, using Azure Communication Services or SendGrid (free tier 100 emails/day), including quote content, author, submitter name, and direct link to Admin Center moderation page. Email service API keys MUST be stored in Azure Key Vault

- **FR-014**: System MUST validate quote content (max 500 characters) and author (max 100 characters) fields on submission, returning 400 Bad Request with clear error message if limits exceeded

- **FR-015**: Infrastructure MUST be provisioned using Azure Bicep (Infrastructure as Code) with modules for: Resource Group, Storage Account (Blob containers for quotes), Function App (consumption plan), Application Insights, Static Web App (Admin Center), Azure AD B2C tenant configuration, Azure Key Vault (for secrets management), Azure App Configuration (for environment-specific settings). Bicep templates MUST support parameterized deployment across environments (dev/staging/production) with environment-specific settings (SKUs, locations, naming conventions). Function App MUST use managed identity to access Key Vault (no connection strings in app settings)

- **FR-016**: System MUST implement secure secret management using Azure Key Vault for all sensitive credentials: OAuth client secrets (Google/Facebook/Microsoft), Storage account connection strings, Application Insights instrumentation keys, SendGrid/Azure Communication Services API keys, JWT signing keys. Azure Functions MUST authenticate to Key Vault using system-assigned managed identity. Azure App Configuration MUST be used for non-sensitive environment-specific settings (API URLs, feature flags, rate limit thresholds) with Key Vault references for secrets

### Key Content Entities

- **Quote**: Core entity representing a Buddhist quote, proverb, or wisdom saying with properties: `id` (string, GUID), `content` (string, Vietnamese or English text, max 500 characters), `author` (string, optional, max 100 characters), `category` (string, e.g., "wisdom", "compassion"), `tags` (string[], optional), `language` (string, "vi" or "en"), `type` (string, "Quote" | "Proverb" | "CaDao" | "WisdomSaying"), `createdAt` (ISO 8601 timestamp), `createdBy` (string, user ID or "system"), `isPublic` (boolean, true for public collection, false for user-submitted pending approval)

- **User**: Entity representing a registered user with properties: `id` (string, GUID), `email` (string, from OAuth provider), `name` (string, from OAuth provider), `profilePicture` (string, URL from OAuth provider), `provider` (string, "google" | "facebook" | "microsoft"), `role` (string, "Authenticated" | "Contributor" | "Admin"), `createdAt` (ISO 8601 timestamp), `lastLogin` (ISO 8601 timestamp), `isActive` (boolean, false if banned)

- **Category**: Entity for organizing quotes with properties: `id` (string, e.g., "wisdom", "compassion", "mindfulness"), `nameVi` (string, Vietnamese name), `nameEn` (string, English name), `description` (string), `icon` (string, optional emoji or icon identifier)

- **UserQuoteSubmission**: Entity for tracking user-submitted quotes awaiting moderation with properties: `id` (string, GUID), `quoteId` (string, GUID of the Quote entity), `userId` (string, user who submitted), `status` (string, "pending" | "approved" | "rejected"), `submittedAt` (ISO 8601 timestamp), `reviewedAt` (ISO 8601 timestamp, optional), `reviewedBy` (string, admin user ID, optional), `rejectionReason` (string, optional)

- **AuditLog**: Entity for tracking admin actions with properties: `id` (string, GUID), `userId` (string, admin user ID), `action` (string, e.g., "QUOTE_APPROVED", "USER_BANNED", "QUOTE_DELETED"), `targetId` (string, ID of affected entity), `targetType` (string, "Quote" | "User"), `timestamp` (ISO 8601 timestamp), `details` (JSON object with additional context)

## Success Criteria

### Measurable Outcomes

- **SC-001**: API endpoints respond to 95% of requests within 500ms under normal load (100 concurrent users) and within 2 seconds under peak load (1000 concurrent users), measured via Azure Application Insights performance metrics

- **SC-002**: Admin Center successfully manages 10,000+ quotes with pagination, search, and filtering without performance degradation (page load time < 2 seconds)

- **SC-003**: User authentication completes within 3 seconds for 99% of login attempts across all three social providers (Google, Facebook, Microsoft), measured from "Sign in" button click to JWT token receipt

- **SC-004**: Client applications successfully sync quote data from Azure API with 99.9% success rate when online, and gracefully degrade to offline mode with cached data when connection is unavailable

- **SC-005**: System costs remain under $20/month for the first 10,000 users and 1 million API requests, leveraging Azure Functions consumption plan (pay-per-execution) and Azure Blob Storage (low-cost object storage)

- **SC-006**: Azure Blob Storage maintains 99.99% availability for quote data files, with automatic geo-redundancy (LRS or GRS) ensuring data durability

- **SC-007**: 100% of API endpoints documented in Swagger UI with accurate request/response schemas, enabling developers to integrate client applications without external documentation

- **SC-008**: Admin Center allows admins to moderate user-submitted quotes with average processing time under 30 seconds per quote (view, edit if needed, approve/reject)

- **SC-009**: Role-based access control correctly enforces permissions for 100% of API requests, with unauthorized requests returning 403 Forbidden and unauthenticated requests returning 401 Unauthorized

- **SC-010**: System handles 1,000 concurrent authenticated users submitting quotes simultaneously without data loss or corruption, verified through load testing

- **SC-011**: All admin actions (quote edits, user bans, approvals) are logged in Azure Application Insights with 100% audit trail coverage for compliance and debugging

- **SC-012**: Client applications (Angular, React Native, Electron) successfully integrate with Azure API without breaking existing offline functionality, maintaining backward compatibility with local JSON structure

- **SC-013**: Infrastructure deployments via Bicep templates complete in under 5 minutes for full stack (Resource Group, Storage, Functions, Static Web App, Application Insights) with zero manual Azure Portal configuration required. Deployments MUST be idempotent (re-running same template produces same result)

- **SC-014**: 100% of sensitive credentials (OAuth secrets, connection strings, API keys) are stored in Azure Key Vault with zero secrets hardcoded in source code, configuration files, or environment variables. Automated security scans (e.g., GitHub secret scanning, Azure DevOps credential scanner) detect no exposed secrets in repository

## Assumptions

- **Azure Free Tier**: Assuming usage stays within Azure Free Tier limits for first 12 months (1 million Azure Functions executions, 5GB Blob Storage, 1GB Application Insights data) to minimize costs.

- **OAuth Provider Availability**: Assuming Google, Facebook, and Microsoft OAuth services maintain 99.9% uptime. No SLA guarantee from free developer accounts.

- **Existing Client Interfaces**: Assuming current client applications (Angular, React Native, Electron) use a shared Quote interface compatible with the JSON structure: `{ id, content, author, category, tags, type }`. API will maintain this structure.

- **Admin Account Bootstrap**: Assuming initial admin account will be manually configured in Azure AD B2C or hardcoded in Azure Functions (email whitelist). No self-service admin registration.

- **Content Moderation Scope**: Assuming manual admin moderation is sufficient for MVP. No AI-based profanity filtering or automated content analysis.

- **Data Volume**: Assuming quote collection grows to ~10,000 public quotes and ~100 personal quotes per user on average. Blob Storage files remain under 10MB each.

- **Geo-Distribution**: Assuming users are primarily in one geographic region (e.g., Vietnam or North America). No multi-region deployment or CDN for MVP.

- **HTTPS Only**: Assuming all API communication occurs over HTTPS. Azure Functions default to HTTPS. No HTTP support.

- **Stateless API**: Assuming API is stateless (no server-side sessions). Authentication state managed via JWT tokens. Azure Functions naturally stateless.

- **Client Backward Compatibility**: Assuming existing client applications can be updated to call Azure API. If not, a migration guide will be provided for integrating the new endpoints.

- **Key Vault Access**: Assuming Azure Functions system-assigned managed identity has sufficient permissions to access Key Vault secrets. No service principal or manual key rotation required for MVP.

## Dependencies

- **Azure Subscription**: Active Azure subscription (free tier acceptable for MVP). Required for deploying Azure Functions, Blob Storage, Static Web Apps, Application Insights.

- **Azure AD B2C Tenant**: Configured Azure AD B2C tenant with social identity providers (Google, Facebook, Microsoft) registered. Requires OAuth app registrations on each platform.

- **Azure Key Vault**: Azure Key Vault instance for secure storage of secrets (OAuth client secrets, storage connection strings, API keys). Function App requires system-assigned managed identity with Key Vault "Get" and "List" permissions.

- **Development Tools**: Visual Studio Code, Azure Functions Core Tools, .NET 8 SDK, Node.js 20+, npm or yarn, Azure CLI, Azure Bicep CLI (for Infrastructure as Code deployments).

- **OAuth Provider Accounts**: Developer accounts on Google Cloud Console, Facebook Developers, Azure AD (Microsoft) for creating OAuth apps and obtaining client IDs/secrets.

- **Existing Client Codebases**: Access to `quotes-platform` (Angular), `quotes-native` (React Native), `quotes-electron` repositories for integration testing.

- **Domain Name (Optional)**: Custom domain for Admin Center (e.g., `admin.buddhistquotes.com`). Azure Static Web Apps provide default `*.azurestaticapps.net` domain for free.

- **SSL Certificate (Optional)**: SSL certificate for custom domain (Azure provides free SSL for Static Web Apps default domains and managed certificates for custom domains).

- **Testing Tools**: Postman or REST Client for API testing, Jest for unit tests, Playwright or Cypress for Admin Center E2E tests.

## Non-Goals (Out of Scope for MVP)

- **Real-time Collaboration**: No WebSocket or SignalR support for real-time quote updates or collaborative editing.

- **Mobile Admin App**: Admin Center is web-only (React SPA). No dedicated iOS/Android admin app.

- **AI-Powered Features**: No AI-based quote recommendations, sentiment analysis, or automated categorization.

- **Multi-Language Admin UI**: Admin Center UI is English-only. Quotes themselves support Vietnamese and English content.

- **Advanced Search**: No full-text search with Elasticsearch or Azure Cognitive Search. Basic filtering by category, author, and keyword in client-side code.

- **Payment/Monetization**: No user subscriptions, premium features, or payment processing.

- **Social Features**: No user profiles, following, likes, comments, or sharing to social media.

- **Content Versioning**: No quote edit history or rollback capabilities.

- **Scheduled Publishing**: No ability to schedule quote publication at a future date/time.

- **Multi-Tenancy**: Single-tenant system. No organization accounts or workspace isolation.

- **Custom Themes**: No user-customizable themes or UI personalization in Admin Center.

- **Mobile-Optimized Admin Center**: Admin Center designed for desktop browsers (1280px+). Mobile responsive layout is a future enhancement.

---

**Next Steps**: Proceed to `plan.md` to define architecture, tech stack, and implementation phases.
