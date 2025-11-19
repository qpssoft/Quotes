import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quote } from '../../../core/models';

/**
 * Reusable quote card component
 * Displays quote content, author, and category with Buddhist styling
 */
@Component({
  selector: 'app-quote-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quote-card.component.html',
  styleUrl: './quote-card.component.scss'
})
export class QuoteCardComponent {
  @Input({ required: true }) quote!: Quote;

  /**
   * Get category display name
   */
  getCategoryDisplay(): string {
    const categoryMap: Record<string, string> = {
      'quote': 'Lời Phật Dạy',
      'proverb': 'Tục Ngữ',
      'cadao': 'Ca Dao'
    };
    return categoryMap[this.quote.category] || this.quote.category;
  }

  /**
   * Get category CSS class
   */
  getCategoryClass(): string {
    return `category-${this.quote.category}`;
  }
}
