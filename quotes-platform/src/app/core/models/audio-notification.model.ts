/**
 * Audio notification configuration
 */
export interface AudioNotification {
  /** Path to audio file */
  path: string;
  
  /** Preload strategy: 'auto' | 'metadata' | 'none' */
  preload: 'auto' | 'metadata' | 'none';
}
