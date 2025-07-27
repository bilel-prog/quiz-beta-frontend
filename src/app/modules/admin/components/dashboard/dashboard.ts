import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AdminService } from '../../services/admin.service';
import { NzCardModule } from 'ng-zorro-antd/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SharedModule,CommonModule, NzCardModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']  // ✅ Correction ici
})
export class Dashboard {
  tests = [];

  constructor(
    private notification: NzNotificationService,
    private testServise: AdminService
  ) {}

  ngOnInit(): void {
    this.getAllTests();
  }

  getAllTests(): void {
    this.testServise.getAllTest().subscribe(
      (data: any) => {
        this.tests = data;
      },
      error => {
        this.notification.error('ERROR', 'Something Went Wrong. Try Again', { nzDuration: 5000 });
      }
    );
  }

  getFormattedTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes} minutes ${seconds} seconds`;  // ✅ Utilise des backticks pour interpoler
  }

  getTotalQuestions(): number {
    return this.tests.reduce((total, test) => total + (test.questionCount || 0), 0);
  }

  getActiveTests(): number {
    return this.tests.filter(test => test.isActive !== false).length;
  }
}
