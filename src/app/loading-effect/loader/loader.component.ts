import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { loaderService } from '../loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overlay" *ngIf="loader.loading$ | async">
      <div class="spinner"></div>
      <p style="color: #ffffff">Loading...</p>
    </div>
  `,
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent {
  constructor(public loader: loaderService) {}
}
