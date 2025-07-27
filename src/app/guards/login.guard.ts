import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserStorageService } from '../modules/shared/auth/services/user-storage.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    // Check if user is already logged in
    const user = UserStorageService.getUser();
    const role = UserStorageService.getUserRole();
    
    console.log('LoginGuard - User:', user, 'Role:', role); // Debug log
    
    if (user && role) {
      // User is already logged in, redirect to appropriate dashboard
      if (role === 'ADMIN') {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/user/dashboard']);
      }
      return false;
    }
    
    // User is not logged in, allow access to login/register pages
    return true;
  }
}