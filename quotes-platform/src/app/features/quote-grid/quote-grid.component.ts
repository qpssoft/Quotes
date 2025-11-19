import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { QuoteCardComponent } from '../../shared/components/quote-card/quote-card.component';
import { Quote } from '../../core/models';

/**
 * Quote grid component for browsing quotes
 * Displays 12 random quotes in a responsive grid layout
 * Includes search functionality for filtering quotes
 */
@Component({
  selector: 'app-quote-grid',
  standalone: true,
  imports: [CommonModule, QuoteCardComponent, FormsModule],
  templateUrl: './quote-grid.component.html',
  styleUrl: './quote-grid.component.scss'
})
export class QuoteGridComponent implements OnInit {
  private dataService = inject(DataService);

  // All quotes loaded from service
  private allQuotes = signal<Quote[]>([]);
  
  // Search query signal
  searchQuery = signal<string>('');
  
  // Loading state
  isLoading = signal<boolean>(true);

  // Computed filtered quotes based on search query
  filteredQuotes = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const quotes = this.allQuotes();
    
    if (!query) {
      // No search - return first 12 quotes
      return quotes.slice(0, 12);
    }
    
    // Filter quotes by search query (content, author, or category)
    return quotes.filter(quote => 
      quote.content.toLowerCase().includes(query) ||
      quote.author.toLowerCase().includes(query) ||
      quote.category.toLowerCase().includes(query)
    );
  });

  async ngOnInit(): Promise<void> {
    await this.loadAllQuotes();
  }

  /**
   * Load all quotes from service
   */
  private async loadAllQuotes(): Promise<void> {
    this.isLoading.set(true);
    
    try {
      const quotes = await this.dataService.loadQuotes();
      
      if (quotes.length === 0) {
        this.isLoading.set(false);
        return;
      }

      // Shuffle quotes for random display
      const shuffled = [...quotes].sort(() => Math.random() - 0.5);
      this.allQuotes.set(shuffled);
    } catch (error) {
      console.error('Failed to load quotes:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Handle search input change
   */
  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  /**
   * Clear search query
   */
  clearSearch(): void {
    this.searchQuery.set('');
  }

  /**
   * Refresh grid with new random quotes
   */
  async refreshGrid(): Promise<void> {
    await this.loadAllQuotes();
  }
}
