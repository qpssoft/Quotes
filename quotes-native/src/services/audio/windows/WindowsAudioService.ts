/**
 * Windows Audio Service Implementation
 * Uses Windows.Media.Playback API for audio playback on Windows desktop
 */

import { IAudioService, AudioError } from '@quotes/shared-modules';

export class WindowsAudioService implements IAudioService {
  private audio: HTMLAudioElement | null = null;
  private volume: number = 0.7;
  private loaded: boolean = false;
  private playing: boolean = false;

  async load(audioPath: string): Promise<void> {
    try {
      // In React Native Windows, we can use HTML5 Audio API
      // For production, this should be replaced with native Windows.Media.Playback
      this.audio = new Audio(audioPath);
      this.audio.volume = this.volume;
      
      // Set up event listeners
      this.audio.addEventListener('ended', () => {
        this.playing = false;
      });
      
      this.audio.addEventListener('error', (e) => {
        console.error('Audio load error:', e);
        throw new AudioError(
          `Failed to load audio file: ${audioPath}`,
          'LOAD_FAILED'
        );
      });
      
      // Wait for audio to be loaded
      await new Promise<void>((resolve, reject) => {
        if (!this.audio) {
          reject(new AudioError('Audio element not initialized', 'LOAD_FAILED'));
          return;
        }
        
        this.audio.addEventListener('canplaythrough', () => {
          this.loaded = true;
          resolve();
        }, { once: true });
        
        this.audio.addEventListener('error', () => {
          reject(new AudioError(
            `Failed to load audio file: ${audioPath}`,
            'LOAD_FAILED'
          ));
        }, { once: true });
        
        this.audio.load();
      });
    } catch (error) {
      throw new AudioError(
        `Failed to load audio file: ${audioPath}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'LOAD_FAILED'
      );
    }
  }

  async playNotification(): Promise<void> {
    if (!this.audio || !this.loaded) {
      throw new AudioError('Audio not loaded', 'NOT_LOADED');
    }

    try {
      this.audio.currentTime = 0; // Reset to start
      await this.audio.play();
      this.playing = true;
    } catch (error) {
      throw new AudioError(
        `Failed to play audio: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PLAYBACK_FAILED'
      );
    }
  }

  async stop(): Promise<void> {
    if (this.audio && this.loaded) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.playing = false;
    }
  }

  async setVolume(volume: number): Promise<void> {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
  }

  getVolume(): number {
    return this.volume;
  }

  isPlaying(): boolean {
    return this.playing;
  }

  async release(): Promise<void> {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
      this.loaded = false;
      this.playing = false;
    }
  }
}
