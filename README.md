# Quotes Platform - Monorepo

A comprehensive Buddhist quotes platform featuring Vietnamese wisdom, proverbs (Tục Ngữ), and folk songs (Ca Dao) with automatic rotation, search, and customization features.

## 📁 Repository Structure

This is a monorepo containing multiple components:

```
Quotes/
├── quotes-platform/     # Main Angular application (Web)
├── quotes-native/       # React Native application (Mobile + Web)
├── quotes-backend/      # Azure Functions API (Backend)
├── quotes-admin/        # Admin center (React + Static Web App)
├── quotes-electron/     # Electron desktop application
├── infrastructure/      # Azure Bicep templates for deployment
├── specs/              # Feature specifications and design documents
├── documents/          # Additional documentation and references
├── .specify/           # Specify framework configuration and templates
└── .github/            # GitHub workflows and configurations
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Angular CLI 18.x or higher

### Getting Started

```bash
# Clone the repository
git clone https://github.com/qpssoft/Quotes.git
cd Quotes

# Navigate to the application
cd quotes-platform

# Install dependencies
npm install

# Start development server
npm start
```

Visit `http://localhost:4200/` in your browser.

## 📦 Main Components

### quotes-backend/

Azure Functions-based REST API providing:

- **RESTful API**: 19 documented endpoints with OpenAPI/Swagger
- **Authentication**: JWT-based auth with access/refresh tokens
- **Role-Based Access**: Anonymous, Authenticated, Contributor, Admin roles
- **Quote Management**: CRUD operations with submission workflow
- **User Management**: Admin panel for user moderation
- **Rate Limiting**: Role-based request limits (100-1000 req/min)
- **Blob Storage**: Azure Storage for quotes and user data
- **Application Insights**: Telemetry and monitoring
- **CORS Support**: Cross-origin requests for web clients

**Technology Stack:**
- .NET 8 (Isolated Worker)
- Azure Functions v4
- Azure Storage (Blob)
- Azure Key Vault (secrets)
- Azure Application Insights
- OpenAPI/Swagger documentation
- JWT authentication (HS256)

**API Endpoints:**
- Public: GET /v1/quotes, GET /v1/quotes/{id}
- Auth: POST /v1/auth/login, GET /v1/auth/me, POST /v1/auth/logout, POST /v1/auth/refresh
- Quotes: POST /v1/quotes, PUT /v1/quotes/{id}, DELETE /v1/quotes/{id}, GET /v1/users/me/quotes
- Admin: GET /v1/admin/submissions, PUT /v1/admin/quotes/{id}/approve, PUT /v1/admin/quotes/{id}/reject
- Users: GET /v1/admin/users, PUT /v1/admin/users/{id}, DELETE /v1/admin/users/{id}, PUT /v1/admin/users/{id}/ban

**Key Documentation:**
- [Backend README](./quotes-backend/README.md)
- [API Documentation](./docs/client-integration.md)
- [Key Vault Configuration](./KEY_VAULT_CONFIG.md)
- [Security Scan Report](./SECURITY_SCAN_REPORT.md)

### quotes-admin/

React-based admin center for content moderation:

- **Submission Moderation**: Review and approve/reject user submissions
- **User Management**: Admin panel for managing users and roles
- **Quote Management**: CRUD interface for quotes
- **Authentication UI**: Login/logout with role management
- **Static Web App**: Deployed to Azure Static Web Apps

**Technology Stack:**
- React 18+
- TypeScript 5.x
- Azure Static Web Apps
- JWT authentication

**Key Documentation:**
- [Admin README](./quotes-admin/README.md)

### quotes-electron/

Cross-platform desktop application:

- **Windows Support**: Native Windows application with installer
- **macOS Support**: DMG installer with code signing
- **Linux Support**: AppImage and Snap packages
- **System Integration**: System tray, global shortcuts, auto-launch
- **Auto-Update**: Built-in update mechanism

**Technology Stack:**
- Electron 28+
- TypeScript 5.x
- electron-builder for packaging

