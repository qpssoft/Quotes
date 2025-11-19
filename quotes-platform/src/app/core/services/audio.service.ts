import { Injectable } from '@angular/core';

/**
 * Service for playing audio notifications
 */
@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private audio: HTMLAudioElement | null = null;
  private isAudioEnabled = true;
  private audioContext: AudioContext | null = null;

  constructor() {
    // Don't preload audio file - use generated sound instead
    // If you add notification.mp3 to public/audio/, uncomment the line below:
    // this.preloadAudio();
  }

  /**
   * Preload audio file for faster playback
   */
  private preloadAudio(): void {
    this.audio = new Audio('audio/notification.mp3');
    this.audio.preload = 'auto';
    this.audio.volume = 0.5; // 50% volume
  }

  /**
   * Generate a bell sound using Web Audio API as fallback
   */
  private async playGeneratedBell(): Promise<void> {
    // Create AudioContext lazily on first use (required for autoplay policy)
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    // Resume AudioContext if suspended (required for user interaction)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Create oscillators for harmonics
    const fundamentalFreq = 800; // Base frequency in Hz
    const oscillators = [1, 2, 3].map((harmonic) => {
      const osc = ctx.createOscillator();
      osc.frequency.value = fundamentalFreq * harmonic;
      osc.type = 'sine';
      return osc;
    });

    // Create gain nodes for each oscillator with different volumes
    const gains = [0.5, 0.3, 0.2].map((volume, i) => {
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
      oscillators[i].connect(gain);
      return gain;
    });

    // Connect to master gain
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.3;
    gains.forEach(gain => gain.connect(masterGain));
    masterGain.connect(ctx.destination);

    // Play the bell
    oscillators.forEach(osc => {
      osc.start(now);
      osc.stop(now + 0.8);
    });
  }

  /**
   * Play notification sound
   */
  async playNotification(): Promise<void> {
    if (!this.isAudioEnabled) {
      return;
    }

    try {
      // Try to play the audio file first (if loaded)
      if (this.audio) {
        this.audio.currentTime = 0;
        await this.audio.play();
      } else {
        // No audio file - use generated bell sound
        await this.playGeneratedBell();
      }
    } catch (error) {
      // If audio file fails, fall back to generated bell sound
      try {
        await this.playGeneratedBell();
      } catch {
        console.warn('Audio playback failed:', error);
        this.isAudioEnabled = false;
      }
    }
  }

  /**
   * Enable audio notifications
   */
  enableAudio(): void {
    this.isAudioEnabled = true;
    // Don't preload audio file - we use generated sound
    // If you have notification.mp3, uncomment the line below:
    // if (!this.audio) {
    //   this.preloadAudio();
    // }
  }

  /**
   * Disable audio notifications
   */
  disableAudio(): void {
    this.isAudioEnabled = false;
  }

  /**
   * Set audio volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Check if audio is enabled
   */
  isEnabled(): boolean {
    return this.isAudioEnabled;
  }
}
