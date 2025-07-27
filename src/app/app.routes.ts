import { Routes } from '@angular/router';
import { SignupComponent } from './modules/shared/auth/signup/signup.component';
import { LoginComponent } from './modules/shared/auth/login/login.component';
import { AdminGuard } from './guards/admin.guard';
import { UserGuard } from './guards/user.guard';
import { LoginGuard } from './guards/login.guard';

export const routes: Routes = [
  // Default route
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  
  // Authentication routes (only accessible when NOT logged in)
  { path: 'register', component: SignupComponent, canActivate: [LoginGuard] },
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  
  // User routes (protected by UserGuard)
  { 
    path: 'user', 
    loadChildren: () => import('./modules/user/user-module').then(m => m.UserModule),
    canActivate: [UserGuard]
  },
  
  // Admin routes (protected by AdminGuard)
  { 
    path: 'admin', 
    loadChildren: () => import('./modules/admin/admin-module').then(m => m.AdminModule),
    canActivate: [AdminGuard]
  },
  
  // Wildcard route - redirect to login
  { path: '**', redirectTo: '/login' }
];

