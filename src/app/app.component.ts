import { Component, OnInit, HostListener } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SharedModule } from './modules/shared/shared-module';
import { UserStorageService } from './modules/shared/auth/services/user-storage.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { ThemeService } from './services/theme.service';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { AdminService } from './modules/admin/services/admin.service';
import { Test } from './modules/user/services/test';
import { Subject, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, SharedModule, CommonModule, FormsModule, NzIconModule, NzButtonModule, NzDropDownModule, NzMenuModule, ThemeToggleComponent]
})
export class AppComponent implements OnInit {
  title = 'QuizWeb';
  isUserLoggedIn: boolean = UserStorageService.isUserLoggedIn();
  isAdminLoggedIn: boolean = UserStorageService.isAdminLoggedIn();
  isHeaderVisible = true;
  private lastScrollTop = 0;
  private scrollThreshold = 20; // Reduced threshold for more responsive behavior
  private ticking = false; // For scroll throttling

  // Search functionality
  searchQuery = '';
  searchLoading = false;
  private searchSubject = new Subject<string>();
  
  // Create a static search subject for cross-component communication
  static searchQuery$ = new BehaviorSubject<string>('');

  constructor(
    public router: Router,
    private themeService: ThemeService,
    private adminService: AdminService,
    private userTestService: Test
  ) {
    // Set up search debouncing
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(query => {
        AppComponent.searchQuery$.next(query);
      });
  }

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

  // Search functionality methods
  onSearchInput(): void {
    this.searchSubject.next(this.searchQuery);
  }

  performSearch(): void {
    if (!this.searchQuery.trim()) {
      this.clearSearch();
      return;
    }
    
    this.searchLoading = true;
    
    // Emit search query immediately
    AppComponent.searchQuery$.next(this.searchQuery);
    
    // Simulate search completion after a short delay
    setTimeout(() => {
      this.searchLoading = false;
    }, 500);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchLoading = false;
    AppComponent.searchQuery$.next('');
  }

  // Static method to get search observable for other components
  static getSearchQuery$() {
    return AppComponent.searchQuery$.asObservable();
  }
}
