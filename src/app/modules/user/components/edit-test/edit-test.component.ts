import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Test } from '../../services/test';
import { Question } from '../../../shared/interfaces/question.interface';
import { QuestionType } from '../../../shared/enums/question-types.enum';

interface TestInterface {
  id: number;
  title: string;
  description: string;
  timePerQuestion: number;
  questionCount?: number;
}

@Component({
  selector: 'app-edit-test',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NzCardModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    RouterModule
  ],
  templateUrl: './edit-test.component.html',
  styleUrls: ['./edit-test.component.scss']
})
export class EditTestComponent implements OnInit {
  testId!: number;
  test: TestInterface | null = null;
  isLoading = false;
  isSaving = false;
  
  // Make String available to template
  String = String;
  
  // Forms
  testForm: FormGroup;
  questions: Question[] = [];
  isLoadingQuestions = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private testService: Test,
    private notification: NzNotificationService
  ) {
    this.testForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      timePerQuestion: [60, [Validators.required, Validators.min(10), Validators.max(300)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.testId = +params['id'];
      this.loadTest();
    });
  }

  loadTest(): void {
    this.isLoading = true;
    this.testService.getMyTestDetails(this.testId).subscribe({
      next: (response) => {
        console.log('Test details response:', response);
        this.test = response;
        
        // Handle questions - they might be directly in response.questions or nested
        this.questions = response.questions || [];
        
        // Populate form
        this.testForm.patchValue({
          title: response.title,
          description: response.description,
          timePerQuestion: response.timePerQuestion
        });
        
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading test:', error);
        this.notification.error('ERROR', 'Failed to load test details.', { nzDuration: 5000 });
        this.router.navigate(['/user/my-tests']);
      }
    });
  }

  updateTest(): void {
    if (this.testForm.valid) {
      this.isSaving = true;
      const testData = this.testForm.value;
      
      this.testService.updateMyTest(this.testId, testData).subscribe({
        next: (response) => {
          this.isSaving = false;
          console.log('Update response:', response);
          
          // Handle both old string responses and new JSON responses
          const message = typeof response === 'string' ? response : response.message;
          this.notification.success('SUCCESS', message || 'Test updated successfully!', { nzDuration: 3000 });
          
          if (this.test) {
            this.test.title = testData.title;
            this.test.description = testData.description;
            this.test.timePerQuestion = testData.timePerQuestion;
          }
        },
        error: (error) => {
          this.isSaving = false;
          console.error('Error updating test:', error);
          
          // Handle both old string errors and new JSON errors
          const errorMessage = error.error?.message || error.message || 'Failed to update test. Please try again.';
          this.notification.error('ERROR', errorMessage, { nzDuration: 5000 });
        }
      });
    }
  }

  addNewQuestion(): void {
    this.router.navigate(['/user/add-question', this.testId]);
  }

  editQuestion(question: Question): void {
    this.router.navigate(['/user/add-question', this.testId], {
      queryParams: { questionId: question.id }
    });
  }

  removeQuestion(question: Question, index: number): void {
    if (question.id) {
      // Delete from backend if it has an ID
      this.testService.deleteQuestionFromMyTest(this.testId, question.id).subscribe({
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

  goBack(): void {
    this.router.navigate(['/user/my-tests']);
  }

  // Helper methods for template (copied from admin)
  getQuestionTypeLabel(questionType: QuestionType): string {
    const labels: Record<QuestionType, string> = {
      [QuestionType.MULTIPLE_CHOICE_SINGLE]: 'Multiple Choice (Single)',
      [QuestionType.MULTIPLE_CHOICE_MULTIPLE]: 'Multiple Choice (Multiple)',
      [QuestionType.MULTIPLE_CHOICE_BEST]: 'Multiple Choice (Best Answer)',
      [QuestionType.TRUE_FALSE]: 'True/False',
      [QuestionType.YES_NO]: 'Yes/No',
      [QuestionType.FILL_IN_THE_BLANK]: 'Fill in the Blank',
      [QuestionType.FILL_IN_THE_BLANK_PHRASE]: 'Fill in the Blank (Phrase)',
      [QuestionType.MATCHING]: 'Matching',
      [QuestionType.MATCHING_ONE_TO_MANY]: 'Matching (One to Many)',
      [QuestionType.SEQUENCING]: 'Sequencing',
      [QuestionType.ORDERING_CHRONOLOGICAL]: 'Chronological Ordering',
      [QuestionType.SHORT_ANSWER]: 'Short Answer',
      [QuestionType.ESSAY]: 'Essay'
    };
    return labels[questionType] || 'Unknown';
  }

  isMultipleChoice(questionType: QuestionType): boolean {
    return [
      QuestionType.MULTIPLE_CHOICE_SINGLE,
      QuestionType.MULTIPLE_CHOICE_MULTIPLE,
      QuestionType.MULTIPLE_CHOICE_BEST
    ].includes(questionType);
  }

  hasMultipleChoiceData(question: Question): boolean {
    const anyQuestion = question as any;
    return !!(anyQuestion.optionA || anyQuestion.optionB || anyQuestion.optionC || anyQuestion.optionD);
  }

  getQuestionOptions(question: Question): string[] {
    if (this.isMultipleChoice(question.questionType)) {
      const mcQuestion = question as any;
      return mcQuestion.options || [mcQuestion.optionA, mcQuestion.optionB, mcQuestion.optionC, mcQuestion.optionD].filter(Boolean);
    }
    return [];
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D
  }

  getCorrectAnswers(question: Question): string[] {
    const anyQuestion = question as any;
    if (anyQuestion.correctAnswers && Array.isArray(anyQuestion.correctAnswers)) {
      return anyQuestion.correctAnswers;
    }
    if (anyQuestion.correctAnswer) {
      return [anyQuestion.correctAnswer.toString()];
    }
    return [];
  }
}
