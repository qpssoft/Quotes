# Client Authentication Implementation

## Overview

Implemented a shared authentication system for all client platforms (Admin Center, React Native Mobile, Electron Desktop) using a common base service with platform-specific storage adapters.

## Architecture

```
shared-modules/src/services/
├── auth.service.ts          # Auth interfaces, types, and mock accounts
├── auth-base.service.ts     # Base implementation with common logic  
├── http-client.service.ts   # HTTP client abstraction (fetch-based)
└── storage.service.ts       # Storage interface (existing)

Platform Implementations:
├── quotes-admin/            # Web (localStorage - existing)
├── quotes-native/           # React Native (AsyncStorage)
└── quotes-electron/         # Electron (electron-store)
```

## Shared Components

### 1. Auth Service Interface (`auth.service.ts`)

**Core Types:**
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Contributor' | 'Authenticated';
  provider: 'email' | 'google' | 'facebook' | 'microsoft';
  profilePicture?: string;
  createdAt?: string;
  lastLogin?: string;
}

interface LoginRequest {
  email: string;
  name?: string;
  provider?: string;
  profilePicture?: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

interface IAuthService {
  login(request: LoginRequest): Promise<LoginResponse>;
  logout(): Promise<void>;
  refreshToken(): Promise<string>;
  getCurrentUser(): Promise<User>;
  getAccessToken(): Promise<string | null>;
  getRefreshToken(): Promise<string | null>;
  getUser(): Promise<User | null>;
  isAuthenticated(): Promise<boolean>;
  isAdmin(): Promise<boolean>;
  isContributor(): Promise<boolean>;
}
```

**Mock Authentication:**
- Three predefined accounts: Admin, Contributor, User
- Configurable via `useMockAuth` option
- Same storage behavior as real auth
- Useful for automated testing and offline development

**Mock Accounts:**
```typescript
admin@test.com        → Admin role
contributor@test.com  → Contributor role
user@test.com         → Authenticated role
any other email       → Authenticated role (default)
```

### 2. Base Auth Service (`auth-base.service.ts`)

**Features:**
- ✅ Email login (MVP implementation)
- ✅ OAuth providers (placeholder for future)
- ✅ Token storage and retrieval
- ✅ Automatic token refresh
- ✅ Mock authentication mode
- ✅ Error handling with typed errors
- ✅ Platform-agnostic via dependency injection

**Configuration:**
```typescript
interface AuthServiceConfig {
  apiBaseUrl: string;          // Backend API URL
  useMockAuth?: boolean;       // Enable mock authentication
  autoRefresh?: boolean;       // Auto-refresh expired tokens
}
```

**Key Methods:**
- `login()` - Email login or mock login
- `logout()` - Clear tokens and call backend
- `refreshToken()` - Refresh access token
- `getCurrentUser()` - Fetch user profile from backend
- `isAuthenticated()` - Check auth status
- `isAdmin()` / `isContributor()` - Role checks

### 3. HTTP Client (`http-client.service.ts`)

**Abstract Interface:**
```typescript
interface IHttpClient {
  get<T>(url: string, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>>;
  post<T>(url: string, data?: any, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>>;
  put<T>(url: string, data?: any, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>>;
  delete<T>(url: string, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>>;
  setAuthToken(token: string | null): void;
}
```

**Fetch Implementation:**
- Uses native `fetch` API (works in React Native and Electron)
- Automatic JSON parsing
- Bearer token authentication
- Configurable timeouts
- Error handling with `HttpError` type

## Platform Implementations

### React Native (`quotes-native`)

**File:** `src/services/auth/NativeAuthService.ts`

```typescript
// AsyncStorage wrapper
class AsyncStorageService implements IStorageService {
  // Implements getItem, setItem, removeItem, clear, getAllKeys
}

// Factory function
export function getNativeAuthService(config?: AuthServiceConfig): BaseAuthService

// Usage
import { getNativeAuthService } from './services/auth/NativeAuthService';

const authService = getNativeAuthService({
  apiBaseUrl: 'http://localhost:7071/api/v1',
  useMockAuth: true,
});

await authService.login({ email: 'admin@test.com', name: 'Test Admin' });
```

**React Hook:** `src/hooks/useAuth.tsx`

```typescript
export function AuthProvider({ children, apiUrl, useMockAuth }) {
  // Manages auth state
}

export function useAuth() {
  // Returns { user, isAuthenticated, login, logout, refreshUser, ... }
}

export function useAuthRole() {
  // Returns { isAdmin, isContributor, isAuthenticated }
}
```

### Electron (`quotes-electron`)

**File:** `main/auth-service.ts`

```typescript
// Electron Store wrapper (encrypted storage)
class ElectronStorageService implements IStorageService {
  // Uses electron-store with encryption
}

// Factory function
export function getElectronAuthService(config?: AuthServiceConfig): BaseAuthService

// Usage
import { getElectronAuthService } from './main/auth-service';

const authService = getElectronAuthService({
  apiBaseUrl: 'http://localhost:7071/api/v1',
  useMockAuth: false,
});
```

**Storage:**
- Encrypted using `electron-store`
- Persists across app restarts
- Secure token storage

### Admin Center (`quotes-admin`) - Already Implemented

**File:** `src/services/authService.ts`

Uses browser `localStorage` with similar pattern
Mock auth already implemented

## Features

### Authentication Flow

1. **Login:**
   ```typescript
   const response = await authService.login({
     email: 'admin@test.com',
     name: 'Test Admin'
   });
   // Returns: { accessToken, refreshToken, expiresIn, user }
   ```

2. **Token Storage:**
   - Access token → `quotes_access_token`
   - Refresh token → `quotes_refresh_token`
   - User data → `quotes_user` (JSON)

3. **Automatic Token Refresh:**
   - On 401 Unauthorized, automatically refresh token
   - Retry failed request with new token
   - If refresh fails, clear auth and force re-login

4. **Logout:**
   ```typescript
   await authService.logout();
   // Clears local storage and calls backend logout endpoint
   ```

### Mock Authentication Mode

**Enable:**
```typescript
// React Native
const authService = getNativeAuthService({
  apiBaseUrl: 'http://localhost:7071/api/v1',
  useMockAuth: true,  // Enable mock mode
});

// Electron
const authService = getElectronAuthService({
  apiBaseUrl: 'http://localhost:7071/api/v1',
  useMockAuth: true,
});
```

**Behavior:**
- Bypasses all backend API calls
- Uses predefined mock accounts
- Generates unique tokens with timestamps
- Same storage and state management as real auth
- Console logs show `[MOCK AUTH]` prefix

### Role-Based Access Control

```typescript
// Check authentication
const isAuth = await authService.isAuthenticated();

// Check roles
const isAdmin = await authService.isAdmin();
const isContributor = await authService.isContributor();

// Get user
const user = await authService.getUser();
if (user?.role === 'Admin') {
  // Admin-only functionality
}
```

## Usage Examples

### React Native Component

```typescript
import { useAuth } from '../hooks/useAuth';

function LoginScreen() {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login({
        email: 'admin@test.com',
        name: 'Test Admin'
      });
      // Navigate to home screen
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <View>
      <TextInput placeholder="Email" />
      <TextInput placeholder="Name" />
      <Button onPress={handleLogin} title="Login" disabled={isLoading} />
      {error && <Text>{error}</Text>}
    </View>
  );
}

function HomeScreen() {
  const { user, logout, isAuthenticated } = useAuth();
  const { isAdmin } = useAuthRole();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <View>
      <Text>Welcome, {user?.name}!</Text>
      {isAdmin && <Text>Admin Panel</Text>}
      <Button onPress={logout} title="Logout" />
    </View>
  );
}
```

### Electron Main Process

```typescript
import { app, BrowserWindow, ipcMain } from 'electron';
import { getElectronAuthService } from './main/auth-service';

const authService = getElectronAuthService({
  apiBaseUrl: process.env.VITE_API_URL || 'http://localhost:7071/api/v1',
  useMockAuth: process.env.VITE_MOCK_AUTH === 'true',
});

// IPC handlers for renderer process
ipcMain.handle('auth:login', async (event, request) => {
  return await authService.login(request);
});

ipcMain.handle('auth:logout', async () => {
  return await authService.logout();
});

ipcMain.handle('auth:getUser', async () => {
  return await authService.getUser();
});

ipcMain.handle('auth:isAuthenticated', async () => {
  return await authService.isAuthenticated();
});
```

## Storage Keys

All platforms use the same storage keys for consistency:

```typescript
AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'quotes_access_token',
  REFRESH_TOKEN: 'quotes_refresh_token',
  USER: 'quotes_user',
}
```

## Error Handling

```typescript
enum AuthErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

class AuthError extends Error {
  type: AuthErrorType;
  statusCode?: number;
}

// Usage
try {
  await authService.login(request);
} catch (error) {
  if (error instanceof AuthError) {
    if (error.type === AuthErrorType.INVALID_CREDENTIALS) {
      // Show invalid credentials message
    } else if (error.type === AuthErrorType.NETWORK_ERROR) {
      // Show network error message
    }
  }
}
```

## Testing

### Mock Authentication

```typescript
// Enable mock auth for testing
const authService = getNativeAuthService({
  apiBaseUrl: 'http://localhost:7071/api/v1',
  useMockAuth: true,
});

// Test login with admin account
await authService.login({
  email: 'admin@test.com',
  name: 'Test Admin'
});

// Verify tokens stored
const accessToken = await authService.getAccessToken();
const user = await authService.getUser();
expect(accessToken).toContain('mock_admin_access_token_');
expect(user?.role).toBe('Admin');
```

### Unit Tests

```typescript
describe('BaseAuthService', () => {
  let authService: BaseAuthService;
  let mockHttpClient: jest.Mocked<IHttpClient>;
  let mockStorage: jest.Mocked<IStorageService>;

  beforeEach(() => {
    mockHttpClient = createMockHttpClient();
    mockStorage = createMockStorage();
    authService = new BaseAuthService(mockHttpClient, mockStorage, {
      apiBaseUrl: 'http://localhost:7071/api/v1',
      useMockAuth: false,
    });
  });

  it('should login successfully', async () => {
    const response = await authService.login({
      email: 'test@example.com',
      name: 'Test User'
    });
    
    expect(response.accessToken).toBeDefined();
    expect(response.user.email).toBe('test@example.com');
  });

  it('should handle login errors', async () => {
    mockHttpClient.post.mockRejectedValue(new Error('Network error'));
    
    await expect(authService.login({
      email: 'test@example.com'
    })).rejects.toThrow(AuthError);
  });
});
```

## Dependencies

### Shared Modules
- TypeScript 5.4+
- No runtime dependencies (interfaces only)

### React Native
- `@react-native-async-storage/async-storage` - Storage implementation
- `react` 18+ - Context and hooks
- `@quotes/shared-modules` - Shared types and base service

### Electron
- `electron-store` - Encrypted storage
- `electron` - IPC communication
- `@quotes/shared-modules` - Shared types and base service

## Next Steps

1. **Complete React Native Integration:**
   - Fix React type compatibility issues
   - Add login/logout screens
   - Implement protected route navigation
   - Add biometric authentication option

2. **Complete Electron Integration:**
   - Install `electron-store` dependency
   - Set up IPC handlers in main process
   - Create renderer process auth context
   - Add system tray authentication status

3. **OAuth Providers:**
   - Implement Google OAuth flow
   - Implement Facebook OAuth flow
   - Implement Microsoft OAuth flow
   - Add OAuth callback handling

4. **Security Enhancements:**
   - Add token expiration checking
   - Implement secure token storage (Keychain/Keystore)
   - Add PKCE for OAuth flows
   - Implement rate limiting

5. **Testing:**
   - Add unit tests for all services
   - Add E2E tests for auth flows
   - Add integration tests with mock backend
   - Test token refresh scenarios

## Files Created/Modified

### Created:
- `shared-modules/src/services/auth.service.ts` - Auth interfaces and types
- `shared-modules/src/services/auth-base.service.ts` - Base implementation
- `shared-modules/src/services/http-client.service.ts` - HTTP client
- `quotes-native/src/services/auth/NativeAuthService.ts` - React Native implementation
- `quotes-native/src/hooks/useAuth.tsx` - React Native auth hook
- `quotes-electron/main/auth-service.ts` - Electron implementation

### Modified:
- `shared-modules/src/services/index.ts` - Export new services
- `quotes-admin/src/services/authService.ts` - Already has mock auth

---

**Status:** ✅ Core authentication infrastructure complete  
**Date:** November 23, 2025  
**Next:** Install dependencies and integrate into apps
