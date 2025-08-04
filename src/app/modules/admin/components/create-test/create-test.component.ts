import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedModule } from '../../../shared/shared-module';
import { AdminService } from '../../services/admin.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';

interface QuestionInterface {
  id?: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  testId?: number;
}

@Component({
  selector: 'app-create-test',
  standalone: true,
  imports: [
    SharedModule,
    CommonModule, 
    NzCardModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './create-test.component.html',
  styleUrls: ['./create-test.component.scss']
})
export class CreateTestComponent implements OnInit {
  testForm!: FormGroup;
  questions: QuestionInterface[] = [];
  isCreatingTest = false;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private notification: NzNotificationService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.testForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      timePerQuestion: [60, [Validators.required, Validators.min(10), Validators.max(300)]],
    });
  }

  addNewQuestion(): void {
    const newQuestion: QuestionInterface = {
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: ''
    };
    this.questions.push(newQuestion);
  }

  removeQuestion(index: number): void {
    this.questions.splice(index, 1);
  }

  onSubmit(): void {
    if (this.testForm.valid) {
      this.isCreatingTest = true;
      
      this.adminService.createTest(this.testForm.value).subscribe({
        next: (testResponse) => {
          this.notification.success('SUCCESS', 'Test Created Successfully.', { nzDuration: 3000 });
          
          // If there are questions, add them
          if (this.questions.length > 0) {
            this.addQuestionsToTest(testResponse.id);
          } else {
            this.isCreatingTest = false;
            this.router.navigate(['/admin/dashboard']);
          }
        },
        error: (error) => {
          console.log('Valeur envoyée :', this.testForm.value);
          console.error('Error response:', error);
          const message = error?.error?.message || error?.error || 'An unexpected error occurred.';
          this.notification.error('ERROR', message, { nzDuration: 5000 });
          this.isCreatingTest = false;
        }
      });
    } else {
      this.notification.warning('WARNING', 'Please fill all required fields correctly.', { nzDuration: 3000 });
    }
  }

  private addQuestionsToTest(testId: number): void {
    let questionsAdded = 0;
    const totalQuestions = this.questions.length;

    this.questions.forEach((question, index) => {
      if (this.isValidQuestion(question)) {
        const questionData = {
          ...question,
          testId: testId
        };

        this.adminService.addQuestionInTest(questionData).subscribe({
          next: () => {
            questionsAdded++;
            if (questionsAdded === totalQuestions) {
              this.notification.success('SUCCESS', `All ${totalQuestions} questions added successfully!`, { nzDuration: 3000 });
              this.isCreatingTest = false;
              this.router.navigate(['/admin/dashboard']);
            }
          },
          error: (error) => {
            console.error(`Error adding question ${index + 1}:`, error);
            this.notification.error('ERROR', `Failed to add question ${index + 1}.`, { nzDuration: 3000 });
            questionsAdded++;
            if (questionsAdded === totalQuestions) {
              this.isCreatingTest = false;
              this.router.navigate(['/admin/dashboard']);
            }
          }
        });
      } else {
        questionsAdded++;
        this.notification.warning('WARNING', `Question ${index + 1} is incomplete and was skipped.`, { nzDuration: 3000 });
        if (questionsAdded === totalQuestions) {
          this.isCreatingTest = false;
          this.router.navigate(['/admin/dashboard']);
        }
      }
    });
  }

  private isValidQuestion(question: QuestionInterface): boolean {
    return question.questionText.trim() !== '' &&
           question.optionA.trim() !== '' &&
           question.optionB.trim() !== '' &&
           question.optionC.trim() !== '' &&
           question.optionD.trim() !== '' &&
           question.correctAnswer.trim() !== '';
  }
}
