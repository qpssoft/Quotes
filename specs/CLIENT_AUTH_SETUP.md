# Client Authentication Setup Guide

## Quick Start

### 1. Install Dependencies

**React Native:**
```bash
cd quotes-native
npm install @react-native-async-storage/async-storage
```

**Electron:**
```bash
cd quotes-electron
npm install electron-store
```

### 2. Usage in React Native

**Wrap your app with AuthProvider:**
```typescript
// App.tsx
import { AuthProvider } from './src/hooks/useAuth';

export default function App() {
  return (
    <AuthProvider 
      apiUrl="http://localhost:7071/api/v1"
      useMockAuth={true}  // Set to false for production
    >
      <YourApp />
    </AuthProvider>
  );
}
```

**Use auth in components:**
```typescript
import { useAuth, useAuthRole } from './hooks/useAuth';

function LoginScreen() {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async () => {
    await login({
      email: 'admin@test.com',
      name: 'Test Admin'
    });
  };

  return <Button onPress={handleLogin} title="Login" />;
}

function DashboardScreen() {
  const { user, logout } = useAuth();
  const { isAdmin } = useAuthRole();

  return (
    <View>
      <Text>Welcome, {user?.name}!</Text>
      {isAdmin && <AdminPanel />}
      <Button onPress={logout} title="Logout" />
    </View>
  );
}
```

### 3. Usage in Electron

**Main process (IPC handlers):**
```typescript
// main/main.ts
import { ipcMain } from 'electron';
import { getElectronAuthService } from './auth-service';

const authService = getElectronAuthService({
  apiBaseUrl: 'http://localhost:7071/api/v1',
  useMockAuth: true,
});

ipcMain.handle('auth:login', (event, request) => authService.login(request));
ipcMain.handle('auth:logout', () => authService.logout());
ipcMain.handle('auth:getUser', () => authService.getUser());
```

**Renderer process (React):**
```typescript
// renderer/hooks/useAuth.ts
import { ipcRenderer } from 'electron';

export function useAuth() {
  const login = async (request: LoginRequest) => {
    return await ipcRenderer.invoke('auth:login', request);
  };

  const logout = async () => {
    return await ipcRenderer.invoke('auth:logout');
  };

  const getUser = async () => {
    return await ipcRenderer.invoke('auth:getUser');
  };

  return { login, logout, getUser };
}
```

## Mock Accounts

Use these accounts for testing:

```typescript
// Admin account
{
  email: 'admin@test.com',
  name: 'Test Admin',  // Optional
}

// Contributor account
{
  email: 'contributor@test.com',
  name: 'Test Contributor',
}

// Regular user account
{
  email: 'user@test.com',
  name: 'Test User',
}

// Any other email defaults to regular user
{
  email: 'anyone@example.com',
  name: 'Any Name',
}
```

## Environment Variables

**React Native (.env):**
```bash
REACT_APP_API_URL=http://localhost:7071/api/v1
REACT_APP_MOCK_AUTH=true
```

**Electron (.env):**
```bash
VITE_API_URL=http://localhost:7071/api/v1
VITE_MOCK_AUTH=true
```

## Testing

**Enable mock auth for tests:**
```typescript
const authService = getNativeAuthService({
  apiBaseUrl: 'http://localhost:7071/api/v1',
  useMockAuth: true,  // ← Enable mock mode
});

// Now all API calls are bypassed
await authService.login({ email: 'admin@test.com' });
```

**Automated tests:**
```typescript
describe('Authentication', () => {
  it('should login with mock account', async () => {
    const { login } = useAuth();
    
    await login({
      email: 'admin@test.com',
      name: 'Test Admin'
    });

    const user = await authService.getUser();
    expect(user?.role).toBe('Admin');
  });
});
```

## Troubleshooting

### React Native: "Cannot find module '@quotes/shared-modules'"

```bash
cd quotes-native
npm link ../shared-modules
```

### Electron: "electron-store not found"

```bash
cd quotes-electron
npm install electron-store
```

### TypeScript errors

```bash
cd shared-modules
npm run build
```

### Mock auth not working

Check environment variables:
```typescript
console.log('Mock auth enabled:', process.env.REACT_APP_MOCK_AUTH === 'true');
```

## Production Setup

**Disable mock auth:**
```typescript
// React Native
const authService = getNativeAuthService({
  apiBaseUrl: 'https://api.quotes.com/v1',
  useMockAuth: false,  // ← Production mode
});

// Electron
const authService = getElectronAuthService({
  apiBaseUrl: 'https://api.quotes.com/v1',
  useMockAuth: false,
});
```

**Environment variables:**
```bash
# .env.production
REACT_APP_API_URL=https://api.quotes.com/v1
REACT_APP_MOCK_AUTH=false
```

## API Endpoints

The auth service expects these backend endpoints:

```
POST /auth/login       - Email login
POST /auth/logout      - Logout
POST /auth/refresh     - Refresh token
GET  /users/me         - Get current user
```

## Security Notes

1. **Token Storage:**
   - React Native: AsyncStorage (unencrypted by default)
   - Electron: electron-store (encrypted)
   - Consider using Keychain (iOS) or Keystore (Android) for production

2. **Network Security:**
   - Always use HTTPS in production
   - Implement certificate pinning for mobile apps
   - Validate SSL certificates

3. **Token Expiration:**
   - Access tokens expire in 60 minutes
   - Refresh tokens expire in 7 days
   - Automatic refresh on 401 responses

4. **Mock Authentication:**
   - Only use for development and testing
   - Never enable in production builds
   - Clear distinction with console logs

## Next Steps

1. ✅ Install dependencies (`@react-native-async-storage/async-storage`, `electron-store`)
2. ✅ Wrap app with AuthProvider (React Native)
3. ✅ Set up IPC handlers (Electron)
4. ✅ Create login/logout screens
5. ✅ Test with mock accounts
6. ⏳ Integrate with real backend
7. ⏳ Implement OAuth providers
8. ⏳ Add biometric authentication (mobile)
