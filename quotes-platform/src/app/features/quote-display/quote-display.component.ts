import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { QuoteCardComponent } from '../../shared/components/quote-card/quote-card.component';
import { RotationService } from '../../core/services/rotation.service';

/**
 * Continuous quote display component (top 1/3 of screen)
 * Shows auto-rotating Buddhist quotes with fade transitions
 */
@Component({
  selector: 'app-quote-display',
  standalone: true,
  imports: [CommonModule, QuoteCardComponent],
  templateUrl: './quote-display.component.html',
  styleUrl: './quote-display.component.scss',
  animations: [
    trigger('fadeInOut', [
      state('in', style({ opacity: 1 })),
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('500ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class QuoteDisplayComponent implements OnInit, OnDestroy {
  private rotationService = inject(RotationService);

  // Reactive signals from rotation service
  currentQuote = this.rotationService.currentQuote;
  isPlaying = this.rotationService.timer;

  async ngOnInit(): Promise<void> {
    // Start rotation on component init
    await this.rotationService.start();
  }

  ngOnDestroy(): void {
    // Pause rotation when component is destroyed
    this.rotationService.pause();
  }
}
