import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing-module';
import { Dashboard } from './components/dashboard/dashboard';
import { CreateTestComponent } from './components/create-test/create-test.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { AddQuestionInTestComponent } from './components/add-question-in-test/add-question-in-test.component';
import { ViewTestComponent } from './components/view-test-component/view-test-component';
import { ViewTestResults } from './components/view-test-results/view-test-results';

@NgModule({
  declarations: [
    
  
    
  
   
  
    
  ],
  imports: [
    CommonModule,
    Dashboard,
    AdminRoutingModule,
    CreateTestComponent,  ReactiveFormsModule,      // ✅ POUR formGroup
    FormsModule,              // Si tu utilises ngModel aussi
    NzFormModule,             // ✅ POUR nz-form
    NzInputModule,            // ✅ POUR nz-input
    NzButtonModule,
    NzCardModule,
    AddQuestionInTestComponent,
    ViewTestComponent, 
    ViewTestResults,           
  ]
})
export class AdminModule { }
