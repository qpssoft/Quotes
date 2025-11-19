/**
 * Tracks recently displayed quotes to prevent immediate repetition
 */
export interface DisplayHistory {
  /** Array of recently shown quote IDs (max 5) */
  lastQuoteIds: string[];
  
  /** Maximum number of quotes to track */
  maxLength: number;
}
