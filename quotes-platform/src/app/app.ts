import { Component } from '@angular/core';
import { QuoteDisplayComponent } from './features/quote-display/quote-display.component';
import { RotationControlsComponent } from './features/controls/rotation-controls.component';
import { QuoteGridComponent } from './features/quote-grid/quote-grid.component';

@Component({
  selector: 'app-root',
  imports: [QuoteDisplayComponent, RotationControlsComponent, QuoteGridComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'Trích Dẫn Phật Giáo';
}
