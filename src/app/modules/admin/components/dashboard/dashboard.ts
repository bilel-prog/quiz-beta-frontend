import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AdminService } from '../../services/admin.service';
import { NzCardModule } from 'ng-zorro-antd/card';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SharedModule, CommonModule, NzCardModule, PaginationComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard {
  tests = [];
  
  // Pagination properties
  pageIndex = 1;
  pageSize = 10;
  totalTests = 0;
  loading = false;
  
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
}
