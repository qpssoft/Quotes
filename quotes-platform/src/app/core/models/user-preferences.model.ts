/**
 * User preferences persisted in localStorage
 */
export interface UserPreferences {
  /** Timer interval in seconds */
  timerInterval: number;
  
  /** localStorage key for persistence */
  storageKey: string;
}
