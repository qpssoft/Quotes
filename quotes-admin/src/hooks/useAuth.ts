import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authService, User, LoginRequest } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isContributor: boolean;
  isLoading: boolean;
  error: string | null;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component - wraps the app to provide auth context
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if user is already authenticated
      if (authService.isAuthenticated()) {
        const storedUser = authService.getUser();
        if (storedUser) {
          setUser(storedUser);
          
          // Optionally refresh user data from backend
          try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
          } catch (err) {
            // If refresh fails, use stored user data
            console.warn('Failed to refresh user data:', err);
          }
        }
      }
    } catch (err) {
      console.error('Auth initialization failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize auth');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (request: LoginRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.login(request);
      setUser(response.user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
      setError(err instanceof Error ? err.message : 'Logout failed');
      // Still clear user state even if logout request fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error('Refresh user failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: authService.isAdmin(),
    isContributor: authService.isContributor(),
    isLoading,
    error,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth hook - access auth context from any component
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook to require authentication - redirects to login if not authenticated
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated, isLoading]);

  return { isAuthenticated, isLoading };
}

/**
 * Hook to require admin role - redirects if not admin
 */
export function useRequireAdmin() {
  const { isAdmin, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        window.location.href = '/login';
      } else if (!isAdmin) {
        window.location.href = '/unauthorized';
      }
    }
  }, [isAdmin, isAuthenticated, isLoading]);

  return { isAdmin, isLoading };
}
