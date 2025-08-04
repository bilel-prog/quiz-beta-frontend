import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Test } from '../../services/test';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

interface TestInterface {
  id: number;
  title: string;
  description: string;
  timePerQuestion: number;
  questionCount?: number;
  createdByUserId?: number;
  createdByUserName?: string;
}

@Component({
  selector: 'app-my-tests',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NzCardModule,
    NzGridModule,
    NzButtonModule,
    NzTagModule,
    NzIconModule,
    NzSpinModule,
    NzEmptyModule,
    NzTypographyModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzTableModule,
    NzPaginationModule,
    RouterModule,
    PaginationComponent
  ],
  templateUrl: './my-tests.component.html',
  styleUrls: ['./my-tests.component.scss']
})
export class MyTestsComponent implements OnInit {
  myTests: TestInterface[] = [];
  isLoading = false;
  
  // Make String available to template
  String = String;
  
  // Pagination properties
  pageIndex = 1;
  pageSize = 12;
  totalMyTests = 0;
  
  // Modal states
  showCreateModal = false;
  showDeleteModal = false;
  showResultsModal = false;
  isCreatingTest = false;
  isDeletingTest = false;
  loadingResults = false;
  
  // Form and delete tracking
  createTestForm: FormGroup;
  testToDelete: TestInterface | null = null;
  deletingTestIds = new Set<number>();
  
  // Test results data
  testResults: any[] = [];
  selectedTestId: number | null = null;
  selectedTestTitle: string = '';
  
  // Pagination for results
  resultsPageIndex = 1;
  resultsPageSize = 10;
  totalResults = 0;
  
  // Lazy loading states
  resultsLoaded = false;

