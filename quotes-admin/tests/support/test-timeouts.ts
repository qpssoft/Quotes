/**
 * Test Timeouts Configuration
 * 
 * Standardized timeout values for consistent test behavior
 */
export class TestTimeout {
  /** Standard wait for UI elements (500ms) */
  static readonly STANDARD = 500;
  
  /** Short debounce wait (300ms) */
  static readonly SHORT_DEBOUNCE = 300;
  
  /** Medium debounce wait for search/filter (500ms) */
  static readonly MEDIUM_DEBOUNCE = 500;
  
  /** Long debounce wait (1000ms) */
  static readonly LONG_DEBOUNCE = 1000;
  
  /** Wait for API responses (2000ms) */
  static readonly API_RESPONSE = 2000;
  
  /** Wait for navigation/page transitions (3000ms) */
  static readonly NAVIGATION = 3000;
  
  /** Wait for empty state to render (1000ms) */
  static readonly EMPTY_STATE = 1000;
  
  /** Wait for animations to complete (600ms) */
  static readonly ANIMATION = 600;
  
  /** Wait for localStorage operations (200ms) */
  static readonly STORAGE = 200;
}
