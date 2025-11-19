/**
 * Timer configuration for quote rotation
 */
export interface Timer {
  /** Interval in seconds (5-60) */
  interval: number;
  
  /** Whether the timer is currently playing */
  isPlaying: boolean;
}
