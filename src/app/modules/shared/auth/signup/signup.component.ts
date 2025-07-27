// signup.component.ts
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  validateForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private message: NzMessageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required]],
      name: [null, [Validators.required]]
    });
  }
  goToLogin(): void {
  this.router.navigate(['/login']);}
  submitForm(): void {
  if (this.validateForm.valid) {
    console.log('Submitting form:', this.validateForm.value);
    this.authService.register(this.validateForm.value).subscribe({
      next: (res) => {
        console.log('Registration response:', res);
        this.message.success('Registration successful!', { nzDuration: 3000 });
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.message.error(
          error?.error?.message || 'Registration failed (user exists)',
          { nzDuration: 5000 }
        );
      }
    });
  } else {
    this.message.warning('Please complete all required fields');
  }
  
}

}






