/**
 * Authentication Service Interface
 * Shared authentication logic for all client platforms
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Contributor' | 'Authenticated';
  provider: 'email' | 'google' | 'facebook' | 'microsoft';
  profilePicture?: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface LoginRequest {
  email: string;
  name?: string;
  provider?: string;
  profilePicture?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Storage keys for authentication data
 */
export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'quotes_access_token',
  REFRESH_TOKEN: 'quotes_refresh_token',
  USER: 'quotes_user',
} as const;

/**
 * Authentication error types
 */
export enum AuthErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly type: AuthErrorType,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Abstract authentication service interface
 * Platform-specific implementations should extend this
 */
export interface IAuthService {
  /**
   * Login with email (MVP implementation)
   */
  login(request: LoginRequest): Promise<LoginResponse>;

  /**
   * Logout - clears local tokens and calls backend logout
   */
  logout(): Promise<void>;

  /**
   * Refresh access token using refresh token
   */
  refreshToken(): Promise<string>;

  /**
   * Get current user profile from backend
   */
  getCurrentUser(): Promise<User>;

  /**
   * Get access token from storage
   */
  getAccessToken(): Promise<string | null>;

  /**
   * Get refresh token from storage
   */
  getRefreshToken(): Promise<string | null>;

  /**
   * Get user data from storage
   */
  getUser(): Promise<User | null>;

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): Promise<boolean>;

  /**
   * Check if user has admin role
   */
  isAdmin(): Promise<boolean>;

  /**
   * Check if user has contributor role or higher
   */
  isContributor(): Promise<boolean>;
}

/**
 * Mock authentication for testing
 */
export const MOCK_ACCOUNTS = {
  ADMIN: {
    email: 'admin@test.com',
    user: {
      id: 'test-admin-001',
      email: 'admin@test.com',
      name: 'Test Admin',
      role: 'Admin' as const,
      provider: 'email' as const,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    },
    accessToken: 'mock_admin_access_token_',
    refreshToken: 'mock_admin_refresh_token_',
  },
  CONTRIBUTOR: {
    email: 'contributor@test.com',
    user: {
      id: 'test-contributor-001',
      email: 'contributor@test.com',
      name: 'Test Contributor',
      role: 'Contributor' as const,
      provider: 'email' as const,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    },
    accessToken: 'mock_contributor_access_token_',
    refreshToken: 'mock_contributor_refresh_token_',
  },
  USER: {
    email: 'user@test.com',
    user: {
      id: 'test-user-001',
      email: 'user@test.com',
      name: 'Test User',
      role: 'Authenticated' as const,
      provider: 'email' as const,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    },
    accessToken: 'mock_user_access_token_',
    refreshToken: 'mock_user_refresh_token_',
  },
} as const;

/**
 * Helper function to get mock account by email
 */
export function getMockAccount(email: string) {
  if (email === MOCK_ACCOUNTS.ADMIN.email) {
    return MOCK_ACCOUNTS.ADMIN;
  }
  if (email === MOCK_ACCOUNTS.CONTRIBUTOR.email) {
    return MOCK_ACCOUNTS.CONTRIBUTOR;
  }
  return MOCK_ACCOUNTS.USER;
}

/**
 * Helper function to create mock login response
 */
export function createMockLoginResponse(
  request: LoginRequest,
  timestamp: number = Date.now()
): LoginResponse {
  const mockAccount = getMockAccount(request.email);
  
  return {
    accessToken: mockAccount.accessToken + timestamp,
    refreshToken: mockAccount.refreshToken + timestamp,
    expiresIn: 3600,
    user: {
      ...mockAccount.user,
      name: request.name || mockAccount.user.name,
    },
  };
}
