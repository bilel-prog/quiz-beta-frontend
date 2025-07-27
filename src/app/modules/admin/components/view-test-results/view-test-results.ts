import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';
import { AdminService } from '../../services/admin.service';
import { NzTableModule } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-view-test-results',
  standalone: true,
  imports: [SharedModule, NzTableModule], // ✅ Import necessary modules
  // ✅ Import necessary modules if needed
  templateUrl: './view-test-results.html',
  styleUrl: './view-test-results.scss'
})
export class ViewTestResults {
  results: any[] = [];
  constructor(private adminService: AdminService) {}
  ngOnInit(): void {
    this.getTestResults();
  }
  getTestResults(): void {
    this.adminService.getTestResults().subscribe(
      (data: any) => {
        this.results = data;
        console.log('Test Results:', this.results);
      },
      error => {
        console.error('Error fetching test results', error);
      }
    );
  }
}
