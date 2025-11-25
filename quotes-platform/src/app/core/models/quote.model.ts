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
  category: 'quote' | 'proverb' | 'cadao' | 'saying';
  
  /** Type classification for filtering */
  type: string;
  
  /** Language of the quote */
  language?: 'vi' | 'en';
  
  /** Tags for additional categorization */
  tags?: string[];
}

/**
 * Backend API quote format mapper
 */
export function mapApiQuoteToQuote(apiQuote: {
  Id: string;
  Content: string;
  Author: string;
  Category: string;
  Type: string;
  Language?: 'vi' | 'en';
  Tags?: string[];
}): Quote {
  return {
    id: apiQuote.Id,
    content: apiQuote.Content,
    author: apiQuote.Author,
    category: apiQuote.Type as 'quote' | 'proverb' | 'cadao' | 'saying',
    type: apiQuote.Category,
    language: apiQuote.Language || 'vi',
    tags: apiQuote.Tags || [],
  };
}

