import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';

import { AuthService } from '../services/auth.service';
import { UserStorageService } from '../services/user-storage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  validateForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private message: NzMessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, Validators.required]
    });
  }
  goToR(): void {
  this.router.navigate(['/register']);
}

  submitForm(): void {
    if (this.validateForm.valid) {
      this.authService.login(this.validateForm.value).subscribe({
        next: (resp) => {
          console.log('Login response:', resp); // Debug log
          const res = resp as { 
            id: number; 
            role: string; 
            token?: string; 
            jwt?: string;
            name?: string;
            username?: string;
            email?: string;
          };
          this.message.success('Login successful!');
          
          // Save complete user data including token and any available name info
          const user = {
            id: res.id,
            role: res.role,
            token: res.token || res.jwt || 'authenticated', // Fallback token
            jwt: res.jwt || res.token || 'authenticated',
            name: res.name || res.username || res.email || (res.role === 'ADMIN' ? 'Administrator' : 'User'),
            email: res.email || this.validateForm.get('email')?.value // Use login email as fallback
          }
          
          console.log('Saving user:', user); // Debug log
          UserStorageService.saveUser(user);
          
          // Check authentication and navigate
          if(UserStorageService.isAdminLoggedIn()){
            this.router.navigateByUrl('admin/dashboard').then(() => {
              window.location.reload();
            });
          } else if(UserStorageService.isUserLoggedIn()){
            this.router.navigateByUrl('user/dashboard').then(() => {
              window.location.reload();
            });
          } else {
            console.error('Authentication check failed after login');
            this.message.error('Authentication error. Please try again.');
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          this.message.error('Login failed!');
        }
      });
    } else {
      this.message.warning('Please complete all required fields.');
    }
  }
}
