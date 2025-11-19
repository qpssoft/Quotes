import { Injectable } from '@angular/core';
import { Quote } from '../models';

/**
 * Service for loading and caching quote data
 */
@Injectable({
  providedIn: 'root',
})
export class DataService {
  private quotes: Quote[] = [];
  private quotesCache = new Map<string, Quote>();

  /**
   * Load quotes from JSON file
   */
  async loadQuotes(): Promise<Quote[]> {
    if (this.quotes.length > 0) {
      return this.quotes;
    }

    try {
      const response = await fetch('data/quotes.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      this.quotes = await response.json();
      
      // Validate data
      if (!Array.isArray(this.quotes) || this.quotes.length === 0) {
        throw new Error('Invalid quotes data format');
      }
      
      // Build cache for fast ID lookups
      this.quotes.forEach((quote) => {
        this.quotesCache.set(quote.id, quote);
      });

      return this.quotes;
    } catch (error) {
      console.error('Failed to load quotes:', error);
      throw error; // Re-throw for app-level error handling
    }
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
}
