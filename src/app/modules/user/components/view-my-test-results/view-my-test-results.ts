import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';
import { Test } from '../../services/test'; 
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

@Component({
  selector: 'app-view-my-test-results',
  standalone: true,
  imports: [
    SharedModule,
    CommonModule,
    NzTableModule,
    NzCardModule,
    NzButtonModule,
    NzSpinModule,
    NzIconModule,
    NzStatisticModule,
    NzProgressModule,
    NzTagModule,
    NzEmptyModule,
    NzPaginationModule
  ],
  templateUrl: './view-my-test-results.html',
  styleUrl: './view-my-test-results.scss'
})
export class ViewMyTestResults implements OnInit {
  // Score summary properties
  get averageScore(): number {
    if (!this.dataSet.length) return 0;
    const total = this.dataSet.reduce((sum, r) => sum + this.getScorePercentage(r), 0);
    return Math.round(total / this.dataSet.length);
  }
  get bestScore(): number {
    if (!this.dataSet.length) return 0;
    return Math.max(...this.dataSet.map(r => this.getScorePercentage(r)));
  }
  getScorePercentage(result: any): number {
    if (result.score && result.score > 1 && result.score <= 100) {
      return Math.round(result.score);
    }
    if (result.correctAnswers !== undefined && result.totalQuestions) {
      return Math.round((result.correctAnswers / result.totalQuestions) * 100);
    }
    if (result.score !== undefined && result.totalQuestions) {
      return Math.round((result.score / result.totalQuestions) * 100);
    }
    if (result.score && result.score <= 1) {
      return Math.round(result.score * 100);
    }
    return 0;
  }
  getCorrectAnswersCount(result: any): number {
    return result.correctAnswers || 0;
  }
  getScoreColor(percentage: number): string {
    if (percentage >= 80) return '#52c41a';
    if (percentage >= 50) return '#faad14';
    return '#f5222d';
  }
  // Pagination state
  pageIndex = 1;
  pageSize = 5;
  dataSet: any[] = [];
  totalResults = 0;
  loading = true;
  
  constructor(private testService: Test) {}

  ngOnInit(): void {
    this.getMyTestResults();
  }

  getMyTestResults(): void {
    this.loading = true;
    this.testService.getMyTestResultsPaged(this.pageIndex - 1, this.pageSize).subscribe({
      next: (response: any) => {
        console.log('Response received:', response); // Debug log
        if (Array.isArray(response)) {
          this.dataSet = response;
          this.totalResults = response.length;
          console.log('Array response - totalResults:', this.totalResults); // Debug log
        } else {
          this.dataSet = response.content || [];
          this.totalResults = response.totalElements || this.dataSet.length;
          console.log('Object response - content:', this.dataSet.length, 'totalElements:', this.totalResults); // Debug log
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching my test results', error);
        this.loading = false;
      }
    });

  }

  updatePagedResults(): void {
    // Method removed, backend handles paging
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.getMyTestResults();
  }
  // ...existing code...

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
