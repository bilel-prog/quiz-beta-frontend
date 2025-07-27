import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { RouterModule } from '@angular/router';
import { SignupComponent } from './auth/signup/signup.component';
import { LoginComponent } from './auth/login/login.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
@NgModule({
  declarations: [
    
  ],
  imports: [NzFormModule,CommonModule, RouterModule, NzLayoutModule, SignupComponent,FormsModule,ReactiveFormsModule,NzInputModule,NzButtonModule,LoginComponent,CommonModule,
    NzCardModule,
    NzGridModule,
    NzButtonModule
    ],
  exports: [NzLayoutModule, NzButtonModule, RouterModule, SignupComponent, LoginComponent, NzFormModule, ReactiveFormsModule, CommonModule,
    NzCardModule,
    NzGridModule,
    NzButtonModule],
  
})
export class SharedModule {}
