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

interface Test {
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
    RouterModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  tests: Test[] = [];
  isLoading = false;
  completedTests = 0;
  averageScore = 0;

  constructor(
    private notification: NzNotificationService,
    private testService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAllTests();
    
  }

  getAllTests(): void {
    this.isLoading = true;
    this.testService.getAllTest().subscribe({
      next: (data: Test[]) => {
        this.tests = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching tests:', error);
        this.notification.error('ERROR', 'Failed to load tests. Please try again.', { nzDuration: 5000 });
      }
    });
  }

  

  takeTest(testId: number): void {
    // Navigate to test taking page
    this.router.navigate(['/user/take-test', testId]);
  }

  trackByTestId(index: number, test: Test): number {
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
    return this.tests.reduce((total, test) => total + (test.questionCount || 10), 0);
  }

  getAverageTime(): string {
    if (this.tests.length === 0) return '0m';
    const averageSeconds = this.tests.reduce((total, test) => total + test.timePerQuestion, 0) / this.tests.length;
    return this.getFormattedTime(Math.round(averageSeconds));
  }

  refreshTests(): void {
    this.getAllTests();
  }
}