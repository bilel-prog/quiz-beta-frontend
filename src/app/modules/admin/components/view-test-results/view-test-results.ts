import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';
import { AdminService } from '../../services/admin.service';
import { NzTableModule } from 'ng-zorro-antd/table';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-view-test-results',
  standalone: true,
  imports: [SharedModule, NzTableModule, PaginationComponent],
  templateUrl: './view-test-results.html',
  styleUrl: './view-test-results.scss'
})
export class ViewTestResults {
  results: any[] = [];
  
  // Pagination properties
  pageIndex = 1;
  pageSize = 10;
  totalResults = 0;
  loading = false;
  
  constructor(private adminService: AdminService) {}
  
  ngOnInit(): void {
    this.getTestResults();
  }
  
  getTestResults(): void {
    this.loading = true;
    this.adminService.getTestResultsPaged(this.pageIndex - 1, this.pageSize).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.results = response;
          this.totalResults = response.length;
        } else {
          this.results = response.content || [];
          this.totalResults = response.totalElements || this.results.length;
        }
        this.loading = false;
        console.log('Test Results:', this.results);
      },
      error: (error) => {
        console.error('Paginated results failed, trying fallback:', error);
        // Fallback to non-paginated endpoint
        this.adminService.getTestResults().subscribe({
          next: (data: any) => {
            this.results = data || [];
            this.totalResults = this.results.length;
            this.loading = false;
            console.log('Fallback Test Results:', this.results);
          },
          error: (fallbackError) => {
            console.error('Error fetching test results', fallbackError);
            this.loading = false;
          }
        });
      }
    });
  }
  
  onPageChange(page: number): void {
    this.pageIndex = page;
    this.getTestResults();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.getTestResults();
  }
}
