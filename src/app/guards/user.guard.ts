import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserStorageService } from '../modules/shared/auth/services/user-storage.service';

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    // Check if user is logged in and is a regular user (not admin)
    const user = UserStorageService.getUser();
    const role = UserStorageService.getUserRole();
    
    console.log('UserGuard - User:', user, 'Role:', role); // Debug log
    
    if (user && role && role !== 'ADMIN') {
      return true;
    }
    
    // If not a regular user, redirect to login
    console.warn('Access denied: User authentication required');
    this.router.navigate(['/login']);
    return false;
  }
}