**Key Documentation:**
- [Electron README](./quotes-electron/README.md)
- [Windows Packaging Guide](./quotes-electron/WINDOWS_PACKAGING_TEST.md)
- [macOS Packaging Guide](./quotes-electron/MACOS_PACKAGING_GUIDE.md)
- [Linux Packaging Guide](./quotes-electron/LINUX_PACKAGING_GUIDE.md)

### quotes-platform/

The primary Angular 18 application providing:

- **Continuous Quote Display**: Auto-rotating quotes with fade transitions
- **Playback Controls**: Play/Pause and Next buttons
- **Configurable Timer**: 5-60 second rotation intervals
- **Audio Notifications**: Gentle chime on transitions
- **Quote Grid**: Responsive browsable grid layout
- **Full-Text Search**: Real-time filtering across content, authors, and categories
- **Customizable Display**: Font selection and display count options
- **LocalStorage Persistence**: All preferences saved automatically
- **Buddhist-Inspired UI**: Warm colors and serene aesthetics

**Technology Stack:**
- Angular 18+ (Standalone Components)
- TypeScript 5.5+
- SCSS with CSS Custom Properties
- Angular Signals for reactive state
- Browser LocalStorage API

**Key Documentation:**
- [Application README](./quotes-platform/README.md)
- [Contributing Guide](./quotes-platform/CONTRIBUTING.md)

### quotes-native/

React Native cross-platform application with mobile and desktop support:

- **Cross-Platform**: iOS, Android, Web, and Windows desktop
- **Native Performance**: Platform-specific optimizations
- **Shared Codebase**: Single codebase for all platforms
- **Modern UI**: React Native components with native look and feel
- **Desktop Features**: System tray, global shortcuts, auto-launch (Windows)
- **Web Deployment**: Static site generation for GitHub Pages

**Technology Stack:**
- React Native 0.81+ with Expo
- TypeScript 5.9+
- React Navigation for routing
- Expo modules for cross-platform APIs
- React Native Windows for desktop

**Key Documentation:**
- [Implementation Status](./specs/002-react-native-expansion/PHASE4_WINDOWS_IMPLEMENTATION_STATUS.md)
- [C++ Conversion Report](./specs/002-react-native-expansion/PHASE4_CPP_CONVERSION_REPORT.md)

### specs/

Feature specifications and design documents using the Specify framework:

