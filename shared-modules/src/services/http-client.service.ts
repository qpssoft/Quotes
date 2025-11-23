/**
 * HTTP Client Service for API communication
 * Shared across all platforms with platform-specific implementations
 */

export interface HttpRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly response?: any
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/**
 * Abstract HTTP client interface
 * Platform-specific implementations (fetch, axios, etc.) should implement this
 */
export interface IHttpClient {
  get<T = any>(url: string, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>>;
  post<T = any>(url: string, data?: any, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>>;
  put<T = any>(url: string, data?: any, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>>;
  delete<T = any>(url: string, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>>;
  setAuthToken(token: string | null): void;
}

/**
 * Base HTTP client with common functionality
 */
export abstract class BaseHttpClient implements IHttpClient {
  protected authToken: string | null = null;
  protected baseURL: string;
  protected defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  protected getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    return headers;
  }

  protected getFullUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${this.baseURL}${url.startsWith('/') ? url : '/' + url}`;
  }

  abstract get<T = any>(url: string, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>>;
  abstract post<T = any>(url: string, data?: any, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>>;
  abstract put<T = any>(url: string, data?: any, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>>;
  abstract delete<T = any>(url: string, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>>;
}

/**
 * Fetch-based HTTP client (for React Native and modern browsers)
 */
export class FetchHttpClient extends BaseHttpClient {
  async get<T = any>(url: string, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>> {
    return this.request<T>({
      method: 'GET',
      url,
      ...config,
    });
  }

  async post<T = any>(url: string, data?: any, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url,
      body: data,
      ...config,
    });
  }

  async put<T = any>(url: string, data?: any, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      url,
      body: data,
      ...config,
    });
  }

  async delete<T = any>(url: string, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      url,
      ...config,
    });
  }

  private async request<T>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
    const fullUrl = this.getFullUrl(config.url);
    const headers = this.getHeaders(config.headers);

    try {
      const response = await fetch(fullUrl, {
        method: config.method,
        headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal: config.timeout ? AbortSignal.timeout(config.timeout) : undefined,
      });

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let data: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        data = (await response.json()) as T;
      } else {
        data = (await response.text()) as any;
      }

      if (!response.ok) {
        throw new HttpError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          data
        );
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      };
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      
      const message = error instanceof Error ? error.message : 'Network request failed';
      throw new HttpError(message, undefined, undefined);
    }
  }
}
