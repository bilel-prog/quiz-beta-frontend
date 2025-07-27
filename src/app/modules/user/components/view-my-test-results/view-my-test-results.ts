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
    NzEmptyModule
  ],
  templateUrl: './view-my-test-results.html',
  styleUrl: './view-my-test-results.scss'
})
export class ViewMyTestResults implements OnInit {
  dataSet: any[] = [];
  loading = true;
  
  constructor(private testService: Test) {}

  ngOnInit(): void {
    this.getMyTestResults();
  }

  getMyTestResults(): void {
    this.loading = true;
    this.testService.getMyTestResults().subscribe({
      next: (data: any) => {
        this.dataSet = data || [];
        console.log('My Test Results:', this.dataSet);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching my test results', error);
        this.loading = false;
      }
    });
  }

  getScorePercentage(result: any): number {
    console.log('Calculating percentage for result:', result);
    
    // If score is already a percentage (0-100), return it directly
    if (result.score && result.score > 1 && result.score <= 100) {
      return Math.round(result.score);
    }
    
    // If we have correctAnswers and totalQuestions, calculate percentage
    if (result.correctAnswers !== undefined && result.totalQuestions) {
      return Math.round((result.correctAnswers / result.totalQuestions) * 100);
    }
    
    // If we have score (0-1) and totalQuestions, calculate percentage
    if (result.score !== undefined && result.totalQuestions) {
      return Math.round((result.score / result.totalQuestions) * 100);
    }
    
    // If score is a decimal (0-1), convert to percentage
    if (result.score && result.score <= 1) {
      return Math.round(result.score * 100);
    }
    
    console.warn('Could not calculate percentage for result:', result);
    return 0;
  }

  getCorrectAnswersCount(result: any): number {
    // If we have correctAnswers directly, use it
    if (result.correctAnswers !== undefined) {
      return result.correctAnswers;
    }
    
    // If score is a percentage and we have totalQuestions, calculate correct answers
    if (result.score && result.totalQuestions) {
      if (result.score > 1) {
        // Score is percentage (0-100)
        return Math.round((result.score / 100) * result.totalQuestions);
      } else {
        // Score is decimal (0-1)
        return Math.round(result.score * result.totalQuestions);
      }
    }
    
    return 0;
  }

  getScoreColor(percentage: number): string {
    if (percentage >= 80) return '#52c41a';
    if (percentage >= 60) return '#faad14';
    return '#f5222d';
  }

  getGradeLetter(percentage: number): string {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getFormattedDate(dateString: string | undefined): string {
    if (!dateString) {
      return this.getCurrentDate();
    }
    return this.formatDate(dateString);
  }

  get averageScore(): number {
    if (!this.dataSet || this.dataSet.length === 0) return 0;
    const total = this.dataSet.reduce((sum, item) => sum + this.getScorePercentage(item), 0);
    return Math.round((total / this.dataSet.length) * 10) / 10;
  }

  get bestScore(): number {
    if (!this.dataSet || this.dataSet.length === 0) return 0;
    return Math.max(...this.dataSet.map(item => this.getScorePercentage(item)));
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
