import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuoteDisplayComponent } from './features/quote-display/quote-display.component';
import { RotationControlsComponent } from './features/controls/rotation-controls.component';
import { QuoteGridComponent } from './features/quote-grid/quote-grid.component';
import { DataService } from './core/services';

type ViewType = 'display' | 'grid';

@Component({
  selector: 'app-root',
  imports: [CommonModule, QuoteDisplayComponent, RotationControlsComponent, QuoteGridComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  title = 'Trích Dẫn Phật Giáo';
  currentView: ViewType = 'display';
  
  // Loading and error states
  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);
  errorMessage = signal<string>('');

  constructor(private dataService: DataService) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.dataService.loadQuotes();
      this.isLoading.set(false);
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.isLoading.set(false);
      this.hasError.set(true);
      this.errorMessage.set(
        'Không thể tải dữ liệu trích dẫn. Vui lòng thử lại sau.'
      );
    }
  }

  setView(view: ViewType): void {
    this.currentView = view;
  }

  retryLoad(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.errorMessage.set('');
    this.ngOnInit();
  }
}
