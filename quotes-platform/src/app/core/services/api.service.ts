import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timeout, retry, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Backend API response format for quotes
 */
export interface ApiQuote {
  Id: string;
  Content: string;
  Author: string;
  Category: string;
  Tags?: string[];
  Language: 'vi' | 'en';
  Type: 'quote' | 'proverb' | 'cadao' | 'saying';
  IsPublic: boolean;
  CreatedAt: string;
  CreatedBy?: string;
}

/**
 * Query parameters for filtering quotes
 */
export interface QuoteQueryParams {
  language?: 'vi' | 'en';
  category?: string;
  author?: string;
  type?: 'quote' | 'proverb' | 'cadao' | 'saying';
}

/**
 * Service for interacting with the Quotes Backend API
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly apiTimeout = environment.apiTimeout;

  /**
   * Get all public quotes from the backend
   */
  getAllQuotes(params?: QuoteQueryParams): Observable<ApiQuote[]> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.language) {
        httpParams = httpParams.set('language', params.language);
      }
      if (params.category) {
        httpParams = httpParams.set('category', params.category);
      }
      if (params.author) {
        httpParams = httpParams.set('author', params.author);
      }
      if (params.type) {
        httpParams = httpParams.set('type', params.type);
      }
    }

    return this.http
      .get<ApiQuote[]>(`${this.apiUrl}/quotes`, { params: httpParams })
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: 2, delay: 1000 }), // Retry twice with 1 second delay
        catchError(this.handleError)
      );
  }

  /**
   * Get a single quote by ID
   */
  getQuoteById(id: string): Observable<ApiQuote> {
    return this.http
      .get<ApiQuote>(`${this.apiUrl}/quotes/${id}`)
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: 2, delay: 1000 }),
        catchError(this.handleError)
      );
  }

  /**
   * Check if the backend API is reachable
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/quotes?language=vi`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch (error) {
      console.warn('Backend API health check failed:', error);
      return false;
    }
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred while fetching data';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      // Backend error
      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to the backend API. Please check your connection.';
          break;
        case 400:
          errorMessage = 'Invalid request. Please check your query parameters.';
          break;
        case 404:
          errorMessage = 'Quote not found.';
          break;
        case 429:
          errorMessage = 'Too many requests. Please try again later.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = `Backend error: ${error.status} - ${error.message}`;
      }
    }

    console.error('API Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
