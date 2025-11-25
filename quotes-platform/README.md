# Trích Dẫn Phật Giáo (Buddhist Quotes Platform)

A modern web application for displaying and browsing Buddhist wisdom quotes, Vietnamese proverbs (Tục Ngữ), and folk songs (Ca Dao) with automatic rotation, search, and customization features.

## ✨ Features

### 🎯 Core Features
- **Continuous Quote Display**: Auto-rotating quotes at the top of the screen with smooth fade transitions
- **Playback Controls**: Play/Pause and Next buttons for manual control
- **Configurable Timer**: Adjust rotation interval from 5 to 60 seconds
- **Audio Notifications**: Gentle chime sounds on each quote transition
- **Quote Grid**: Browse multiple quotes in a responsive grid layout
- **Full-Text Search**: Real-time filtering across quote content, authors, and categories
- **Display Count**: Configure how many quotes to show (5-30 quotes)
- **Font Selection**: Choose from 6 beautiful serif fonts for optimal reading
- **LocalStorage Persistence**: All preferences saved and restored automatically
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Buddhist-Inspired UI**: Warm colors, gold accents, and serene aesthetics

### 🌐 Language Support
- Vietnamese (primary language)
- Full UTF-8 support for Vietnamese diacritics (ắ, ằ, ẳ, ẵ, ặ)
- English quotes also supported

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher
- Angular CLI 18.x or higher
- **Optional**: Azure Functions backend running on port 7071 (see Backend Integration)

### Installation

```bash
# Clone the repository
git clone https://github.com/qpssoft/Quotes-Platform.git
cd Quotes-Platform/quotes-platform

# Install dependencies
npm install

# Start development server
ng serve
```

Open your browser and navigate to `http://localhost:4200/`

### Backend Integration (Optional)

The app can fetch quotes from the Azure Functions backend API. If the backend is not available, it automatically falls back to local JSON data.

**To use backend API:**

1. Start the backend (from `quotes-backend` directory):
   ```powershell
   .\start-backend.ps1
   ```

2. Test the backend connection:
   ```powershell
   cd quotes-platform
   .\scripts\test-backend-api.ps1
   ```

3. Start the Angular app (it will automatically connect):
   ```bash
   npm start
   ```

**Connection Status**: Look for the status indicator in the controls:
- 🟢 **API Backend** = Connected to backend
- 🔴 **Local Data** = Using fallback JSON

For detailed API integration documentation, see [API_INTEGRATION.md](./API_INTEGRATION.md)

### Development Server

To start a local development server with live reload:

```bash
npm start
# or
ng serve
```

The application will automatically reload when you modify source files.

## 📦 Building for Production

### Local Production Build

```bash
# Build for production
npm run build

# Or with specific base href for GitHub Pages
ng build --configuration production --base-href /Quotes/
```

Build artifacts will be stored in the `dist/quotes-platform/browser/` directory.

### Test Production Build Locally

```bash
# Install http-server globally (one time)
npm install -g http-server

# Serve the production build
npx http-server dist/quotes-platform/browser -p 8080
```

Visit `http://localhost:8080` to test the production build.

## 🌍 Deployment

### GitHub Pages Deployment

