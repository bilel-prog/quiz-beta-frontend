import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserStorageService } from '../modules/shared/auth/services/user-storage.service';
// test test 123
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    // Check if user is logged in and is an admin
    const user = UserStorageService.getUser();
    const role = UserStorageService.getUserRole();
    
    console.log('AdminGuard - User:', user, 'Role:', role); // Debug log
    
    if (user && role === 'ADMIN') {
      return true;
    }
    
    // If not admin, redirect to login
    console.warn('Access denied: Admin authentication required');
    this.router.navigate(['/login']);
    return false;
  }
}