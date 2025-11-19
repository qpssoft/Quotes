/**
 * Represents a Buddhist quote with metadata
 */
export interface Quote {
  /** Unique identifier for the quote */
  id: string;
  
  /** The quote content in Vietnamese */
  content: string;
  
  /** Author or source of the quote */
  author: string;
  
  /** Category: 'quote' | 'proverb' | 'cadao' */
  category: 'quote' | 'proverb' | 'cadao';
  
  /** Type classification for filtering */
  type: string;
}