**Live Site**: [https://qpssoft.github.io/Quotes/](https://qpssoft.github.io/Quotes/)

#### Automatic Deployment (Recommended)
Every push to `main` branch automatically deploys via GitHub Actions. No manual steps needed!

#### Manual Deployment
```bash
# From this directory (quotes-platform/)
npm run deploy:gh-pages
```

The application will be available at: `https://qpssoft.github.io/Quotes/`

**Note**: This project is in a monorepo. The deployment is configured to build from the `quotes-platform/` subfolder and deploy to the root GitHub Pages URL.

### Manual Deployment Steps

1. Build for production:
   ```bash
   ng build --configuration production --base-href /Quotes/
   ```

2. The build automatically creates:
   - `404.html` for SPA routing
   - `.nojekyll` to disable Jekyll processing

3. Deploy the `dist/quotes-platform/browser/` directory to your hosting service

### Troubleshooting

For detailed deployment configuration, troubleshooting, and GitHub Pages setup, see [DEPLOYMENT.md](../DEPLOYMENT.md) in the repository root.

## 🛠️ Technologies Used

- **Framework**: Angular 18+ (Standalone Components)
- **Language**: TypeScript 5.5+
- **Styling**: SCSS with CSS Custom Properties
- **State Management**: Angular Signals
- **HTTP Client**: Angular HttpClient with RxJS
- **Backend API**: Azure Functions (.NET) - Optional
- **Storage**: Browser LocalStorage API
- **Fonts**: Google Fonts (Noto Serif, Georgia, Merriweather, Lora, Playfair Display, Crimson Text)
- **Build Tool**: Angular CLI with esbuild
- **Deployment**: GitHub Pages

## 📁 Project Structure

```
quotes-platform/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── models/          # TypeScript interfaces and types
│   │   │   └── services/        # API, data, storage, audio, rotation services
│   │   ├── features/
│   │   │   ├── controls/        # Rotation controls component
│   │   │   ├── quote-display/   # Continuous display component
│   │   │   └── quote-grid/      # Grid browsing component
│   │   └── shared/
│   │       └── components/
│   │           └── quote-card/  # Reusable quote card component
│   ├── environments/           # API configuration (dev/prod)
│   ├── assets/
│   │   └── data/
│   │       └── quotes.json      # Quote database (fallback)
│   ├── styles/
│   │   └── theme.css            # Buddhist-inspired theme variables
│   └── index.html
├── public/
│   └── audio/
│       └── notification.mp3     # Gentle chime for transitions
└── specs/
    └── 001-quote-display/       # Feature specifications and tasks
```

## 🎨 Customization

### Adding New Quotes

Edit `public/data/quotes.json`:

```json
{
  "id": "q001",
  "content": "Your quote text here",
  "author": "Author name",
  "category": "quote",
  "type": "Quote"
}
```

**Categories**: `quote` (Lời Phật Dạy), `proverb` (Tục Ngữ), `cadao` (Ca Dao)

### Changing Theme Colors

Edit `src/styles/theme.css` to customize the Buddhist color palette:

```css
:root {
  --primary-gold: #D4AF37;
  --primary-orange: #FF8C42;
  --bg-primary: #FFF8F0;
  /* ... */
}
```

### Adjusting Rotation Intervals

Timer intervals are defined in `RotationControlsComponent`. Modify the `intervals` array to add custom durations.

## 🧪 Testing

### Unit Tests

```bash
npm test
# or
ng test
```

### End-to-End Tests (Optional)

```bash
# Install Playwright (if not already installed)
npm install -D @playwright/test

# Run e2e tests
npm run e2e
```

## 📊 Bundle Size

- **Initial Bundle**: ~125 KB (gzipped)
- **Lazy Loaded**: N/A (all components eager-loaded for performance)
- **Budget**: Max 2 MB (configured in angular.json)

## ♿ Accessibility

- ✅ Minimum 44x44px touch targets on mobile
- ✅ Minimum 16px font size for readability
- ✅ ARIA labels on all interactive elements
- ✅ Keyboard navigation support (Tab, Enter)
- ✅ Screen reader compatible
- ✅ No horizontal scrolling (320px to 4K)

## 🌏 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

This project is licensed under the MIT License.

## 👥 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and development process.

## 🙏 Acknowledgments

- Buddhist quotes sourced from public domain teachings
- Vietnamese proverbs and folk songs from cultural heritage
- Audio notification: Soft bell chime (CC0 Public Domain)
- Fonts: Google Fonts (Open Font License)

## 📞 Contact

For questions or feedback:
- GitHub Issues: [https://github.com/qpssoft/Quotes-Platform/issues](https://github.com/qpssoft/Quotes-Platform/issues)
- Repository: [https://github.com/qpssoft/Quotes-Platform](https://github.com/qpssoft/Quotes-Platform)

---

Built with ❤️ using Angular 18 | Trí Tuệ Phật Giáo • Nguồn Cảm Hứng Mỗi Ngày
