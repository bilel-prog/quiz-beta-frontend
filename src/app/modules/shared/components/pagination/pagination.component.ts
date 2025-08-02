import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, NzPaginationModule],
  template: `
    <div class="pagination-container" *ngIf="total > pageSize">
      <nz-pagination 
        [(nzPageIndex)]="currentPage"
        [nzTotal]="total" 
        [nzPageSize]="pageSize"
        [nzShowSizeChanger]="showSizeChanger"
        [nzPageSizeOptions]="pageSizeOptions"
        (nzPageIndexChange)="onPageChange($event)"
        (nzPageSizeChange)="onPageSizeChange($event)"
        [nzShowQuickJumper]="showQuickJumper">
      </nz-pagination>
    </div>
  `,
  styles: [`
    .pagination-container {
      display: flex;
      justify-content: center;
      margin-top: 16px;
      padding: 16px 0;
    }
  `]
})
export class PaginationComponent {
  @Input() total: number = 0;
  @Input() pageSize: number = 10;
  @Input() currentPage: number = 1;
  @Input() showSizeChanger: boolean = true;
  @Input() showQuickJumper: boolean = true;
  @Input() pageSizeOptions: number[] = [5, 10, 20, 50];

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  onPageChange(page: number): void {
    this.currentPage = page;
    this.pageChange.emit(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1; // Reset to first page when changing page size
    this.pageSizeChange.emit(size);
  }
}
