import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AdminService } from '../../services/admin.service';
import { forkJoin } from 'rxjs';

interface UserInterface {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface UserDetailsInterface extends UserInterface {
  createdTests?: any[];
  takenTests?: any[];
  createdTestsPage?: number;
  takenTestsPage?: number;
  hasMoreCreatedTests?: boolean;
  hasMoreTakenTests?: boolean;
  loadingMoreCreatedTests?: boolean;
  loadingMoreTakenTests?: boolean;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzTableModule,
    NzButtonModule,
    NzTagModule,
    NzIconModule,
    NzSpinModule,
    NzModalModule,
    NzPaginationModule
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: UserInterface[] = [];
  isLoading = false;
  
  // Pagination properties
  pageIndex = 1;
  pageSize = 20;
  totalUsers = 0;
  
  // Modal states
  showUserDetailsModal = false;
  showDeleteModal = false;
  isDeletingUser = false;
  
  // Selected user data
  selectedUser: UserDetailsInterface | null = null;
  userToDelete: UserInterface | null = null;
  deletingUserIds = new Set<number>();
  
  // Loading states for user details
  loadingUserDetails = false;

  constructor(
    private adminService: AdminService,
    private notification: NzNotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    console.log('Loading users with pagination - page:', this.pageIndex - 1, 'size:', this.pageSize);
    
    this.adminService.getUsersPaged(this.pageIndex - 1, this.pageSize).subscribe({
      next: (response: any) => {
        console.log('Users response received:', response);
        if (Array.isArray(response)) {
          this.users = response;
          this.totalUsers = response.length;
        } else {
          this.users = response.content || [];
          this.totalUsers = response.totalElements || this.users.length;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading users:', error);
        this.notification.error('ERROR', 'Failed to load users. Please try again.', { nzDuration: 5000 });
      }
    });
  }

  // Pagination methods
  onPageChange(page: number): void {
    this.pageIndex = page;
    this.loadUsers();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadUsers();
  }

  // Stats methods
  getTotalUsers(): number {
    return this.totalUsers;
  }

  getActiveUsers(): number {
    return this.users.filter(user => user.role === 'USER').length;
  }

  getAdminUsers(): number {
    return this.users.filter(user => user.role === 'ADMIN').length;
  }

  // User actions
  viewUserDetails(user: UserInterface): void {
    this.selectedUser = { 
      ...user,
      createdTests: [],
      takenTests: [],
      createdTestsPage: 0,
      takenTestsPage: 0,
      hasMoreCreatedTests: true,
      hasMoreTakenTests: true,
      loadingMoreCreatedTests: false,
      loadingMoreTakenTests: false
    };
    this.showUserDetailsModal = true;
    this.loadingUserDetails = true;
    
    // Load first page of user's created tests and taken tests
    const createdTests$ = this.adminService.getUserCreatedTestsPaged(user.id, 0, 5);
    const takenTests$ = this.adminService.getUserTakenTestsPaged(user.id, 0, 5);
    
    // Use forkJoin to load both simultaneously
    forkJoin({
      createdTests: createdTests$,
      takenTests: takenTests$
    }).subscribe({
      next: (response) => {
        if (this.selectedUser) {
          // Handle created tests pagination
          if (response.createdTests.content) {
            this.selectedUser.createdTests = response.createdTests.content;
            this.selectedUser.hasMoreCreatedTests = !response.createdTests.last;
            this.selectedUser.createdTestsPage = 0;
          } else {
            this.selectedUser.createdTests = response.createdTests || [];
            this.selectedUser.hasMoreCreatedTests = false;
          }
          
          // Handle taken tests pagination
          if (response.takenTests.content) {
            this.selectedUser.takenTests = response.takenTests.content;
            this.selectedUser.hasMoreTakenTests = !response.takenTests.last;
            this.selectedUser.takenTestsPage = 0;
          } else {
            this.selectedUser.takenTests = response.takenTests || [];
            this.selectedUser.hasMoreTakenTests = false;
          }
        }
        this.loadingUserDetails = false;
      },
      error: (error) => {
        console.error('Error loading user details:', error);
        this.loadingUserDetails = false;
        this.notification.warning('WARNING', 'Could not load all user details. Showing basic information only.', { nzDuration: 3000 });
      }
    });
  }

  loadMoreCreatedTests(): void {
    if (!this.selectedUser || this.selectedUser.loadingMoreCreatedTests || !this.selectedUser.hasMoreCreatedTests) {
      return;
    }

    this.selectedUser.loadingMoreCreatedTests = true;
    const nextPage = (this.selectedUser.createdTestsPage || 0) + 1;

    this.adminService.getUserCreatedTestsPaged(this.selectedUser.id, nextPage, 5).subscribe({
      next: (response) => {
        if (this.selectedUser) {
          if (response.content) {
            this.selectedUser.createdTests = [...(this.selectedUser.createdTests || []), ...response.content];
            this.selectedUser.hasMoreCreatedTests = !response.last;
            this.selectedUser.createdTestsPage = nextPage;
          }
          this.selectedUser.loadingMoreCreatedTests = false;
        }
      },
      error: (error) => {
        console.error('Error loading more created tests:', error);
        if (this.selectedUser) {
          this.selectedUser.loadingMoreCreatedTests = false;
        }
        this.notification.error('ERROR', 'Failed to load more tests.', { nzDuration: 3000 });
      }
    });
  }

  loadMoreTakenTests(): void {
    if (!this.selectedUser || this.selectedUser.loadingMoreTakenTests || !this.selectedUser.hasMoreTakenTests) {
      return;
    }

    this.selectedUser.loadingMoreTakenTests = true;
    const nextPage = (this.selectedUser.takenTestsPage || 0) + 1;

    this.adminService.getUserTakenTestsPaged(this.selectedUser.id, nextPage, 5).subscribe({
      next: (response) => {
        if (this.selectedUser) {
          if (response.content) {
            this.selectedUser.takenTests = [...(this.selectedUser.takenTests || []), ...response.content];
            this.selectedUser.hasMoreTakenTests = !response.last;
            this.selectedUser.takenTestsPage = nextPage;
          }
          this.selectedUser.loadingMoreTakenTests = false;
        }
      },
      error: (error) => {
        console.error('Error loading more taken tests:', error);
        if (this.selectedUser) {
          this.selectedUser.loadingMoreTakenTests = false;
        }
        this.notification.error('ERROR', 'Failed to load more test results.', { nzDuration: 3000 });
      }
    });
  }

  confirmDeleteUser(user: UserInterface): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  deleteUser(): void {
    if (this.userToDelete) {
      this.isDeletingUser = true;
      this.deletingUserIds.add(this.userToDelete.id);
      
      this.adminService.deleteUser(this.userToDelete.id).subscribe({
        next: () => {
          this.isDeletingUser = false;
          this.deletingUserIds.delete(this.userToDelete!.id);
          this.hideDeleteModal();
          this.notification.success('SUCCESS', 'User deleted successfully!', { nzDuration: 3000 });
          this.loadUsers(); // Refresh the list
        },
        error: (error) => {
          this.isDeletingUser = false;
          this.deletingUserIds.delete(this.userToDelete!.id);
          console.error('Error deleting user:', error);
          this.notification.error('ERROR', 'Failed to delete user. Please try again.', { nzDuration: 5000 });
        }
      });
    }
  }

  // Modal management
  hideUserDetailsModal(): void {
    this.showUserDetailsModal = false;
    this.selectedUser = null;
  }

  hideDeleteModal(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  refreshUsers(): void {
    this.loadUsers();
  }
}
