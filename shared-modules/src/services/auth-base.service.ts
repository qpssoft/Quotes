/**
 * Base Authentication Service Implementation
 * Provides common auth logic that can be used across all platforms
 */

import { IStorageService } from './storage.service';
import { IHttpClient } from './http-client.service';
import {
  IAuthService,
  User,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  AuthError,
  AuthErrorType,
  AUTH_STORAGE_KEYS,
  createMockLoginResponse,
} from './auth.service';

export interface AuthServiceConfig {
  apiBaseUrl: string;
  useMockAuth?: boolean;
  autoRefresh?: boolean;
}

export class BaseAuthService implements IAuthService {
  private httpClient: IHttpClient;
  private storage: IStorageService;
  private config: AuthServiceConfig;

  private readonly endpoints = {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/users/me',
  };

  constructor(
    httpClient: IHttpClient,
    storage: IStorageService,
    config: AuthServiceConfig
  ) {
    this.httpClient = httpClient;
    this.storage = storage;
    this.config = config;
  }

  /**
   * Login with email (MVP implementation)
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    // Use mock authentication if enabled
    if (this.config.useMockAuth) {
      return this.mockLogin(request);
    }

    try {
      const response = await this.httpClient.post<LoginResponse>(
        this.endpoints.login,
        request
      );

      // Store tokens and user data
      await this.setAccessToken(response.data.accessToken);
      await this.setRefreshToken(response.data.refreshToken);
      await this.setUser(response.data.user);

      // Set auth token for subsequent requests
      this.httpClient.setAuthToken(response.data.accessToken);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Mock login for testing
   */
  private async mockLogin(request: LoginRequest): Promise<LoginResponse> {
    console.log('[MOCK AUTH] Using mock authentication');

    const response = createMockLoginResponse(request);

    // Store tokens and user data
    await this.setAccessToken(response.accessToken);
    await this.setRefreshToken(response.refreshToken);
    await this.setUser(response.user);

    // Set auth token for subsequent requests
    this.httpClient.setAuthToken(response.accessToken);

    console.log('[MOCK AUTH] Login successful:', response.user);
    return response;
  }

  /**
   * Logout - clears local tokens and calls backend logout
   */
  async logout(): Promise<void> {
    try {
      const token = await this.getAccessToken();
      
      if (token && !this.config.useMockAuth) {
        // Call backend logout endpoint
        await this.httpClient.post(this.endpoints.logout);
      }
    } catch (error) {
      console.error('Logout request failed:', error);
      // Continue with local cleanup even if backend call fails
    } finally {
      // Always clear local storage
      await this.clearAuth();
      this.httpClient.setAuthToken(null);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<string> {
    if (this.config.useMockAuth) {
      // In mock mode, just return a new mock token
      const timestamp = Date.now();
      const newToken = `mock_access_token_${timestamp}`;
      await this.setAccessToken(newToken);
      this.httpClient.setAuthToken(newToken);
      return newToken;
    }

    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) {
      throw new AuthError('No refresh token available', AuthErrorType.UNAUTHORIZED);
    }

    try {
      const response = await this.httpClient.post<RefreshResponse>(
        this.endpoints.refresh,
        { refreshToken }
      );

      // Update tokens
      await this.setAccessToken(response.data.accessToken);
      await this.setRefreshToken(response.data.refreshToken);
      this.httpClient.setAuthToken(response.data.accessToken);

      return response.data.accessToken;
    } catch (error) {
      // If refresh fails, clear auth and force re-login
      await this.clearAuth();
      this.httpClient.setAuthToken(null);
      throw this.handleError(error);
    }
  }

  /**
   * Get current user profile from backend
   */
  async getCurrentUser(): Promise<User> {
    const token = await this.getAccessToken();
    if (!token) {
      throw new AuthError('Not authenticated', AuthErrorType.UNAUTHORIZED);
    }

    if (this.config.useMockAuth) {
      // Return stored user in mock mode
      const user = await this.getUser();
      if (!user) {
        throw new AuthError('No user data found', AuthErrorType.UNAUTHORIZED);
      }
      return user;
    }

    try {
      const response = await this.httpClient.get<User>(this.endpoints.me);
      
      // Update stored user data
      await this.setUser(response.data);
      return response.data;
    } catch (error) {
      // If 401, try to refresh token
      if (this.isUnauthorizedError(error)) {
        try {
          await this.refreshToken();
          // Retry with new token
          const retryResponse = await this.httpClient.get<User>(this.endpoints.me);
          await this.setUser(retryResponse.data);
          return retryResponse.data;
        } catch (refreshError) {
          await this.clearAuth();
          throw new AuthError(
            'Session expired. Please login again.',
            AuthErrorType.TOKEN_EXPIRED
          );
        }
      }

      throw this.handleError(error);
    }
  }

  /**
   * Get access token from storage
   */
  async getAccessToken(): Promise<string | null> {
    return await this.storage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Get refresh token from storage
   */
  async getRefreshToken(): Promise<string | null> {
    return await this.storage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Get user data from storage
   */
  async getUser(): Promise<User | null> {
    const userJson = await this.storage.getItem(AUTH_STORAGE_KEYS.USER);
    if (!userJson) return null;

    try {
      return JSON.parse(userJson) as User;
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    const user = await this.getUser();
    return !!token && !!user;
  }

  /**
   * Check if user has admin role
   */
  async isAdmin(): Promise<boolean> {
    const user = await this.getUser();
    return user?.role === 'Admin';
  }

  /**
   * Check if user has contributor role or higher
   */
  async isContributor(): Promise<boolean> {
    const user = await this.getUser();
    return user?.role === 'Contributor' || user?.role === 'Admin';
  }

  /**
   * Set access token in storage
   */
  private async setAccessToken(token: string): Promise<void> {
    await this.storage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  /**
   * Set refresh token in storage
   */
  private async setRefreshToken(token: string): Promise<void> {
    await this.storage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  /**
   * Set user data in storage
   */
  private async setUser(user: User): Promise<void> {
    await this.storage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
  }

  /**
   * Clear all auth data from storage
   */
  private async clearAuth(): Promise<void> {
    await this.storage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    await this.storage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    await this.storage.removeItem(AUTH_STORAGE_KEYS.USER);
  }

  /**
   * Check if error is 401 Unauthorized
   */
  private isUnauthorizedError(error: unknown): boolean {
    return (
      error instanceof AuthError && error.statusCode === 401 ||
      (error as any)?.status === 401
    );
  }

  /**
   * Handle API errors and convert to AuthError
   */
  private handleError(error: unknown): AuthError {
    if (error instanceof AuthError) {
      return error;
    }

    // Check for HTTP errors
    if (typeof error === 'object' && error !== null) {
      const httpError = error as any;
      
      if (httpError.status === 401) {
        return new AuthError(
          'Unauthorized',
          AuthErrorType.UNAUTHORIZED,
          401
        );
      }
      
      if (httpError.status === 403) {
        return new AuthError(
          'Access forbidden',
          AuthErrorType.UNAUTHORIZED,
          403
        );
      }
      
      if (httpError.status >= 500) {
        return new AuthError(
          'Server error',
          AuthErrorType.SERVER_ERROR,
          httpError.status
        );
      }
      
      if (httpError.message) {
        return new AuthError(
          httpError.message,
          AuthErrorType.NETWORK_ERROR,
          httpError.status
        );
      }
    }

    return new AuthError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      AuthErrorType.UNKNOWN_ERROR
    );
  }
}
