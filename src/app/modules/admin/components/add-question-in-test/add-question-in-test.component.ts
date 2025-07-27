import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ActivatedRoute, Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-add-question-in-test',
  standalone: true,
  imports : [SharedModule,ReactiveFormsModule,NzFormModule,NzInputModule,NzButtonModule,NzSelectModule,CommonModule],
  templateUrl: './add-question-in-test.component.html',
  styleUrl: './add-question-in-test.component.scss'
})
export class AddQuestionInTestComponent {
  constructor(private fb:FormBuilder,
    private adminService:AdminService,
    private notification:NzNotificationService,
    private router:Router,
  private ActivatedRoute:ActivatedRoute) { }
  id:number|null;
  questionForm!:FormGroup;
  ngOnInit(): void {
    this.questionForm=this.fb.group({
      questionText:[null,[Validators.required, Validators.minLength(10)]],
      optionA:[null,[Validators.required, Validators.minLength(1)]],
      optionB:[null,[Validators.required, Validators.minLength(1)]],
      optionC:[null,[Validators.required, Validators.minLength(1)]],
      optionD:[null,[Validators.required, Validators.minLength(1)]],
      correctAnswer:[null,[Validators.required]],
    });
    this.id=this.ActivatedRoute.snapshot.params["id"];
   
  }
  onSubmit(): void {
    if (this.questionForm.valid) {
      const formData = this.questionForm.value;
      
      // Additional validation to ensure correctAnswer is one of A, B, C, D
      if (!['A', 'B', 'C', 'D'].includes(formData.correctAnswer)) {
        this.notification.error('ERROR', 'Correct answer must be A, B, C, or D', { nzDuration: 5000 });
        return;
      }
      
      // Prepare the payload with the correct answer letter (not text)
      const questionPayload = {
        ...formData,
        correctAnswer: formData.correctAnswer, // Send the letter (A, B, C, D)
        testId: this.id
      };
      
      console.log('Original form data:', formData);
      console.log('Question payload with correct answer letter:', questionPayload);
      
      this.adminService.addQuestionInTest(questionPayload).subscribe({
        next: (res) => {
          console.log('Successfully sent payload:', questionPayload); 
          this.notification.success('SUCCESS', 'Question Added Successfully.', { nzDuration: 5000 });
          this.router.navigateByUrl('/admin/dashboard');
        },
        error: (error) => {
          console.error('Error response:', error); // Debugging: log the full error
          const message = error?.error?.message || error?.error || 'An unexpected error occurred.';
          this.notification.error('ERROR', message, { nzDuration: 5000 });
        }
      });
    } else {
      console.warn('Form is invalid');
      // Mark all fields as touched to show validation errors
      Object.keys(this.questionForm.controls).forEach(key => {
        this.questionForm.get(key)?.markAsTouched();
      });
      this.notification.warning('VALIDATION ERROR', 'Please fill in all required fields correctly.', { nzDuration: 5000 });
    }
  }
  isInvalid(controlName: string): boolean {
  const control = this.questionForm.get(controlName);
  return control?.invalid && (control.dirty || control.touched);
}

  goBack(): void {
    this.router.navigateByUrl('/admin/dashboard');
  }

  }
