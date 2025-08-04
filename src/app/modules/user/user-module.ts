import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing-module';

@NgModule({
  declarations: [
    // No declarations needed since all components are standalone
  ],
  imports: [
    CommonModule,
    UserRoutingModule
  ]
})
export class UserModule { }