  constructor(
    private notification: NzNotificationService,
    private testService: Test,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.createTestForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      timePerQuestion: [60, [Validators.required, Validators.min(10), Validators.max(300)]]
    });
  }

  ngOnInit(): void {
    this.getMyTests();
  }

  getMyTests(): void {
    this.isLoading = true;
    console.log('Fetching my tests with pagination - page:', this.pageIndex - 1, 'size:', this.pageSize);
    
    this.testService.getMyTestsPaged(this.pageIndex - 1, this.pageSize).subscribe({
      next: (response: any) => {
        console.log('My tests response received:', response);
        if (Array.isArray(response)) {
          this.myTests = response;
          this.totalMyTests = response.length;
        } else {
          this.myTests = response.content || [];
          this.totalMyTests = response.totalElements || this.myTests.length;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching my tests:', error);
        this.notification.error('ERROR', 'Failed to load your tests. Please try again.', { nzDuration: 5000 });
      }
    });
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.getMyTests();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.getMyTests();
  }

  trackByTestId(index: number, test: TestInterface): number {
    return test.id;
  }

  getTotalQuestions(): number {
    return this.myTests.reduce((total, test) => total + (test.questionCount || 0), 0);
  }

  getAverageTime(): string {
    if (this.myTests.length === 0) return '0 min';
    
    const totalTime = this.myTests.reduce((total, test) => {
      const questionsCount = test.questionCount || 5; // Default assumption
      return total + (test.timePerQuestion * questionsCount);
    }, 0);
    
    const averageTime = totalTime / this.myTests.length;
    return this.getFormattedTime(averageTime);
  }

  getFormattedTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds} sec`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      if (remainingSeconds === 0) {
        return `${minutes} min`;
      } else {
        return `${minutes}m ${remainingSeconds}s`;
      }
    }
  }

  // Modal management
  showCreateTestModal(): void {
    this.showCreateModal = true;
    this.createTestForm.reset({
      title: '',
      description: '',
      timePerQuestion: 60
    });
  }

  hideCreateTestModal(): void {
    this.showCreateModal = false;
    this.createTestForm.reset();
  }

  confirmDeleteTest(test: TestInterface): void {
    this.testToDelete = test;
    this.showDeleteModal = true;
  }

  hideDeleteModal(): void {
    this.showDeleteModal = false;
    this.testToDelete = null;
  }

  // CRUD operations
  createTest(): void {
    if (this.createTestForm.valid) {
      this.isCreatingTest = true;
      const testData = this.createTestForm.value;
      
      this.testService.createMyTest(testData).subscribe({
        next: (response) => {
          this.isCreatingTest = false;
          this.hideCreateTestModal();
          this.notification.success('SUCCESS', 'Test created successfully!', { nzDuration: 3000 });
          this.getMyTests(); // Refresh the list
          
          // Navigate to edit page to add questions
          if (response && response.id) {
            this.router.navigate(['/user/edit-test', response.id]);
          }
        },
        error: (error) => {
          this.isCreatingTest = false;
          console.error('Error creating test:', error);
          this.notification.error('ERROR', 'Failed to create test. Please try again.', { nzDuration: 5000 });
        }
      });
    }
  }

  deleteTest(): void {
    if (this.testToDelete) {
      this.isDeletingTest = true;
      this.deletingTestIds.add(this.testToDelete.id);
      
      this.testService.deleteMyTest(this.testToDelete.id).subscribe({
        next: () => {
          this.isDeletingTest = false;
          this.deletingTestIds.delete(this.testToDelete!.id);
          this.hideDeleteModal();
          this.notification.success('SUCCESS', 'Test deleted successfully!', { nzDuration: 3000 });
          this.getMyTests(); // Refresh the list
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

  refreshTests(): void {
    this.getMyTests();
  }

  // Test Results functionality
  viewTestResults(testId: number, testTitle: string): void {
    this.selectedTestId = testId;
    this.selectedTestTitle = testTitle;
    this.showResultsModal = true;
    
    // Reset pagination and loading state
    this.resultsPageIndex = 1;
    this.resultsLoaded = false;
    this.testResults = [];
    
    // Lazy load results only when modal opens
    this.loadTestResults(testId);
  }

  loadTestResults(testId: number, page: number = 1): void {
    this.loadingResults = true;
    
    // Update pagination
    this.resultsPageIndex = page;
    
    this.testService.getTestResultsByTestIdPaged(testId, page - 1, this.resultsPageSize).subscribe({
      next: (response: any) => {
        console.log('Test results response:', response);
        
        if (Array.isArray(response)) {
          // Simple array response
          this.testResults = response;
          this.totalResults = response.length;
        } else if (response.content) {
          // Paginated response
          this.testResults = response.content;
          this.totalResults = response.totalElements || response.totalItems || 0;
        } else {
          // Fallback for different response formats
          this.testResults = [];
          this.totalResults = 0;
        }
        
        this.loadingResults = false;
        this.resultsLoaded = true;
        console.log('Test results loaded for test ID', testId, ':', this.testResults);
      },
      error: (error) => {
        this.loadingResults = false;
        this.resultsLoaded = true;
        console.error('Error loading test results:', error);
        this.notification.error('ERROR', 'Failed to load test results. Please try again.', { nzDuration: 5000 });
      }
    });
  }

  onResultsPageChange(page: number): void {
    if (this.selectedTestId) {
      this.loadTestResults(this.selectedTestId, page);
    }
  }

  onResultsPageSizeChange(size: number): void {
    this.resultsPageSize = size;
    this.resultsPageIndex = 1;
    if (this.selectedTestId) {
      this.loadTestResults(this.selectedTestId, 1);
    }
  }

  hideResultsModal(): void {
    this.showResultsModal = false;
    this.testResults = [];
    this.selectedTestId = null;
    this.selectedTestTitle = '';
    this.resultsLoaded = false;
    this.resultsPageIndex = 1;
    this.totalResults = 0;
  }

  getScoreColor(percentage: number): string {
    if (percentage >= 80) return '#52c41a'; // Green
    if (percentage >= 60) return '#faad14'; // Orange
    return '#ff4d4f'; // Red
  }

  formatDate(dateString: string | any): string {
    if (!dateString) return 'Unknown';
    try {
      // Handle both string dates and LocalDateTime arrays from Java
      let date: Date;
      
      if (Array.isArray(dateString)) {
        // Java LocalDateTime comes as [year, month, day, hour, minute, second, nano]
        const [year, month, day, hour, minute, second] = dateString;
        date = new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
      } else {
        date = new Date(dateString);
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return 'Unknown';
    }
  }
}
