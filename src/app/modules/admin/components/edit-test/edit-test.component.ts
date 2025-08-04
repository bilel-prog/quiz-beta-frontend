import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AdminService } from '../../services/admin.service';
import { Question } from '../../../shared/interfaces/question.interface';
import { QuestionType } from '../../../shared/enums/question-types.enum';

// Local interface for editing questions
interface QuestionEditInterface {
  id?: number;
  questionText: string;
  questionType: QuestionType;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  testId?: number;
  options?: string[];
  correctAnswers?: string[];
  points?: number;
  timeLimit?: number;
}

interface TestInterface {
  id: number;
  title: string;
  description: string;
  timePerQuestion: number;
  questionCount: number;
}

@Component({
  selector: 'app-admin-edit-test',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    NzCardModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule
  ],
  templateUrl: './edit-test.component.html',
  styleUrls: ['./edit-test.component.scss']
})
export class AdminEditTestComponent implements OnInit {
  testForm!: FormGroup;
  testId!: number;
  testData: TestInterface | null = null;
  questions: QuestionEditInterface[] = [];
  isLoadingTest = false;
  isLoadingQuestions = false;

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private route: ActivatedRoute,
    private adminService: AdminService,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.route.params.subscribe(params => {
      this.testId = +params['id'];
      if (this.testId) {
        this.loadTestData();
        this.loadQuestions();
      }
    });
  }

  initializeForm(): void {
    this.testForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      timePerQuestion: [60, [Validators.required, Validators.min(10), Validators.max(300)]]
    });
  }

  loadTestData(): void {
    this.isLoadingTest = true;
    this.adminService.getTestQuestions(this.testId).subscribe({
      next: (response) => {
        this.testData = response;
        this.testForm.patchValue({
          title: response.title,
          description: response.description,
          timePerQuestion: response.timePerQuestion
        });
        this.isLoadingTest = false;
      },
      error: (error) => {
        console.error('Error loading test:', error);
        this.notification.error('ERROR', 'Failed to load test data.', { nzDuration: 3000 });
        this.isLoadingTest = false;
      }
    });
  }

  loadQuestions(): void {
    this.isLoadingQuestions = true;
    this.adminService.getTestQuestionsPaged(this.testId, 0, 100).subscribe({
      next: (response) => {
        this.questions = response.content || [];
        this.isLoadingQuestions = false;
      },
      error: (error) => {
        console.error('Error loading questions:', error);
        this.notification.error('ERROR', 'Failed to load questions.', { nzDuration: 3000 });
        this.isLoadingQuestions = false;
      }
    });
  }

  updateTest(): void {
    if (this.testForm.valid) {
      const formData = {
        id: this.testId,
        ...this.testForm.value
      };

      this.adminService.updateTest(formData).subscribe({
        next: (response) => {
          this.notification.success('SUCCESS', 'Test updated successfully!', { nzDuration: 3000 });
          this.loadTestData(); // Refresh data
        },
        error: (error) => {
          console.error('Error updating test:', error);
          this.notification.error('ERROR', 'Failed to update test.', { nzDuration: 3000 });
        }
      });
    } else {
      this.notification.warning('WARNING', 'Please fill all required fields correctly.', { nzDuration: 3000 });
    }
  }

  addNewQuestion(): void {
    const newQuestion: QuestionEditInterface = {
      questionText: '',
      questionType: QuestionType.MULTIPLE_CHOICE_SINGLE,
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: ''
    };
    this.questions.push(newQuestion);
  }

  removeQuestion(index: number): void {
    const question = this.questions[index];
    if (question.id) {
      // Delete from backend if it exists
      this.adminService.deleteQuestion(question.id).subscribe({
        next: () => {
          this.questions.splice(index, 1);
          this.notification.success('SUCCESS', 'Question deleted successfully!', { nzDuration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting question:', error);
          this.notification.error('ERROR', 'Failed to delete question.', { nzDuration: 3000 });
        }
      });
    } else {
      // Just remove from array if it's a new question
      this.questions.splice(index, 1);
    }
  }

  saveQuestion(question: QuestionEditInterface, index: number): void {
    // Validate question
    if (!question.questionText.trim()) {
      this.notification.warning('WARNING', 'Question text is required.', { nzDuration: 3000 });
      return;
    }

    if (!question.optionA.trim() || !question.optionB.trim() || !question.optionC.trim() || !question.optionD.trim()) {
      this.notification.warning('WARNING', 'All options must be filled.', { nzDuration: 3000 });
      return;
    }

    if (!question.correctAnswer.trim()) {
      this.notification.warning('WARNING', 'Correct answer is required.', { nzDuration: 3000 });
      return;
    }

    const questionData = {
      ...question,
      testId: this.testId
    };

    if (question.id) {
      // Update existing question
      this.adminService.updateQuestion(question.id, questionData).subscribe({
        next: (response) => {
          this.questions[index] = { ...response };
          this.notification.success('SUCCESS', 'Question updated successfully!', { nzDuration: 3000 });
        },
        error: (error) => {
          console.error('Error updating question:', error);
          this.notification.error('ERROR', 'Failed to update question.', { nzDuration: 3000 });
        }
      });
    } else {
      // Add new question
      this.adminService.addQuestionInTest(questionData).subscribe({
        next: (response) => {
          this.questions[index] = { ...response };
          this.notification.success('SUCCESS', 'Question added successfully!', { nzDuration: 3000 });
        },
        error: (error) => {
          console.error('Error adding question:', error);
          this.notification.error('ERROR', 'Failed to add question.', { nzDuration: 3000 });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
