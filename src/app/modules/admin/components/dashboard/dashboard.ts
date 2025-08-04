import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { AdminService } from '../../services/admin.service';
import { NzCardModule } from 'ng-zorro-antd/card';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { Subscription } from 'rxjs';
import { AppComponent } from '../../../../app.component';

interface TestInterface {
  id: number;
  title: string;
  description?: string;
  time: number;
  questionCount?: number;
  isActive?: boolean;
  createdByUserId?: number;
  createdByUserName?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SharedModule, CommonModule, NzCardModule, NzModalModule, NzDropDownModule, NzMenuModule, PaginationComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit, OnDestroy {
  tests: TestInterface[] = [];
  searchResults: TestInterface[] = [];
  
  // Pagination properties
  pageIndex = 1;
  pageSize = 10;
  totalTests = 0;
  loading = false;
  
  // Search properties
  searchQuery = '';
  isSearching = false;
  hasSearched = false;
  private headerSearchSubscription?: Subscription;
  
  // Modal states
  showDeleteModal = false;
  isDeletingTest = false;
  testToDelete: TestInterface | null = null;
  deletingTestIds = new Set<number>();
  
  // Stats properties (for all tests, not just current page)
  allTestsStats = {
    totalTests: 0,
    totalQuestions: 0,
    activeTests: 0
  };

  constructor(
    private notification: NzNotificationService,
    private testServise: AdminService
  ) {}

  ngOnInit(): void {
    this.getAllTests();
    this.loadAllTestsStats();
    this.setupHeaderSearch();
  }

  ngOnDestroy(): void {
    if (this.headerSearchSubscription) {
      this.headerSearchSubscription.unsubscribe();
    }
  }

  private setupHeaderSearch(): void {
    // Listen to header search from AppComponent
    this.headerSearchSubscription = AppComponent.getSearchQuery$().subscribe(query => {
      this.searchQuery = query;
      if (query.trim()) {
        this.performSearchInternal(query.trim());
      } else {
        this.clearSearch();
      }
    });
  }

  getDisplayTests(): TestInterface[] {
    return this.searchQuery && this.hasSearched ? this.searchResults : this.tests;
  }

  getAllTests(): void {
    this.loading = true;
    this.testServise.getAllTestsPaged(this.pageIndex - 1, this.pageSize).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.tests = response;
          this.totalTests = response.length;
        } else {
          this.tests = response.content || [];
          this.totalTests = response.totalElements || this.tests.length;
        }
        this.loading = false;
      },
      error: (error) => {
        this.notification.error('ERROR', 'Something Went Wrong. Try Again', { nzDuration: 5000 });
        this.loading = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.getAllTests();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.getAllTests();
  }

  loadAllTestsStats(): void {
    // Load all tests to calculate correct stats (not just current page)
    this.testServise.getAllTest().subscribe({
      next: (allTests: any) => {
        const tests = Array.isArray(allTests) ? allTests : (allTests.content || []);
        console.log('All tests for stats:', tests); // Debug log
        
        // Calculate total questions with fallback
        const totalQuestions = tests.reduce((total: number, test: any) => {
          const questionCount = test.questionCount || test.questions?.length || 0;
          console.log(`Test "${test.title}": ${questionCount} questions`); // Debug log
          return total + questionCount;
        }, 0);
        
        this.allTestsStats = {
          totalTests: tests.length,
          totalQuestions: totalQuestions,
          activeTests: tests.filter((test: any) => test.isActive !== false).length
        };
        
        console.log('Final stats:', this.allTestsStats); // Debug log
      },
      error: (error) => {
        console.error('Error loading admin stats:', error);
      }
    });
  }

  getFormattedTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes} minutes ${seconds} seconds`;  // ✅ Utilise des backticks pour interpoler
  }

  getTotalQuestions(): number {
    return this.allTestsStats.totalQuestions;
  }

  getActiveTests(): number {
    return this.allTestsStats.activeTests;
  }

  getTotalAvailableTests(): number {
    return this.allTestsStats.totalTests;
  }

  // Delete functionality
  confirmDeleteTest(test: TestInterface): void {
    this.testToDelete = test;
    this.showDeleteModal = true;
  }

  hideDeleteModal(): void {
    this.showDeleteModal = false;
    this.testToDelete = null;
  }

  deleteTest(): void {
    if (this.testToDelete) {
      this.isDeletingTest = true;
      this.deletingTestIds.add(this.testToDelete.id);
      
      this.testServise.deleteTest(this.testToDelete.id).subscribe({
        next: () => {
          this.isDeletingTest = false;
          this.deletingTestIds.delete(this.testToDelete!.id);
          this.hideDeleteModal();
          this.notification.success('SUCCESS', 'Test deleted successfully!', { nzDuration: 3000 });
          this.getAllTests(); // Refresh the list
          this.loadAllTestsStats(); // Refresh stats
        },
        error: (error) => {
          this.isDeletingTest = false;
          this.deletingTestIds.delete(this.testToDelete!.id);
          console.error('Error deleting test:', error);
          this.notification.error('ERROR', 'Failed to delete test. Please try again.', { nzDuration: 5000 });
        }
      });
    }
  }

  // Search methods
  private performSearchInternal(query: string): void {
    this.isSearching = true;
    
    // Use admin service search method
    this.testServise.searchTests(query).subscribe({
      next: (results) => {
        this.searchResults = results || [];
        this.hasSearched = true;
        this.isSearching = false;
      },
      error: (error) => {
        console.error('Search error:', error);
        this.isSearching = false;
        this.hasSearched = true;
        this.searchResults = [];
        this.notification.error('ERROR', 'Search failed. Please try again.', { nzDuration: 3000 });
      }
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.hasSearched = false;
  }

  highlightSearchTerm(text: string): string {
    if (!this.searchQuery || !text) {
      return text;
    }
    
    const searchTerm = this.searchQuery.trim();
    if (!searchTerm) {
      return text;
    }
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  }
}
