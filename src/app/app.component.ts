import { Component, OnInit, HostListener } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SharedModule } from './modules/shared/shared-module';
import { UserStorageService } from './modules/shared/auth/services/user-storage.service';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ThemeService } from './services/theme.service';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, SharedModule, CommonModule, NzIconModule, ThemeToggleComponent]
})
export class AppComponent implements OnInit {
  title = 'QuizWeb';
  isUserLoggedIn: boolean = UserStorageService.isUserLoggedIn();
  isAdminLoggedIn: boolean = UserStorageService.isAdminLoggedIn();
  isHeaderVisible = true;
  private lastScrollTop = 0;
  private scrollThreshold = 20; // Reduced threshold for more responsive behavior
  private ticking = false; // For scroll throttling

  constructor(
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.isUserLoggedIn = UserStorageService.getUserRole() === 'USER';
    this.isAdminLoggedIn = UserStorageService.getUserRole() === 'ADMIN';
    
    // Initialize scroll position
    this.lastScrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.updateHeaderVisibility();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  private updateHeaderVisibility() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    
    // Only hide/show if we've scrolled more than the threshold
    if (Math.abs(scrollTop - this.lastScrollTop) > this.scrollThreshold) {
      if (scrollTop > this.lastScrollTop && scrollTop > 80) {
        // Scrolling down and past 80px - hide header
        this.isHeaderVisible = false;
      } else if (scrollTop < this.lastScrollTop) {
        // Scrolling up - show header
        this.isHeaderVisible = true;
      }
      this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }
  }

  get isDarkMode(): boolean {
    return this.themeService.getCurrentTheme() === 'dark';
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout() {
    UserStorageService.signOut();
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }

  get currentUser() {
    const user = UserStorageService.getUser();
    if (!user) return null;
    
    // Try different possible name fields with smart email parsing
    if (user.name) return user.name;
    if (user.username) return user.username;
    if (user.firstName) return user.firstName;
    if (user.email) {
      // Extract name from email if available (e.g., john.doe@example.com -> John Doe)
      const emailPart = user.email.split('@')[0];
      if (emailPart.includes('.')) {
        const parts = emailPart.split('.');
        return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
      }
      return emailPart.charAt(0).toUpperCase() + emailPart.slice(1);
    }
    
    return 'User';
  }

  get adminName() {
    const user = UserStorageService.getUser();
    if (!user) return 'Administrator';
    
    // For admin, try different name fields with better fallbacks
    if (user.name) return user.name;
    if (user.username) return user.username;
    if (user.firstName) return user.firstName;
    if (user.email) {
      // Extract name from email if available (e.g., john.doe@example.com -> John Doe)
      const emailPart = user.email.split('@')[0];
      if (emailPart.includes('.')) {
        const parts = emailPart.split('.');
        return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
      }
      return emailPart.charAt(0).toUpperCase() + emailPart.slice(1);
    }
    
    return 'Administrator';
  }

  get userRole() {
    return UserStorageService.getUserRole();
  }
}
