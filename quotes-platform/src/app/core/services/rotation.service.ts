import { Injectable, signal, inject, OnDestroy } from '@angular/core';
import { interval, Subject, takeUntil } from 'rxjs';
import { Quote, Timer, DisplayHistory } from '../models';
import { DataService } from './data.service';
import { AudioService } from './audio.service';
import { StorageService } from './storage.service';

/**
 * Service for managing quote rotation with timer
 */
@Injectable({
  providedIn: 'root',
})
export class RotationService implements OnDestroy {
  private dataService = inject(DataService);
  private audioService = inject(AudioService);
  private storageService = inject(StorageService);

  // Reactive state using Angular signals
  currentQuote = signal<Quote | null>(null);
  timer = signal<Timer>({ interval: 15, isPlaying: false });
  
  private history: DisplayHistory = { lastQuoteIds: [], maxLength: 5 };
  private destroy$ = new Subject<void>();
  private rotationSubscription$ = new Subject<void>();

  constructor() {
    this.loadPreferences();
  }

  /**
   * Load saved preferences from localStorage
   */
  private loadPreferences(): void {
    const preferences = this.storageService.loadPreferences();
    if (preferences) {
      this.timer.update((t) => ({ ...t, interval: preferences.timerInterval }));
    }
  }

  /**
   * Start the rotation timer
   */
  async start(): Promise<void> {
    // Load quotes if not already loaded
    const quotes = await this.dataService.loadQuotes();
    if (quotes.length === 0) {
      console.error('No quotes available');
      return;
    }

    // Show first quote immediately
    await this.next();

    // Update timer state
    this.timer.update((t) => ({ ...t, isPlaying: true }));

    // Clear any existing subscription
    this.rotationSubscription$.next();

    // Start interval
    const timerInterval = this.timer().interval;
    interval(timerInterval * 1000)
      .pipe(takeUntil(this.rotationSubscription$))
      .subscribe(() => {
        this.next();
      });
  }

  /**
   * Pause the rotation timer
   */
  pause(): void {
    this.timer.update((t) => ({ ...t, isPlaying: false }));
    this.rotationSubscription$.next();
  }

  /**
   * Show next quote
   */
  async next(): Promise<void> {
    const quote = this.dataService.getRandomQuote(this.history.lastQuoteIds);
    
    if (quote) {
      this.currentQuote.set(quote);
      this.addToHistory(quote.id);
      await this.audioService.playNotification();
    }
  }

  /**
   * Change timer interval
   */
  setInterval(seconds: number): void {
    const newInterval = Math.max(5, Math.min(60, seconds));
    this.timer.update((t) => ({ ...t, interval: newInterval }));

    // Save preference
    this.storageService.savePreferences({
      timerInterval: newInterval,
      storageKey: 'buddhist-quotes-preferences',
    });

    // Restart timer if playing
    if (this.timer().isPlaying) {
      this.pause();
      this.start();
    }
  }

  /**
   * Add quote ID to history
   */
  private addToHistory(quoteId: string): void {
    this.history.lastQuoteIds.push(quoteId);
    if (this.history.lastQuoteIds.length > this.history.maxLength) {
      this.history.lastQuoteIds.shift();
    }
  }

  /**
   * Clean up on service destroy
   */
  ngOnDestroy(): void {
    this.rotationSubscription$.next();
    this.rotationSubscription$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
