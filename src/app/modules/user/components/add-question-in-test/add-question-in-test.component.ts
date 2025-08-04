import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray, FormsModule } from '@angular/forms';
import { Test } from '../../services/test';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { CommonModule } from '@angular/common';
import { QuestionType, QUESTION_TYPES, QuestionTypeInfo } from '../../../shared/enums/question-types.enum';
import { Question, LegacyQuestion } from '../../../shared/interfaces/question.interface'; 

@Component({
  selector: 'app-add-question-in-test',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    FormsModule,
    RouterModule,
    NzFormModule, 
    NzInputModule, 
    NzButtonModule, 
    NzSelectModule, 
    NzCardModule, 
    NzIconModule, 
    NzCheckboxModule, 
    NzRadioModule, 
    NzInputNumberModule, 
    NzSwitchModule,
    NzGridModule,
    NzLayoutModule
  ],
  templateUrl: './add-question-in-test.component.html',
  styleUrl: './add-question-in-test.component.scss'
})
export class AddQuestionInTestComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private testService: Test,
    private notification: NzNotificationService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  testId: number | null = null;
  questionId: number | null = null;
  questionForm!: FormGroup;
  questionTypes = QUESTION_TYPES;
  selectedQuestionType: QuestionType | null = null;
  selectedQuestionTypeInfo: QuestionTypeInfo | null = null;
  isSubmitting = false;
  isEditing = false;
  pageTitle = 'Add Question';
  QuestionType = QuestionType; // Make enum available in template

  ngOnInit(): void {
    this.initializeForm();
    
    // Get testId from route params and questionId from query params
    this.activatedRoute.params.subscribe(params => {
      this.testId = +params['testId'];
    });
    
    this.activatedRoute.queryParams.subscribe(params => {
      this.questionId = params['questionId'] ? +params['questionId'] : null;
      this.isEditing = !!this.questionId;
      this.pageTitle = this.isEditing ? 'Edit Question' : 'Add Question';
      
      if (this.isEditing && this.questionId) {
        this.loadQuestionData();
      }
    });
  }

  initializeForm(): void {
    this.questionForm = this.fb.group({
      questionType: [QuestionType.MULTIPLE_CHOICE_SINGLE, [Validators.required]],
      questionText: ['', [Validators.required, Validators.minLength(10)]],
      
      // Legacy fields for backward compatibility
      optionA: [null],
      optionB: [null],
      optionC: [null],
      optionD: [null],
      correctAnswer: [null],
      
      // New dynamic fields
      options: this.fb.array([]),
      correctAnswers: this.fb.array([]),
      caseSensitive: [false],
      exactMatch: [false],
      leftColumn: this.fb.array([]),
      rightColumn: this.fb.array([]),
      correctMatches: this.fb.array([]),
      items: this.fb.array([]),
      correctOrder: this.fb.array([]),
      maxLength: [null],
      minLength: [null],
      keywords: this.fb.array([]),
      sampleAnswer: [null],
      rubric: this.fb.array([]),
      gradingCriteria: [null]
    });

    // Watch for question type changes
    this.questionForm.get('questionType')?.valueChanges.subscribe(type => {
      this.onQuestionTypeChange(type);
    });
  }

  loadQuestionData(): void {
    if (!this.testId || !this.questionId) return;
    
    // Use the existing getQuestion method from the test service
    this.testService.getMyTestDetails(this.testId).subscribe({
      next: (testData) => {
        const question = testData.questions?.find((q: any) => q.id === this.questionId);
        if (question) {
          this.populateFormWithQuestion(question);
        }
      },
      error: (error) => {
        console.error('Error loading question:', error);
        this.notification.error('Error', 'Failed to load question data');
      }
    });
  }

  populateFormWithQuestion(question: any): void {
    // Set basic fields
    this.questionForm.patchValue({
      questionType: question.questionType,
      questionText: question.questionText
    });
    
    // Trigger question type change to setup form properly
    this.onQuestionTypeChange(question.questionType);
    
    // Set type-specific fields based on question type
    setTimeout(() => {
      if (this.isMultipleChoiceType(question.questionType)) {
        if (question.options && Array.isArray(question.options)) {
          // New format with options array
          this.setFormArrayValues('options', question.options);
          this.setFormArrayValues('correctAnswers', question.correctAnswers || []);
        } else {
          // Legacy format
          this.questionForm.patchValue({
            optionA: question.optionA,
            optionB: question.optionB,
            optionC: question.optionC,
            optionD: question.optionD,
            correctAnswer: question.correctAnswer
          });
        }
      } else if (question.questionType === QuestionType.TRUE_FALSE || question.questionType === QuestionType.YES_NO) {
        this.setFormArrayValues('correctAnswers', [question.correctAnswer]);
      } else if (this.isFillInBlankType(question.questionType)) {
        this.setFormArrayValues('correctAnswers', question.correctAnswers || []);
        this.questionForm.patchValue({
          caseSensitive: question.caseSensitive || false,
          exactMatch: question.exactMatch || false
        });
      }
    }, 100);
  }

  setFormArrayValues(arrayName: string, values: any[]): void {
    const formArray = this.questionForm.get(arrayName) as FormArray;
    formArray.clear();
    values.forEach(value => {
      formArray.push(this.fb.control(value, [Validators.required]));
    });
  }

  onQuestionTypeChange(type: QuestionType): void {
    this.selectedQuestionType = type;
    this.selectedQuestionTypeInfo = this.questionTypes.find(qt => qt.type === type) || null;
    
    // Clear and reset form arrays based on question type
    this.resetFormArrays();
    this.setupFormForQuestionType(type);
  }

  resetFormArrays(): void {
    const arrays = ['options', 'correctAnswers', 'leftColumn', 'rightColumn', 'items', 'keywords', 'rubric'];
    arrays.forEach(arrayName => {
      const formArray = this.questionForm.get(arrayName) as FormArray;
      formArray.clear();
    });
  }

  setupFormForQuestionType(type: QuestionType): void {
    // Reset validators
    this.clearValidators();
    
    switch (type) {
      case QuestionType.MULTIPLE_CHOICE_SINGLE:
      case QuestionType.MULTIPLE_CHOICE_MULTIPLE:
      case QuestionType.MULTIPLE_CHOICE_BEST:
        if (!this.isLegacyMultipleChoice()) {
          this.setupMultipleChoiceForm();
        } else {
          this.setupLegacyMultipleChoiceForm();
        }
        break;
        
      case QuestionType.TRUE_FALSE:
      case QuestionType.YES_NO:
        this.setupBinaryChoiceForm();
        break;
        
      case QuestionType.FILL_IN_THE_BLANK:
      case QuestionType.FILL_IN_THE_BLANK_PHRASE:
        this.setupFillInBlankForm();
        break;
    }
  }

  setupMultipleChoiceForm(): void {
    // Add initial options
    this.addOption();
    this.addOption();
    
    // Add validators
    this.questionForm.get('correctAnswers')?.setValidators([Validators.required]);
  }

  setupLegacyMultipleChoiceForm(): void {
    const fields = ['optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer'];
    fields.forEach(field => {
      this.questionForm.get(field)?.setValidators([Validators.required]);
    });
  }

  setupBinaryChoiceForm(): void {
    this.correctAnswersArray.push(this.fb.control(null, [Validators.required]));
  }

  setupFillInBlankForm(): void {
    this.addCorrectAnswer();
  }

  clearValidators(): void {
    const fields = ['optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer', 'correctAnswers'];
    fields.forEach(field => {
      const control = this.questionForm.get(field);
      if (control) {
        control.clearValidators();
        control.updateValueAndValidity();
      }
    });
  }

  // Form array getters
  get optionsArray() { return this.questionForm.get('options') as FormArray; }
  get correctAnswersArray() { return this.questionForm.get('correctAnswers') as FormArray; }
  get leftColumnArray() { return this.questionForm.get('leftColumn') as FormArray; }
  get rightColumnArray() { return this.questionForm.get('rightColumn') as FormArray; }
  get itemsArray() { return this.questionForm.get('items') as FormArray; }
  get keywordsArray() { return this.questionForm.get('keywords') as FormArray; }

  // Helper methods for form arrays
  addOption(): void {
    this.optionsArray.push(this.fb.control('', [Validators.required]));
  }

  removeOption(index: number): void {
    if (this.optionsArray.length > 2) {
      this.optionsArray.removeAt(index);
    }
  }

  addCorrectAnswer(): void {
    this.correctAnswersArray.push(this.fb.control('', [Validators.required]));
  }

  removeCorrectAnswer(index: number): void {
    this.correctAnswersArray.removeAt(index);
  }

  // Question type checking methods
  isMultipleChoiceType(type: QuestionType): boolean {
    return [
      QuestionType.MULTIPLE_CHOICE_SINGLE,
      QuestionType.MULTIPLE_CHOICE_MULTIPLE,
      QuestionType.MULTIPLE_CHOICE_BEST
    ].includes(type);
  }

  isFillInBlankType(type: QuestionType): boolean {
    return [
      QuestionType.FILL_IN_THE_BLANK,
      QuestionType.FILL_IN_THE_BLANK_PHRASE
    ].includes(type);
  }

  isLegacyMultipleChoice(): boolean {
    // For now, default to new format
    return false;
  }

  shouldShowLegacyOptions(): boolean {
    return this.isMultipleChoiceType(this.selectedQuestionType!) && this.isLegacyMultipleChoice();
  }

  shouldShowNewOptions(): boolean {
    return this.isMultipleChoiceType(this.selectedQuestionType!) && !this.isLegacyMultipleChoice();
  }

  shouldShowBinaryChoice(): boolean {
    return [QuestionType.TRUE_FALSE, QuestionType.YES_NO].includes(this.selectedQuestionType!);
  }

  shouldShowFillInTheBlank(): boolean {
    return this.isFillInBlankType(this.selectedQuestionType!);
  }

  getBinaryChoiceOptions(): { value: any; label: string }[] {
    if (this.selectedQuestionType === QuestionType.TRUE_FALSE) {
      return [
        { value: true, label: 'True' },
        { value: false, label: 'False' }
      ];
    } else if (this.selectedQuestionType === QuestionType.YES_NO) {
      return [
        { value: true, label: 'Yes' },
        { value: false, label: 'No' }
      ];
    }
    return [];
  }

  submitQuestion(): void {
    if (this.questionForm.invalid) {
      this.markFormGroupTouched();
      this.notification.warning('Warning', 'Please fill in all required fields.');
      return;
    }

    this.isSubmitting = true;
    const questionData = this.buildQuestionData();

    if (this.isEditing && this.questionId) {
      // Update existing question
      this.testService.updateQuestionInMyTest(this.testId!, this.questionId, questionData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.notification.success('Success', 'Question updated successfully!');
          this.navigateBack();
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error updating question:', error);
          this.notification.error('Error', 'Failed to update question. Please try again.');
        }
      });
    } else {
      // Create new question
      this.testService.addQuestionToMyTest(this.testId!, questionData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.notification.success('Success', 'Question added successfully!');
          this.navigateBack();
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error adding question:', error);
          this.notification.error('Error', 'Failed to add question. Please try again.');
        }
      });
    }
  }

  buildQuestionData(): any {
    const formData = this.questionForm.value;
    
    const baseQuestion = {
      questionText: formData.questionText,
      questionType: formData.questionType,
      testId: this.testId
    };

    // Add type-specific data
    switch (formData.questionType) {
      case QuestionType.MULTIPLE_CHOICE_SINGLE:
      case QuestionType.MULTIPLE_CHOICE_MULTIPLE:
      case QuestionType.MULTIPLE_CHOICE_BEST:
        if (this.isLegacyMultipleChoice()) {
          return {
            ...baseQuestion,
            optionA: formData.optionA,
            optionB: formData.optionB,
            optionC: formData.optionC,
            optionD: formData.optionD,
            correctAnswer: formData.correctAnswer
          };
        } else {
          return {
            ...baseQuestion,
            options: formData.options,
            correctAnswers: formData.correctAnswers
          };
        }

      case QuestionType.TRUE_FALSE:
      case QuestionType.YES_NO:
        return {
          ...baseQuestion,
          correctAnswer: formData.correctAnswers[0]
        };

      case QuestionType.FILL_IN_THE_BLANK:
      case QuestionType.FILL_IN_THE_BLANK_PHRASE:
        return {
          ...baseQuestion,
          correctAnswers: formData.correctAnswers,
          caseSensitive: formData.caseSensitive || false,
          exactMatch: formData.exactMatch || false
        };

      default:
        return baseQuestion;
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.questionForm.controls).forEach(key => {
      const control = this.questionForm.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormArray) {
        control.controls.forEach(c => c.markAsTouched());
      }
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.questionForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  isArrayInvalid(arrayName: string, index: number, fieldName?: string): boolean {
    const formArray = this.questionForm.get(arrayName) as FormArray;
    if (fieldName) {
      const control = formArray.at(index)?.get(fieldName);
      return !!(control && control.invalid && control.touched);
    } else {
      const control = formArray.at(index);
      return !!(control && control.invalid && control.touched);
    }
  }

  navigateBack(): void {
    this.router.navigate(['/user/edit-test', this.testId]);
  }

  goBack(): void {
    this.navigateBack();
  }
}
