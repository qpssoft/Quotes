# API Integration Guide - Quotes Platform (Angular)

## Overview

The Quotes Platform Angular app now integrates with the Azure Functions backend API to fetch quotes dynamically. It includes automatic fallback to local JSON data if the backend is unavailable.

## Features

✅ **Backend API Integration**: Fetches quotes from `http://localhost:7071/api/v1/quotes`  
✅ **Automatic Fallback**: Uses local `data/quotes.json` if API is unavailable  
✅ **Connection Status**: Visual indicator shows backend connection status  
✅ **Error Handling**: Retry logic with timeout and proper error messages  
✅ **Environment Configuration**: Separate configs for dev and production  

## Architecture

### Services

#### `ApiService`
- **Location**: `src/app/core/services/api.service.ts`
- **Purpose**: HTTP client for backend API communication
- **Methods**:
  - `getAllQuotes(params?)`: Fetch all public quotes with optional filters
  - `getQuoteById(id)`: Fetch a single quote by ID
  - `checkHealth()`: Test backend API availability

#### `DataService`
- **Location**: `src/app/core/services/data.service.ts`
- **Purpose**: Quote data management with caching
- **Features**:
  - Tries backend API first
  - Falls back to local JSON on failure
  - Caches quotes in memory
  - Provides search and filter capabilities

### Models

#### `Quote` Interface
```typescript
interface Quote {
  id: string;
  content: string;
  author: string;
  category: 'quote' | 'proverb' | 'cadao' | 'saying';
  type: string;
  language?: 'vi' | 'en';
  tags?: string[];
}
```

#### API Response Mapper
The `mapApiQuoteToQuote()` function transforms backend API responses to the frontend Quote model.

### Environment Configuration

#### Development (`src/environments/environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:7071/api/v1',
  apiTimeout: 10000, // 10 seconds
};
```

#### Production (`src/environments/environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-function-app.azurewebsites.net/api/v1',
  apiTimeout: 15000, // 15 seconds
};
```

## Usage

### Starting the Application

1. **Start the backend API** (in `quotes-backend`):
   ```powershell
   cd quotes-backend
   .\start-backend.ps1
   ```

2. **Start the Angular app** (in `quotes-platform`):
   ```powershell
   cd quotes-platform
   npm start
   ```

3. Open browser at `http://localhost:4200`

### Connection Status Indicator

The rotation controls display the backend connection status:
- 🟢 **API Backend**: Connected to backend API
- 🔴 **Local Data**: Using local fallback data

Hover over the status indicator for more details.

### API Query Parameters

The backend API supports filtering:

```typescript
// Filter by language
dataService.getAllQuotes({ language: 'vi' });

// Filter by category
dataService.getAllQuotes({ category: 'wisdom' });

// Filter by author
dataService.getAllQuotes({ author: 'Buddha' });

// Filter by type
dataService.getAllQuotes({ type: 'quote' });

// Combine filters
dataService.getAllQuotes({ 
  language: 'vi', 
  category: 'wisdom',
  type: 'quote'
});
```

## Error Handling

### Retry Logic
- Automatic retry: 2 attempts with 1-second delay
- Timeout: 10 seconds (dev), 15 seconds (prod)

### Error Types
- **Network Error**: Connection refused, timeout
- **400**: Invalid query parameters
- **404**: Quote not found
- **429**: Rate limit exceeded
- **500**: Server error

### Fallback Behavior
When the backend API fails:
1. Error logged to console
2. Automatic fallback to `data/quotes.json`
3. Status indicator shows "Local Data"
4. App continues to function normally

## Testing

### Test Backend Connection

```typescript
import { inject } from '@angular/core';
import { ApiService } from './core/services/api.service';

const apiService = inject(ApiService);
const isHealthy = await apiService.checkHealth();
console.log('Backend API available:', isHealthy);
```

### Test Data Loading

```typescript
import { inject } from '@angular/core';
import { DataService } from './core/services/data.service';

const dataService = inject(DataService);
const quotes = await dataService.loadQuotes();
console.log('Loaded quotes:', quotes.length);
console.log('Using backend:', dataService.isBackendAvailable());
```

## Development Tips

### Disable Backend API (Testing Fallback)
```typescript
// In data.service.ts, change:
private useBackendApi = false;

// Or programmatically:
dataService.setUseBackendApi(false);
await dataService.reloadQuotes();
```

### Enable Verbose Logging
Open browser DevTools Console to see:
- API request attempts
- Fallback activation
- Quote loading status
- Error messages

### CORS Configuration
The backend is configured to accept requests from:
- `http://localhost:4200` (Angular dev server)
- `http://localhost:3000` (React admin)
- `capacitor://localhost` (Capacitor mobile apps)

## Production Deployment

### Update API URL

1. Edit `src/environments/environment.prod.ts`:
   ```typescript
   apiUrl: 'https://your-quotes-api.azurewebsites.net/api/v1'
   ```

2. Build for production:
   ```bash
   npm run build
   ```

3. Deploy `dist/quotes-platform/browser` to your hosting provider

### Backend CORS Update

Ensure your production domain is added to `CorsMiddleware.cs`:

```csharp
var allowedOrigins = new[]
{
    "http://localhost:4200",
    "https://yourdomain.com",
    "https://www.yourdomain.com"
};
```

## API Documentation

Full API documentation: [docs/client-integration.md](../../docs/client-integration.md)

### Public Endpoints

- `GET /api/v1/quotes` - Get all public quotes
- `GET /api/v1/quotes/{id}` - Get quote by ID

### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `language` | string | Filter by language (`vi`, `en`) | `?language=vi` |
| `category` | string | Filter by category | `?category=wisdom` |
| `author` | string | Filter by author | `?author=Buddha` |
| `type` | string | Filter by type | `?type=quote` |

## Troubleshooting

### Backend Not Connecting

**Symptoms**: Status shows "🔴 Local Data"

**Solutions**:
1. Verify backend is running: `http://localhost:7071/api/v1/quotes`
2. Check console for CORS errors
3. Ensure firewall allows port 7071
4. Restart backend: `.\stop-backend.ps1` then `.\start-backend.ps1`

### Empty Quote List

**Symptoms**: No quotes displayed

**Solutions**:
1. Check browser console for errors
2. Verify `public/data/quotes.json` exists
3. Ensure backend has seeded data
4. Try: `dataService.reloadQuotes()`

### CORS Errors

**Symptoms**: "CORS policy blocked" in console

**Solutions**:
1. Verify Angular dev server runs on port 4200
2. Check backend CORS configuration includes `http://localhost:4200`
3. Restart both backend and frontend

## Next Steps

- [ ] Implement quote submission (authenticated endpoint)
- [ ] Add user authentication with JWT
- [ ] Implement quote favorites/bookmarks
- [ ] Add offline mode with service worker
- [ ] Implement real-time quote updates via WebSockets

## Related Files

- `src/app/core/services/api.service.ts` - Backend API client
- `src/app/core/services/data.service.ts` - Data management
- `src/app/core/models/quote.model.ts` - Quote type definitions
- `src/environments/environment.ts` - Dev configuration
- `src/environments/environment.prod.ts` - Prod configuration
- `src/app/app.config.ts` - Angular HTTP client setup

## Support

For issues or questions:
- Backend API: See `quotes-backend/README.md`
- Integration Guide: See `docs/client-integration.md`
- GitHub Issues: [Project Repository]

---

**Last Updated**: November 25, 2025  
**Version**: 1.0.0  
**Angular Version**: 20.3.0
