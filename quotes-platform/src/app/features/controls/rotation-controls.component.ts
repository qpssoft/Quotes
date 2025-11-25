import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RotationService } from '../../core/services/rotation.service';
import { AudioService } from '../../core/services/audio.service';
import { ElectronService } from '../../core/services/electron.service';
import { DataService } from '../../core/services/data.service';

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
export class RotationControlsComponent implements OnInit, OnDestroy {
  private rotationService = inject(RotationService);
  private audioService = inject(AudioService);
  private electronService = inject(ElectronService);
  private dataService = inject(DataService);

  // Reactive signals from rotation service
  timer = this.rotationService.timer;

  get isPlaying(): boolean {
    return this.timer().isPlaying;
  }

  get isAudioEnabled(): boolean {
    return this.rotationService.isAudioEnabled();
  }

  get isBackendAvailable(): boolean {
    return this.dataService.isBackendAvailable();
  }

  ngOnInit(): void {
    // Listen for Electron events (shortcuts/menu)
    if (this.electronService.isElectron()) {
      window.addEventListener('electron:rotation:toggle', this.handleElectronToggle);
      window.addEventListener('electron:rotation:next', this.handleElectronNext);
      console.log('✓ Rotation controls listening for Electron events');
    }
  }

  ngOnDestroy(): void {
    // Clean up event listeners
    if (this.electronService.isElectron()) {
      window.removeEventListener('electron:rotation:toggle', this.handleElectronToggle);
      window.removeEventListener('electron:rotation:next', this.handleElectronNext);
    }
  }

  /**
   * Handle Ctrl+Shift+P (toggle rotation)
   */
  private handleElectronToggle = (): void => {
    console.log('Handling Electron toggle rotation event');
    this.togglePlayPause();
  };

  /**
   * Handle Ctrl+Shift+N (next quote)
   */
  private handleElectronNext = (): void => {
    console.log('Handling Electron next quote event');
    this.nextQuote();
  };

  /**
   * Toggle play/pause state
   */
  togglePlayPause(): void {
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
    this.rotationService.next();
  }

  /**
   * Toggle audio notifications
   */
  toggleAudio(): void {
    this.rotationService.toggleAudio();
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

  /**
   * Get backend connection status label
   */
  getBackendStatusLabel(): string {
    return this.isBackendAvailable ? '🟢 API Backend' : '🔴 Local Data';
  }

  /**
   * Get backend connection status description
   */
  getBackendStatusDescription(): string {
    return this.isBackendAvailable 
      ? 'Connected to backend API' 
      : 'Using local quote data';
  }
}
