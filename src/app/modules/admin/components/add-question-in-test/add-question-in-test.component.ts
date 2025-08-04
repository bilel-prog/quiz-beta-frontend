import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ActivatedRoute, Router } from '@angular/router';
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
import { CommonModule } from '@angular/common';
import { QuestionType, QUESTION_TYPES, QuestionTypeInfo } from '../../../shared/enums/question-types.enum';
import { Question, LegacyQuestion } from '../../../shared/interfaces/question.interface'; 

@Component({
  selector: 'app-add-question-in-test',
  standalone: true,
  imports: [
    SharedModule, ReactiveFormsModule, NzFormModule, NzInputModule, 
    NzButtonModule, NzSelectModule, CommonModule, NzCardModule, 
    NzIconModule, NzCheckboxModule, NzRadioModule, NzInputNumberModule, NzSwitchModule
  ],
  templateUrl: './add-question-in-test.component.html',
  styleUrl: './add-question-in-test.component.scss'
})
export class AddQuestionInTestComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private notification: NzNotificationService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  id: number | null = null;
  questionForm!: FormGroup;
  questionTypes = QUESTION_TYPES;
  selectedQuestionType: QuestionType | null = null;
  selectedQuestionTypeInfo: QuestionTypeInfo | null = null;
  isSubmitting = false;
  QuestionType = QuestionType; // Make enum available in template
  ngOnInit(): void {
    this.initializeForm();
    this.id = this.activatedRoute.snapshot.params["id"];
  }

  initializeForm(): void {
    this.questionForm = this.fb.group({
      questionType: [null, [Validators.required]],
      questionText: [null, [Validators.required, Validators.minLength(10)]],
      points: [1, [Validators.required, Validators.min(1)]],
      timeLimit: [null],
      
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

  onQuestionTypeChange(questionType: QuestionType): void {
    this.selectedQuestionType = questionType;
    this.selectedQuestionTypeInfo = this.questionTypes.find(qt => qt.type === questionType) || null;
    this.resetFormFields();
    this.setValidatorsForQuestionType(questionType);
  }

  resetFormFields(): void {
    // Clear all dynamic form arrays
    (this.questionForm.get('options') as FormArray).clear();
    (this.questionForm.get('correctAnswers') as FormArray).clear();
    (this.questionForm.get('leftColumn') as FormArray).clear();
    (this.questionForm.get('rightColumn') as FormArray).clear();
    (this.questionForm.get('correctMatches') as FormArray).clear();
    (this.questionForm.get('items') as FormArray).clear();
    (this.questionForm.get('correctOrder') as FormArray).clear();
    (this.questionForm.get('keywords') as FormArray).clear();
    (this.questionForm.get('rubric') as FormArray).clear();
    
    // Reset other fields
    this.questionForm.patchValue({
      optionA: null,
      optionB: null,
      optionC: null,
      optionD: null,
      correctAnswer: null,
      caseSensitive: false,
      exactMatch: false,
      maxLength: null,
      minLength: null,
      sampleAnswer: null,
      gradingCriteria: null
    });
  }

  setValidatorsForQuestionType(questionType: QuestionType): void {
    // Remove all validators first
    Object.keys(this.questionForm.controls).forEach(key => {
      if (!['questionType', 'questionText', 'points'].includes(key)) {
        this.questionForm.get(key)?.clearValidators();
        this.questionForm.get(key)?.updateValueAndValidity();
      }
    });

    // Set validators based on question type
    switch (questionType) {
      case QuestionType.MULTIPLE_CHOICE_SINGLE:
      case QuestionType.MULTIPLE_CHOICE_MULTIPLE:
      case QuestionType.MULTIPLE_CHOICE_BEST:
        this.setupMultipleChoiceValidators();
        break;
      case QuestionType.TRUE_FALSE:
      case QuestionType.YES_NO:
        this.setupBinaryChoiceValidators();
        break;
      case QuestionType.FILL_IN_THE_BLANK:
      case QuestionType.FILL_IN_THE_BLANK_PHRASE:
        this.setupFillInTheBlankValidators();
        break;
      case QuestionType.MATCHING:
      case QuestionType.MATCHING_ONE_TO_MANY:
        this.setupMatchingValidators();
        break;
      case QuestionType.SEQUENCING:
      case QuestionType.ORDERING_CHRONOLOGICAL:
        this.setupSequencingValidators();
        break;
      case QuestionType.SHORT_ANSWER:
        this.setupShortAnswerValidators();
        break;
      case QuestionType.ESSAY:
        this.setupEssayValidators();
        break;
    }
  }

  setupMultipleChoiceValidators(): void {
    // Initialize with at least 2 options
    this.addOption();
    this.addOption();
  }

  setupBinaryChoiceValidators(): void {
    this.questionForm.get('correctAnswer')?.setValidators([Validators.required]);
    this.questionForm.get('correctAnswer')?.updateValueAndValidity();
  }

  setupFillInTheBlankValidators(): void {
    this.addCorrectAnswer();
  }

  setupMatchingValidators(): void {
    this.addLeftColumnItem();
    this.addRightColumnItem();
  }

  setupSequencingValidators(): void {
    this.addSequencingItem();
    this.addSequencingItem();
  }

  setupShortAnswerValidators(): void {
    this.questionForm.get('maxLength')?.setValidators([Validators.min(1)]);
    this.questionForm.get('maxLength')?.updateValueAndValidity();
  }

  setupEssayValidators(): void {
    this.questionForm.get('minLength')?.setValidators([Validators.min(1)]);
    this.questionForm.get('maxLength')?.setValidators([Validators.min(1)]);
    this.questionForm.get('minLength')?.updateValueAndValidity();
    this.questionForm.get('maxLength')?.updateValueAndValidity();
  }

  // Dynamic form array methods
  get optionsArray() { return this.questionForm.get('options') as FormArray; }
  get correctAnswersArray() { return this.questionForm.get('correctAnswers') as FormArray; }
  get leftColumnArray() { return this.questionForm.get('leftColumn') as FormArray; }
  get rightColumnArray() { return this.questionForm.get('rightColumn') as FormArray; }
  get itemsArray() { return this.questionForm.get('items') as FormArray; }
  get keywordsArray() { return this.questionForm.get('keywords') as FormArray; }
  get rubricArray() { return this.questionForm.get('rubric') as FormArray; }

  // Form array getters
  getOptionsFormArray(): FormArray {
    return this.questionForm.get('options') as FormArray;
  }

  getCorrectAnswersFormArray(): FormArray {
    return this.questionForm.get('correctAnswers') as FormArray;
  }

  getMatchingPairsFormArray(): FormArray {
    return this.questionForm.get('matchingPairs') as FormArray;
  }

  getSequenceItemsFormArray(): FormArray {
    return this.questionForm.get('sequenceItems') as FormArray;
  }

  // Add/Remove methods for matching pairs
  addMatchingPair(): void {
    const pair = this.fb.group({
      left: ['', Validators.required],
      right: ['', Validators.required]
    });
    this.getMatchingPairsFormArray().push(pair);
  }

  removeMatchingPair(index: number): void {
    if (this.getMatchingPairsFormArray().length > 2) {
      this.getMatchingPairsFormArray().removeAt(index);
    }
  }

  // Add/Remove methods for sequence items
  addSequenceItem(): void {
    this.getSequenceItemsFormArray().push(this.fb.control('', Validators.required));
  }

  removeSequenceItem(index: number): void {
    if (this.getSequenceItemsFormArray().length > 2) {
      this.getSequenceItemsFormArray().removeAt(index);
    }
  }

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

  addLeftColumnItem(): void {
    this.leftColumnArray.push(this.fb.group({
      id: [this.generateId()],
      text: ['', [Validators.required]]
    }));
  }

  addRightColumnItem(): void {
    this.rightColumnArray.push(this.fb.group({
      id: [this.generateId()],
      text: ['', [Validators.required]]
    }));
  }

  addSequencingItem(): void {
    this.itemsArray.push(this.fb.group({
      id: [this.generateId()],
      text: ['', [Validators.required]]
    }));
  }

  addKeyword(): void {
    this.keywordsArray.push(this.fb.control('', [Validators.required]));
  }

  addRubricItem(): void {
    this.rubricArray.push(this.fb.control('', [Validators.required]));
  }

  generateId(): string {
    return 'id_' + Math.random().toString(36).substr(2, 9);
  }

  getQuestionTypeInfo(type: QuestionType): QuestionTypeInfo | undefined {
    return QUESTION_TYPES.find(qt => qt.type === type);
  }
  onSubmit(): void {
    if (this.questionForm.valid) {
      const formData = this.questionForm.value;
      
      // Handle legacy multiple choice format for backward compatibility
      if (this.selectedQuestionType === QuestionType.MULTIPLE_CHOICE_SINGLE && 
          formData.optionA && formData.optionB && formData.optionC && formData.optionD) {
        
        // Legacy format validation
        if (!['A', 'B', 'C', 'D'].includes(formData.correctAnswer)) {
          this.notification.error('ERROR', 'Correct answer must be A, B, C, or D', { nzDuration: 5000 });
          return;
        }
        
        // Submit as legacy format
        const legacyPayload: LegacyQuestion = {
          questionText: formData.questionText,
          optionA: formData.optionA,
          optionB: formData.optionB,
          optionC: formData.optionC,
          optionD: formData.optionD,
          correctAnswer: formData.correctAnswer,
          testId: this.id!
        };
        
        this.submitQuestion(legacyPayload);
        return;
      }
      
      // New format - build question based on type
      const questionPayload = this.buildQuestionPayload(formData);
      this.submitQuestion(questionPayload);
      
    } else {
      this.markFormGroupTouched();
      this.notification.warning('VALIDATION ERROR', 'Please fill in all required fields correctly.', { nzDuration: 5000 });
    }
  }

  buildQuestionPayload(formData: any): Question | LegacyQuestion {
    const baseQuestion = {
      questionText: formData.questionText,
      questionType: formData.questionType,
      testId: this.id!,
      points: formData.points || 1,
      timeLimit: formData.timeLimit
    };

    switch (this.selectedQuestionType) {
      case QuestionType.MULTIPLE_CHOICE_SINGLE:
      case QuestionType.MULTIPLE_CHOICE_MULTIPLE:
      case QuestionType.MULTIPLE_CHOICE_BEST:
        return {
          ...baseQuestion,
          options: formData.options,
          correctAnswers: formData.correctAnswers
        };

      case QuestionType.TRUE_FALSE:
      case QuestionType.YES_NO:
        return {
          ...baseQuestion,
          correctAnswer: formData.correctAnswer === 'true' || formData.correctAnswer === true
        };

      case QuestionType.FILL_IN_THE_BLANK:
      case QuestionType.FILL_IN_THE_BLANK_PHRASE:
        return {
          ...baseQuestion,
          correctAnswers: formData.correctAnswers,
          caseSensitive: formData.caseSensitive || false,
          exactMatch: formData.exactMatch || false
        };

      case QuestionType.MATCHING:
      case QuestionType.MATCHING_ONE_TO_MANY:
        return {
          ...baseQuestion,
          leftColumn: formData.leftColumn,
          rightColumn: formData.rightColumn,
          correctMatches: this.buildCorrectMatches(formData)
        };

      case QuestionType.SEQUENCING:
      case QuestionType.ORDERING_CHRONOLOGICAL:
        return {
          ...baseQuestion,
          items: formData.items,
          correctOrder: formData.items.map((item: any) => item.id)
        };

      case QuestionType.SHORT_ANSWER:
        return {
          ...baseQuestion,
          maxLength: formData.maxLength,
          keywords: formData.keywords,
          sampleAnswer: formData.sampleAnswer
        };

      case QuestionType.ESSAY:
        return {
          ...baseQuestion,
          minLength: formData.minLength,
          maxLength: formData.maxLength,
          rubric: formData.rubric,
          gradingCriteria: formData.gradingCriteria
        };

      default:
        throw new Error(`Unsupported question type: ${this.selectedQuestionType}`);
    }
  }

  buildCorrectMatches(formData: any): { leftId: string; rightId: string }[] {
    // This would be built based on user's matching configuration
    // For now, return empty array - this would need UI implementation
    return [];
  }

  submitQuestion(questionPayload: Question | LegacyQuestion): void {
    console.log('Submitting question payload:', questionPayload);
    
    this.adminService.addQuestionInTest(questionPayload).subscribe({
      next: (res) => {
        console.log('Successfully added question:', questionPayload);
        this.notification.success('SUCCESS', 'Question Added Successfully.', { nzDuration: 5000 });
        this.router.navigateByUrl('/admin/dashboard');
      },
      error: (error) => {
        console.error('Error response:', error);
        const message = error?.error?.message || error?.error || 'An unexpected error occurred.';
        this.notification.error('ERROR', message, { nzDuration: 5000 });
      }
    });
  }

  markFormGroupTouched(): void {
    Object.keys(this.questionForm.controls).forEach(key => {
      const control = this.questionForm.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          arrayControl.markAsTouched();
          if (arrayControl instanceof FormGroup) {
            Object.keys(arrayControl.controls).forEach(nestedKey => {
              arrayControl.get(nestedKey)?.markAsTouched();
            });
          }
        });
      }
    });
  }
  isInvalid(controlName: string): boolean {
    const control = this.questionForm.get(controlName);
    return control?.invalid && (control.dirty || control.touched);
  }

  isArrayInvalid(arrayName: string, index: number, fieldName?: string): boolean {
    const array = this.questionForm.get(arrayName) as FormArray;
    if (!array || !array.at(index)) return false;
    
    if (fieldName) {
      const control = array.at(index).get(fieldName);
      return control?.invalid && (control.dirty || control.touched);
    } else {
      const control = array.at(index);
      return control?.invalid && (control.dirty || control.touched);
    }
  }

  goBack(): void {
    this.router.navigateByUrl('/admin/dashboard');
  }

  // Question type filtering methods
  getObjectiveQuestions(): QuestionTypeInfo[] {
    return this.questionTypes.filter(qt => qt.category === 'objective');
  }

  getSubjectiveQuestions(): QuestionTypeInfo[] {
    return this.questionTypes.filter(qt => qt.category === 'subjective');
  }

  isLegacyMultipleChoice(): boolean {
    return this.selectedQuestionType === QuestionType.MULTIPLE_CHOICE_SINGLE && 
           this.questionForm.get('optionA')?.value;
  }

  shouldShowLegacyOptions(): boolean {
    return this.selectedQuestionType === QuestionType.MULTIPLE_CHOICE_SINGLE;
  }

  shouldShowNewOptions(): boolean {
    return [
      QuestionType.MULTIPLE_CHOICE_SINGLE,
      QuestionType.MULTIPLE_CHOICE_MULTIPLE,
      QuestionType.MULTIPLE_CHOICE_BEST
    ].includes(this.selectedQuestionType!) && !this.isLegacyMultipleChoice();
  }

  shouldShowBinaryChoice(): boolean {
    return [QuestionType.TRUE_FALSE, QuestionType.YES_NO].includes(this.selectedQuestionType!);
  }

  shouldShowFillInTheBlank(): boolean {
    return [
      QuestionType.FILL_IN_THE_BLANK,
      QuestionType.FILL_IN_THE_BLANK_PHRASE
    ].includes(this.selectedQuestionType!);
  }

  shouldShowMatching(): boolean {
    return [
      QuestionType.MATCHING,
      QuestionType.MATCHING_ONE_TO_MANY
    ].includes(this.selectedQuestionType!);
  }

  shouldShowSequencing(): boolean {
    return [
      QuestionType.SEQUENCING,
      QuestionType.ORDERING_CHRONOLOGICAL
    ].includes(this.selectedQuestionType!);
  }

  shouldShowShortAnswer(): boolean {
    return this.selectedQuestionType === QuestionType.SHORT_ANSWER;
  }

  shouldShowEssay(): boolean {
    return this.selectedQuestionType === QuestionType.ESSAY;
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
}
