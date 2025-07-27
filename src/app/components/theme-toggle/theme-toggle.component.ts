import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="theme-toggle btn btn-secondary" (click)="toggleTheme()" [title]="getToggleTitle()">
      <svg *ngIf="(themeService.theme$ | async) === 'light'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
      <svg *ngIf="(themeService.theme$ | async) === 'dark'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
    </button>
  `,
  styles: [`
    .theme-toggle {
      border: none;
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text-primary);
      width: 40px;
      height: 40px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    
    .theme-toggle:hover {
      background: var(--surface-secondary);
      border-color: var(--primary);
    }
  `]
})
export class ThemeToggleComponent {
  constructor(public themeService: ThemeService) {}

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  getToggleTitle(): string {
    const currentTheme = this.themeService.getCurrentTheme();
    return currentTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
  }
}