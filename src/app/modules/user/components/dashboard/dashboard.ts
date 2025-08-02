import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AdminService } from '../../../admin/services/admin.service';
import { Test } from '../../services/test';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

interface TestInterface {
  id: number;
  title: string;
  description: string;
  timePerQuestion: number;
  questionCount?: number;
  difficulty?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzGridModule,
    NzButtonModule,
    NzTagModule,
    NzIconModule,
    NzSpinModule,
    NzEmptyModule,
    NzTypographyModule,
    RouterModule,
    PaginationComponent
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  tests: TestInterface[] = [];
  isLoading = false;
  completedTests = 0;
  averageScore = 0;
  
  // Pagination properties
  pageIndex = 1;
  pageSize = 12;
  totalTests = 0;
  
  // Stats properties (for all tests, not just current page)
  allTestsStats = {
    totalTests: 0,
    totalQuestions: 0,
    averageTimePerQuestion: 0
  };

  constructor(
    private notification: NzNotificationService,
    private adminService: AdminService,
    private testService: Test,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAllTests();
    this.loadAllTestsStats();
  }

  getAllTests(): void {
    this.isLoading = true;
    console.log('Fetching tests with pagination - page:', this.pageIndex - 1, 'size:', this.pageSize);
    
    this.testService.getAllTestsPaged(this.pageIndex - 1, this.pageSize).subscribe({
      next: (response: any) => {
        console.log('Paginated response received:', response);
        if (Array.isArray(response)) {
          this.tests = response;
          this.totalTests = response.length;
          console.log('Array response - tests:', this.tests.length);
        } else {
          this.tests = response.content || [];
          this.totalTests = response.totalElements || this.tests.length;
          console.log('Object response - content:', this.tests.length, 'total:', this.totalTests);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Paginated endpoint failed, trying fallback:', error);
        // Fallback to non-paginated endpoint
        this.testService.getAllTest().subscribe({
          next: (data: any) => {
            console.log('Fallback response received:', data);
            this.tests = data || [];
            this.totalTests = this.tests.length;
            console.log('Fallback - tests:', this.tests.length);
            this.isLoading = false;
          },
          error: (fallbackError) => {
            this.isLoading = false;
            console.error('Error fetching tests:', fallbackError);
            this.notification.error('ERROR', 'Failed to load tests. Please try again.', { nzDuration: 5000 });
          }
        });
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
    this.testService.getAllTest().subscribe({
      next: (response: any) => {
        console.log('All tests response for user stats:', response); // Debug log
        
        // Handle paginated response structure
        const tests = Array.isArray(response) ? response : (response.content || []);
        console.log('All tests for user stats:', tests); // Debug log
        
        // Calculate total questions with fallback
        const totalQuestions = tests.reduce((total: number, test: any) => {
          const questionCount = test.questionCount || test.questions?.length || 0;
          console.log(`Test "${test.title}": ${questionCount} questions`); // Debug log
          return total + questionCount;
        }, 0);
        
        this.allTestsStats = {
          totalTests: response.totalElements || tests.length, // Use totalElements from pagination
          totalQuestions: totalQuestions,
          averageTimePerQuestion: tests.length > 0 ? 
            tests.reduce((total: number, test: any) => total + (test.timePerQuestion || 0), 0) / tests.length : 0
        };
        
        console.log('Final user stats:', this.allTestsStats); // Debug log
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  takeTest(testId: number): void {
    // Navigate to test taking page
    this.router.navigate(['/user/take-test', testId]);
  }

  trackByTestId(index: number, test: TestInterface): number {
    return test.id;
  }

  getFormattedTime(timeInSeconds: number): string {
    if (timeInSeconds < 60) {
      return `${timeInSeconds}s`;
    }
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    if (seconds === 0) {
      return `${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  }

  getTotalQuestions(): number {
    return this.allTestsStats.totalQuestions;
  }

  getAverageTime(): string {
    if (this.allTestsStats.averageTimePerQuestion === 0) return '0s';
    return this.getFormattedTime(Math.round(this.allTestsStats.averageTimePerQuestion));
  }

  getTotalAvailableTests(): number {
    return this.allTestsStats.totalTests;
  }

  refreshTests(): void {
    this.getAllTests();
  }
}