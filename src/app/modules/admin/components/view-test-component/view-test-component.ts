import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
  selector: 'app-view-test-component',
  standalone: true,
  imports: [SharedModule, CommonModule, NzCardModule, ReactiveFormsModule],
  templateUrl: './view-test-component.html',  // ✅ correct name
  styleUrls: ['./view-test-component.scss']   // ✅ corrected
})
export class ViewTestComponent {
  questions: any[] = [];
  testId: number | null = null;

  constructor(private adminService: AdminService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.testId = this.route.snapshot.params['id'];
    if (this.testId) {
      this.adminService.getTestQuestions(this.testId).subscribe({
        next: (data) => {
          console.log("Fetched test data:", data); // ✅ Debugging
          this.questions = data.questions; // ✅ Correctly assign
        },
        error: (error) => {
          console.error('Error fetching test questions:', error);
        }
      });
    }
  }
}
