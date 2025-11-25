import { Injectable, inject } from '@angular/core';
import { Quote, mapApiQuoteToQuote } from '../models';
import { ApiService } from './api.service';
import { firstValueFrom } from 'rxjs';

/**
 * Service for loading and caching quote data
 */
@Injectable({
  providedIn: 'root',
})
export class DataService {
  private apiService = inject(ApiService);
  private quotes: Quote[] = [];
  private quotesCache = new Map<string, Quote>();
  private useBackendApi = true; // Flag to enable/disable backend API
  private backendAvailable = false;

  /**
   * Load quotes from backend API or fallback to local JSON
   */
  async loadQuotes(): Promise<Quote[]> {
    if (this.quotes.length > 0) {
      return this.quotes;
    }

    try {
      // Try to load from backend API first
      if (this.useBackendApi) {
        console.log('Loading quotes from backend API...');
        const apiQuotes = await firstValueFrom(
          this.apiService.getAllQuotes({ language: 'vi' })
        );

        this.quotes = apiQuotes.map(mapApiQuoteToQuote);
        this.backendAvailable = true;
        console.log(`Loaded ${this.quotes.length} quotes from backend API`);
      }
    } catch (error) {
      console.warn('Failed to load quotes from backend API, falling back to local JSON:', error);
      this.backendAvailable = false;
      
      // Fallback to local JSON file
      try {
        const response = await fetch('data/quotes.json');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        this.quotes = await response.json();
        console.log(`Loaded ${this.quotes.length} quotes from local JSON`);
      } catch (localError) {
        console.error('Failed to load quotes from local JSON:', localError);
        throw new Error('Unable to load quotes from either backend API or local file');
      }
    }

    // Validate data
    if (!Array.isArray(this.quotes) || this.quotes.length === 0) {
      throw new Error('Invalid quotes data format or empty dataset');
    }

    // Build cache for fast ID lookups
    this.quotes.forEach((quote) => {
      this.quotesCache.set(quote.id, quote);
    });

    return this.quotes;
  }

  /**
   * Get all quotes
   */
  getQuotes(): Quote[] {
    return this.quotes;
  }

  /**
   * Get quote by ID
   */
  getQuoteById(id: string): Quote | undefined {
    return this.quotesCache.get(id);
  }

  /**
   * Get random quote excluding recent IDs
   */
  getRandomQuote(excludeIds: string[] = []): Quote | undefined {
    const availableQuotes = this.quotes.filter(
      (quote) => !excludeIds.includes(quote.id)
    );

    if (availableQuotes.length === 0) {
      return this.quotes[Math.floor(Math.random() * this.quotes.length)];
    }

    return availableQuotes[Math.floor(Math.random() * availableQuotes.length)];
  }

  /**
   * Search quotes by content or author
   */
  searchQuotes(query: string): Quote[] {
    const lowerQuery = query.toLowerCase();
    return this.quotes.filter(
      (quote) =>
        quote.content.toLowerCase().includes(lowerQuery) ||
        quote.author.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Filter quotes by category
   */
  filterByCategory(category: string): Quote[] {
    return this.quotes.filter((quote) => quote.category === category);
  }

  /**
   * Check if backend API is available
   */
  isBackendAvailable(): boolean {
    return this.backendAvailable;
  }

  /**
   * Enable or disable backend API usage
   */
  setUseBackendApi(use: boolean): void {
    this.useBackendApi = use;
    // Clear cache to force reload
    this.quotes = [];
    this.quotesCache.clear();
  }

  /**
   * Reload quotes from source (useful after toggling backend API)
   */
  async reloadQuotes(): Promise<Quote[]> {
    this.quotes = [];
    this.quotesCache.clear();
    return this.loadQuotes();
  }
}
