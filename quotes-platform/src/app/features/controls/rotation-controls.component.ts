import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RotationService } from '../../core/services/rotation.service';
import { AudioService } from '../../core/services/audio.service';

/**
 * Rotation control buttons (play/pause, next)
 * Provides user controls for quote rotation
 */
@Component({
  selector: 'app-rotation-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rotation-controls.component.html',
  styleUrl: './rotation-controls.component.scss'
})
export class RotationControlsComponent {
  private rotationService = inject(RotationService);
  private audioService = inject(AudioService);

  // Reactive signals from rotation service
  timer = this.rotationService.timer;

  get isPlaying(): boolean {
    return this.timer().isPlaying;
  }

  /**
   * Toggle play/pause state
   */
  togglePlayPause(): void {
    // Enable audio on user interaction (required for autoplay policy)
    this.audioService.enableAudio();
    
    if (this.isPlaying) {
      this.rotationService.pause();
    } else {
      this.rotationService.start();
    }
  }

  /**
   * Skip to next quote
   */
  nextQuote(): void {
    // Enable audio on user interaction
    this.audioService.enableAudio();
    this.rotationService.next();
  }

  /**
   * Handle timer interval change
   */
  onTimerChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const interval = parseInt(select.value, 10);
    
    if (!isNaN(interval) && interval >= 5 && interval <= 60) {
      this.rotationService.setInterval(interval);
    }
  }

  /**
   * Get play/pause button aria label
   */
  getPlayPauseLabel(): string {
    return this.isPlaying ? 'Tạm dừng' : 'Tiếp tục';
  }

  /**
   * Get play/pause button icon
   */
  getPlayPauseIcon(): string {
    return this.isPlaying ? '⏸' : '▶';
  }
}
