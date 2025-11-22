import axios, { AxiosError } from 'axios';

// API base URL - will be configured via environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:7071/api/v1';

// Auth endpoints
const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REFRESH: `${API_BASE_URL}/auth/refresh`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  ME: `${API_BASE_URL}/users/me`,
};

// Local storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'quotes_access_token',
  REFRESH_TOKEN: 'quotes_refresh_token',
  USER: 'quotes_user',
};

export interface User {
  Id: string;
  Email: string;
  Name: string;
  Role: string;
  Provider: string;
  ProfilePicture?: string;
  CreatedAt?: string;
  LastLogin?: string;
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

class AuthService {
  /**
   * Login with email (for MVP - OAuth providers will redirect here)
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, request);
      
      // Store tokens and user data
      this.setAccessToken(response.data.accessToken);
      this.setRefreshToken(response.data.refreshToken);
      this.setUser(response.data.user);
      
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Logout - clears local tokens and calls backend logout
   */
  async logout(): Promise<void> {
    try {
      const token = this.getAccessToken();
      if (token) {
        await axios.post(
          AUTH_ENDPOINTS.LOGOUT,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Always clear local storage
      this.clearAuth();
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post<RefreshResponse>(AUTH_ENDPOINTS.REFRESH, {
        refreshToken,
      });

      // Update tokens
      this.setAccessToken(response.data.accessToken);
      this.setRefreshToken(response.data.refreshToken);

      return response.data.accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearAuth();
      throw this.handleError(error);
    }
  }

  /**
   * Get current user profile from backend
   */
  async getCurrentUser(): Promise<User> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await axios.get<User>(AUTH_ENDPOINTS.ME, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update stored user data
      this.setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Get current user failed:', error);
      
      // If 401, try to refresh token
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        try {
          await this.refreshToken();
          // Retry with new token
          const retryResponse = await axios.get<User>(AUTH_ENDPOINTS.ME, {
            headers: { Authorization: `Bearer ${this.getAccessToken()}` },
          });
          this.setUser(retryResponse.data);
          return retryResponse.data;
        } catch (refreshError) {
          this.clearAuth();
          throw new Error('Session expired. Please login again.');
        }
      }
      
      throw this.handleError(error);
    }
  }

  /**
   * Get access token from local storage
   */
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Get refresh token from local storage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Get user data from local storage
   */
  getUser(): User | null {
    const userJson = localStorage.getItem(STORAGE_KEYS.USER);
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
  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getUser();
  }

  /**
   * Check if user has admin role
   */
  isAdmin(): boolean {
    const user = this.getUser();
    return user?.Role === 'Admin';
  }

  /**
   * Check if user has contributor role or higher
   */
  isContributor(): boolean {
    const user = this.getUser();
    return user?.Role === 'Contributor' || user?.Role === 'Admin';
  }

  /**
   * Set access token in local storage
   */
  private setAccessToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  /**
   * Set refresh token in local storage
   */
  private setRefreshToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  /**
   * Set user data in local storage
   */
  private setUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  /**
   * Clear all auth data from local storage
   */
  private clearAuth(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  /**
   * Handle API errors
   */
  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      const message = 
        axiosError.response?.data?.error || 
        axiosError.response?.data?.message || 
        axiosError.message || 
        'An error occurred';
      return new Error(message);
    }
    return error instanceof Error ? error : new Error('Unknown error occurred');
  }

  /**
   * Setup axios interceptor for automatic token refresh
   */
  setupInterceptors(): void {
    axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // If 401 and not already retried, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            this.clearAuth();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }
}

// Export singleton instance
export const authService = new AuthService();

// Setup interceptors on module load
authService.setupInterceptors();
