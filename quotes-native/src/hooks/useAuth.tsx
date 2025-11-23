/**
 * React Native Authentication Hook
 * Provides authentication state and methods to React Native components
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { getNativeAuthService } from '../services/auth/NativeAuthService';
import type { LoginRequest, AuthState } from '@quotes/shared-modules';

interface AuthContextValue extends AuthState {
  login: (request: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  apiUrl?: string;
  useMockAuth?: boolean;
}

/**
 * AuthProvider component - wraps the app to provide auth context
 */
export function AuthProvider({ children, apiUrl, useMockAuth }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const authService = getNativeAuthService({
    apiBaseUrl: apiUrl || process.env.REACT_APP_API_URL || 'http://localhost:7071/api/v1',
    useMockAuth: useMockAuth ?? process.env.REACT_APP_MOCK_AUTH === 'true',
    autoRefresh: true,
  });

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Check if user is already authenticated
      const isAuth = await authService.isAuthenticated();
      
      if (isAuth) {
        const [user, accessToken, refreshToken] = await Promise.all([
          authService.getUser(),
          authService.getAccessToken(),
          authService.getRefreshToken(),
        ]);

        setState({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // Optionally refresh user data from backend
        try {
          const currentUser = await authService.getCurrentUser();
          setState(prev => ({ ...prev, user: currentUser }));
        } catch (err) {
          // If refresh fails, use stored user data
          console.warn('Failed to refresh user data:', err);
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (err) {
      console.error('Auth initialization failed:', err);
      setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to initialize auth',
      });
    }
  };

  const login = useCallback(async (request: LoginRequest) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await authService.login(request);

      setState({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw err;
    }
  }, [authService]);

  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await authService.logout();

      setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      console.error('Logout failed:', err);
      // Still clear user state even if logout request fails
      setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Logout failed',
      });
    }
  }, [authService]);

  const refreshUser = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const currentUser = await authService.getCurrentUser();

      setState(prev => ({
        ...prev,
        user: currentUser,
        isLoading: false,
        error: null,
      }));
    } catch (err) {
      console.error('Failed to refresh user:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to refresh user',
      }));
      throw err;
    }
  }, [authService]);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

/**
 * Hook to check specific roles
 */
export function useAuthRole() {
  const { user } = useAuth();
  
  return {
    isAdmin: user?.role === 'Admin',
    isContributor: user?.role === 'Contributor' || user?.role === 'Admin',
    isAuthenticated: user?.role === 'Authenticated' || user?.role === 'Contributor' || user?.role === 'Admin',
  };
}
