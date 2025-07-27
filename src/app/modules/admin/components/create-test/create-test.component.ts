import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router'; // ← Import Router
import { SharedModule } from '../../../shared/shared-module';
import { AdminService } from '../../services/admin.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
selector: 'app-create-test',
standalone: true,
imports: [SharedModule,CommonModule, NzCardModule,ReactiveFormsModule,],
templateUrl: './create-test.component.html',
styleUrls: ['./create-test.component.scss']
})
export class CreateTestComponent implements OnInit {
testForm!: FormGroup;

constructor(
private fb: FormBuilder,
private deviceService: AdminService,
private notification: NzNotificationService,
private router: Router // ← Inject Router
) {}

ngOnInit(): void {
this.testForm = this.fb.group({
title: [null, Validators.required],
description: [null, Validators.required],
timePerQuestion: [null, Validators.min(1/60)],
});
}

onSubmit(): void {
if (this.testForm.valid) {
this.deviceService.createTest(this.testForm.value).subscribe({
next: (res) => {
this.notification.success('SUCCESS', 'Test Created Successfully.', { nzDuration: 5000 });
this.router.navigateByUrl('/admin/dashboard');
},
error: (error) => {
console.log('Valeur envoyée :', this.testForm.value);
console.error('Error response:', error); // Debugging: log the full error
const message = error?.error?.message || error?.error || 'An unexpected error occurred.';
this.notification.error('ERROR', message, { nzDuration: 5000 });
}
});
}
}
}