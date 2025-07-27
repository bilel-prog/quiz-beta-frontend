import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserStorageService } from '../modules/shared/auth/services/user-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    // Check if any user is logged in (admin or regular user)
    const user = UserStorageService.getUser();
    const token = UserStorageService.getToken();
    
    if (user && token) {
      return true;
    }
    
    // If not authenticated, redirect to login
    console.warn('Access denied: Authentication required');
    this.router.navigate(['/login']);
    return false;
  }
}