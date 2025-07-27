import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing-module';
import { Dashboard } from './components/dashboard/dashboard';
import { TakeTest } from './components/take-test/take-test';
import { ViewMyTestResults } from './components/view-my-test-results/view-my-test-results';



@NgModule({
  declarations: [
   
  
   
  
   
  
    
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    Dashboard,
    TakeTest,
  ViewMyTestResults,    
  ]
})
export class UserModule { }