- **001-quote-display/**: Complete specification for the quote display feature
  - `spec.md`: User stories with priorities and acceptance criteria
  - `plan.md`: Technical implementation plan and architecture
  - `data-model.md`: Content entities and relationships
  - `research.md`: Technical decisions and research findings
  - `quickstart.md`: Development test scenarios
  - `tasks.md`: Implementation task breakdown
  - `checklists/`: Quality assurance and requirements tracking

### documents/

Additional documentation and quick references:

- `FIGMA_QUICK_REFERENCE.md`: Design system and Figma integration guide

## 🎯 Features

### Core Functionality

- ✅ **Continuous Auto-Rotation**: Seamless quote transitions with configurable timing
- ✅ **Manual Controls**: Pause, resume, and skip to next quote
- ✅ **Audio Feedback**: Gentle notification sound on each transition
- ✅ **Responsive Grid**: Browse multiple quotes simultaneously
- ✅ **Real-Time Search**: Filter by keyword, author, or category
- ✅ **Customization**: Timer intervals, fonts, and display count
- ✅ **Persistence**: User preferences saved across sessions
- ✅ **Accessibility**: WCAG 2.1 compliant with keyboard navigation
- ✅ **Mobile Optimized**: Touch-friendly with responsive layouts (320px to 4K)

### Content Support

- **Buddhist Quotes** (Lời Phật Dạy): Wisdom teachings and dharma insights
- **Vietnamese Proverbs** (Tục Ngữ): Traditional sayings and wisdom
- **Folk Songs** (Ca Dao): Cultural heritage and poetic expressions
- **UTF-8 Support**: Full Vietnamese diacritics rendering

## 🛠️ Development

### Project Setup

```bash
# Install dependencies
cd quotes-platform
npm install

# Start dev server with live reload
npm start

# Run tests
npm test

# Build for production
npm run build
```

### Development Workflow

1. **Spec-Driven Development**: All features start with specifications in `specs/`
2. **Task-Based Implementation**: Follow task breakdown in `tasks.md`
3. **Component-First Architecture**: Standalone Angular components
4. **Type Safety**: Strict TypeScript configuration
5. **CSS Custom Properties**: Theme-based styling system

### Code Structure

```
quotes-platform/src/app/
├── core/
│   ├── models/          # TypeScript interfaces and types
│   └── services/        # Business logic and state management
├── features/
│   ├── controls/        # Rotation controls component
│   ├── quote-display/   # Continuous display component
│   └── quote-grid/      # Grid browsing component
└── shared/
    └── components/      # Reusable UI components
```

## 🌍 Deployment

### Azure Backend (Production)

The backend API is deployed to Azure using Infrastructure as Code (Bicep):

**Azure Resources:**
- **Function App**: `quotes-func-{env}` - Serverless API
- **Storage Account**: `quotesstorage{env}` - Blob storage for data
- **Key Vault**: `quotes-kv-{env}` - Secrets management
- **Application Insights**: `quotes-insights-{env}` - Monitoring
- **Static Web App**: `quotes-admin-{env}` - Admin center
- **App Configuration**: `quotes-appconfig-{env}` - Configuration management

**Environments:**
- `dev`: Development environment for testing
- `staging`: Pre-production environment
- `production`: Live production environment

#### Prerequisites

- Azure subscription
- Azure CLI 2.50+ or Azure PowerShell
- .NET 8 SDK
- Azure Functions Core Tools v4

#### Deploy to Azure

1. **Login to Azure:**
   ```bash
   az login
   az account set --subscription <your-subscription-id>
   ```

2. **Deploy Infrastructure:**
   ```bash
   cd infrastructure
   
   # Deploy to dev environment
   az deployment sub create \
     --location eastus \
     --template-file main.bicep \
     --parameters environment=dev
   
   # Deploy to production
   az deployment sub create \
     --location eastus \
     --template-file main.bicep \
     --parameters environment=production
   ```

3. **Configure Key Vault Secrets:**
   ```bash
   # See KEY_VAULT_CONFIG.md for detailed instructions
   
   # Set JWT secret (generate secure 256-bit key)
   az keyvault secret set \
     --vault-name quotes-kv-production \
     --name JwtSecretKey \
     --value "<your-secure-key>"
   
   # Verify all secrets
   cd infrastructure
   pwsh ./verify-keyvault.ps1 -Environment production
   ```

4. **Deploy Function App:**
   ```bash
   cd quotes-backend/src/Quotes.Functions
   
   # Build and deploy
   dotnet publish -c Release
   
   # Deploy to Azure
   func azure functionapp publish quotes-func-production
   ```

5. **Deploy Admin Center:**
   ```bash
   cd quotes-admin
   
   # Build
   npm run build
   
   # Deploy to Azure Static Web App
   swa deploy ./build \
     --app-name quotes-admin-production \
     --env production
   ```

#### Verify Deployment

```bash
# Test health endpoint
curl https://quotes-func-production.azurewebsites.net/api/health

# Test API endpoint
curl https://quotes-func-production.azurewebsites.net/api/v1/quotes

# View Swagger documentation
open https://quotes-func-production.azurewebsites.net/api/swagger/ui
```

#### Monitoring

- **Application Insights**: Monitor performance and errors
- **Azure Portal**: View resource metrics and logs
- **Log Analytics**: Query application logs

```bash
# View recent logs
az monitor app-insights query \
  --app quotes-insights-production \
  --analytics-query "traces | take 100"
```

### GitHub Pages

Both applications are deployed automatically to GitHub Pages:

**Angular App (Main Site)**: [https://qpssoft.github.io/Quotes/](https://qpssoft.github.io/Quotes/)

**React Native Web App**: [https://qpssoft.github.io/Quotes/App](https://qpssoft.github.io/Quotes/App)

#### Automatic Deployment
Every push to `main` branch triggers automatic deployment via GitHub Actions. The workflow:
1. Builds Angular app from `quotes-platform/` subfolder → `/Quotes/`
2. Builds React Native web from `quotes-native/` subfolder → `/Quotes/App/`
3. Combines both builds into single deployment
4. Deploys to GitHub Pages
5. Goes live in 2-5 minutes

#### Manual Deployment

**Angular App:**
```bash
cd quotes-platform
npm run deploy:gh-pages
```

**React Native Web:**
```bash
cd quotes-native
npm run deploy:gh-pages
```

**For detailed deployment guide, troubleshooting, and configuration details, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

### Other Hosting Services

```bash
# Build for production
cd quotes-platform
ng build --configuration production --base-href /Quotes/

# Deploy dist/quotes-platform/browser/ to your hosting service
```

## 📊 Project Status

- **Current Version**: 1.0.0
- **Angular Version**: 18.x
- **Status**: ✅ Production Ready
- **Last Updated**: January 2025

### Completed Features

- ✅ User Story 1: Continuous Quote Contemplation (P1)
- ✅ User Story 2: Configurable Meditation Timer (P2)
- ✅ User Story 3: Quote Grid Browsing (P2)
- ✅ User Story 4: Quote Search and Filtering (P3)

## 🧪 Testing

### Unit Tests

```bash
cd quotes-platform
npm test
```

### Manual Testing Scenarios

See `specs/001-quote-display/quickstart.md` for detailed test scenarios including:
- Quote rotation functionality
- Timer configuration
- Search and filtering
- Responsive layout
- Audio notifications
- LocalStorage persistence

## 🎨 Customization

### Adding Quotes

Edit `quotes-platform/public/data/quotes.json`:

```json
{
  "id": "unique-id",
  "content": "Your quote text",
  "author": "Author name",
  "category": "wisdom",
  "type": "Quote"
}
```

### Theme Customization

Modify `quotes-platform/src/styles/theme.css`:

```css
:root {
  --primary-gold: #D4AF37;
  --primary-orange: #FF8C42;
  --bg-primary: #FFF8F0;
  /* Customize Buddhist color palette */
}
```

## 📄 Documentation

- **[Application README](./quotes-platform/README.md)**: Detailed app documentation
- **[Feature Spec](./specs/001-quote-display/spec.md)**: User stories and requirements
- **[Technical Plan](./specs/001-quote-display/plan.md)**: Architecture and implementation
- **[Data Model](./specs/001-quote-display/data-model.md)**: Entity definitions
- **[Task Breakdown](./specs/001-quote-display/tasks.md)**: Implementation checklist
- **[Contributing Guide](./quotes-platform/CONTRIBUTING.md)**: Development guidelines

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./quotes-platform/CONTRIBUTING.md) for:

- Code style guidelines
- Development workflow
- Pull request process
- Testing requirements

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Review specs in `specs/` directory
4. Follow the implementation plan in `tasks.md`
5. Write tests for new functionality
6. Submit a pull request with clear description

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/qpssoft/Quotes/issues)
- **Repository**: [https://github.com/qpssoft/Quotes](https://github.com/qpssoft/Quotes)
- **Documentation**: See `specs/` and `documents/` directories

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Buddhist quotes from public domain teachings
- Vietnamese cultural heritage (Tục Ngữ, Ca Dao)
- Google Fonts (Noto Serif, Merriweather, Lora, Playfair Display, Crimson Text)
- Audio notification: CC0 Public Domain
- Built with Angular 18 and TypeScript

---

**Trí Tuệ Phật Giáo • Nguồn Cảm Hứng Mỗi Ngày**  
*Buddhist Wisdom • Daily Inspiration*

Built with ❤️ by the QPS Software Team
