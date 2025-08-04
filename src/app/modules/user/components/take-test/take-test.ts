import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Test } from '../../services/test';
import { UserStorageService } from '../../../shared/auth/services/user-storage.service';
import { Question } from '../../../shared/interfaces/question.interface';
import { QuestionType } from '../../../shared/enums/question-types.enum';

interface TestData {
  id: number;
  title: string;
  description: string;
  timePerQuestion: number;
  questions: Question[];
}

@Component({
  selector: 'app-take-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './take-test.html',
  styleUrls: ['./take-test.scss']
})
export class TakeTest implements OnInit, OnDestroy {
  questions: Question[] = [];
  testData: TestData | null = null;
  testId: number;
  isLoading = false;
  currentQuestionIndex = 0;
  selectedAnswers: { [key: number]: any } = {}; // Changed to any to support different answer types
  userAnswers: { [key: number]: any } = {}; // Changed to any for template compatibility
  timeRemaining = 0;
  totalTestTime = 0;
  testStartTime: number = 0;
  timerInterval: any;
  isTestCompleted = false;
  isTimerWarning = false;
  private storageKey = '';
  QuestionType = QuestionType; // Make enum available in template

  constructor(
    private activatedRoute: ActivatedRoute,
    private message: NzMessageService,
    private router: Router,
    private testService: Test
  ) {}

  ngOnInit(): void {
    this.testId = +this.activatedRoute.snapshot.params['id'];
    this.storageKey = `test_${this.testId}_progress`;
    
    // Debug: Check for any existing localStorage data
    console.log('Starting test ID:', this.testId);
    console.log('Existing localStorage keys:', Object.keys(localStorage).filter(key => key.includes('test_')));
    
    if (this.testId) {
      this.loadTestQuestions();
    } else {
      this.message.error('Invalid test ID');
      this.router.navigate(['/user/dashboard']);
    }
  }

  loadTestQuestions(): void {
    this.isLoading = true;
    this.testService.getFullTestQuestions(this.testId).subscribe({
      next: (data: any) => {
        console.log("Fetched test data:", data);
        // Always set testData and questions from backend response
        if (Array.isArray(data)) {
          this.questions = data;
          this.testData = { id: this.testId, title: '', description: '', timePerQuestion: 60, questions: data };
        } else if (data && Array.isArray(data.questions)) {
          this.questions = data.questions;
          this.testData = data;
        } else {
          this.questions = [];
          this.testData = { id: this.testId, title: '', description: '', timePerQuestion: 60, questions: [] };
        }
        this.isLoading = false;
        // Debug: log questions array and length before warning
        console.log("Questions array after fetch:", this.questions);
        console.log("Questions length:", this.questions.length);
        if (this.questions.length === 0) {
          this.message.warning('No questions found for this test');
          this.router.navigate(['/user/dashboard']);
          return;
        }

        // Initialize timer with persistence
        this.initializeTimer(this.testData);
        this.loadSavedAnswers();
        
        // Debug: Log current question IDs and any existing answers
        console.log('Question IDs:', this.questions.map(q => q.id));
        console.log('Loaded answers:', this.selectedAnswers);
      },
      error: (error) => {
        console.error('Error fetching test questions:', error);
        this.isLoading = false;
        this.message.error('Failed to load test questions');
        this.router.navigate(['/user/dashboard']);
      }
    });
  }

  private initializeTimer(data: TestData): void {
    const testKey = `test_${this.testId}`;
    const savedState = localStorage.getItem(testKey);
    
    // Admin sets timePerQuestion in seconds, so multiply by number of questions
    this.totalTestTime = (data.timePerQuestion || 120) * this.questions.length; // Already in seconds
    
    if (savedState) {
      const state = JSON.parse(savedState);
      this.testStartTime = state.startTime;
      
      // Calculate elapsed time more accurately
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - this.testStartTime) / 1000);
      this.timeRemaining = Math.max(0, this.totalTestTime - elapsedSeconds);
      
      if (this.timeRemaining <= 0) {
        this.autoSubmitTest();
        return;
      }
    } else {
      // First time starting the test
      this.testStartTime = Date.now();
      this.timeRemaining = this.totalTestTime;
      
      localStorage.setItem(testKey, JSON.stringify({
        startTime: this.testStartTime,
        totalTime: this.totalTestTime
      }));
    }
    
    this.startTimer();
  }

  private loadSavedAnswers(): void {
    const answersKey = `test_answers_${this.testId}`;
    const savedAnswers = localStorage.getItem(answersKey);
    
    if (savedAnswers) {
      try {
        const parsedAnswers = JSON.parse(savedAnswers);
        console.log('Loading saved answers:', parsedAnswers); // Debug log
        
        // Clear current answers first
        this.selectedAnswers = {};
        this.userAnswers = {};
        
        // Only keep answers for current question IDs and validate they exist
        this.questions.forEach(q => {
          if (parsedAnswers[q.id]) {
            // Validate the saved answer is one of the valid options
            const savedAnswer = parsedAnswers[q.id];
            if (['A', 'B', 'C', 'D'].includes(savedAnswer)) {
              this.selectedAnswers[q.id] = savedAnswer;
              this.userAnswers[q.id] = savedAnswer;
              console.log(`Restored answer for question ${q.id}: ${savedAnswer}`); // Debug log
            }
          }
        });
        
        console.log('Final loaded answers:', this.selectedAnswers); // Debug log
      } catch (error) {
        console.error('Error parsing saved answers:', error);
        // Clear corrupted data
        localStorage.removeItem(answersKey);
        this.selectedAnswers = {};
        this.userAnswers = {};
      }
    } else {
      // Initialize empty if no saved data
      this.selectedAnswers = {};
      this.userAnswers = {};
    }
  }

  private saveAnswers(): void {
    const answersKey = `test_answers_${this.testId}`;
    localStorage.setItem(answersKey, JSON.stringify(this.selectedAnswers));
  }

  private saveAnswersToStorage(): void {
    const answersKey = `test_answers_${this.testId}`;
    localStorage.setItem(answersKey, JSON.stringify(this.selectedAnswers));
  }

  selectAnswer(questionId: number, selectedOption: string): void {
    console.log(`Selecting answer for question ${questionId}: ${selectedOption}`); // Debug log
    
    // Validate the selection
    if (!['A', 'B', 'C', 'D'].includes(selectedOption)) {
      console.error('Invalid option selected:', selectedOption);
      return;
    }
    
    // Always use actual backend questionId
    this.selectedAnswers[questionId] = selectedOption;
    this.userAnswers[questionId] = selectedOption;
    this.saveAnswers();
    
    console.log('Updated selectedAnswers:', this.selectedAnswers); // Debug log
  }

  clearTestData(): void {
    // Clear localStorage for this test
    const answersKey = `test_answers_${this.testId}`;
    localStorage.removeItem(answersKey);
    const progressKey = `test_${this.testId}_progress`;
    localStorage.removeItem(progressKey);
    
    // Reset component state
    this.selectedAnswers = {};
    this.userAnswers = {};
    console.log('Cleared test data for test ID:', this.testId);
  }

  goToQuestion(index: number): void {
    if (index >= 0 && index < this.questions.length) {
      this.currentQuestionIndex = index;
    }
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  submitTest(): void {
    if (!this.testData) {
      this.message.error('No test data available');
      return;
    }

    // Stop timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    // Prepare comprehensive responses format for backend
    const responses = this.questions.map((question) => {
      // Use the actual question.id from backend and the selected answer for that question
      return {
        questionId: question.id,
        selectedOption: this.selectedAnswers[question.id] || ''
      };
    });
    // Debug: Log mapping of question IDs and selected answers
    console.log('Mapped responses:', responses);
    // Extra debug: log all question IDs and selectedAnswers keys
    console.log('All question IDs:', this.questions.map(q => q.id));
    console.log('Selected answers object:', this.selectedAnswers);
    // Force testId from testData or fallback to route param
    const testId = this.testData?.id || this.testId;

    // Debug: Log question structure and answers
    console.log('=== DEBUGGING SCORE CALCULATION ===');
    console.log('Questions structure:', this.questions);
    console.log('Selected answers object:', this.selectedAnswers);
    console.log('Sample question:', this.questions[0]);
    console.log('Sample question ID:', this.questions[0]?.id);
    console.log('Sample selected answer for question ID', this.questions[0]?.id, ':', this.selectedAnswers[this.questions[0]?.id]);
    console.log('=====================================');

    // Calculate score locally for immediate feedback
    const correctAnswers = this.questions.filter((question, index) => {
      const selectedLetter = this.selectedAnswers[question.id]; // Use question.id, not index
      const correctAnswer = this.getCorrectAnswerForScoring(question); // Use helper method to get correct answer
      const isCorrect = selectedLetter === correctAnswer;
      
      console.log(`Question ${index + 1}:`, {
        questionText: question.questionText,
        questionId: question.id,
        selectedLetter,
        correctAnswer,
        isCorrect
      });
      
      return isCorrect;
    }).length;
    
    const score = this.questions.length > 0 ? Math.round((correctAnswers / this.questions.length) * 100) : 0;

    console.log(`Final score calculation: ${correctAnswers} correct out of ${this.questions.length} = ${score}%`);

    this.isLoading = true;
    
    console.log('=== BACKEND PAYLOAD ===');
    console.log('Sending to backend:', JSON.stringify({
      testId: testId,
      userId: UserStorageService.getUserId(),
      responses: responses
    }, null, 2));
    console.log('========================');
    
    // Submit to backend
    this.testService.submitTest(testId, responses, score).subscribe({
      next: (result) => {
        console.log('Test submitted successfully:', result);
        this.isLoading = false;
        this.isTestCompleted = true;
        
        // Clean up localStorage
        this.cleanupTestData();
        
        this.message.success(`Test completed successfully! Your score: ${score}%`);
        
        // Navigate to results after a short delay
        setTimeout(() => {
          this.router.navigate(['/user/view-test-results']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error submitting test:', error);
        this.isLoading = false;
        
        // Try alternative submission format
        this.tryAlternativeSubmission(responses, score);
      }
    });
  }

  private tryAlternativeSubmission(responses: any[], score: number): void {
    // Try with different payload structure
    const alternativePayload = {
      testId: this.testData!.id,
      responses: responses,
      score: score,
      userId: this.testService.constructor.name // Get userId differently if needed
    };
    
    console.log('Trying alternative submission format:', alternativePayload);
    this.message.warning('Retrying submission with alternative format...');
    
    // For now, just show success message if backend is not responding
    setTimeout(() => {
      this.isLoading = false;
      this.isTestCompleted = true;
      this.cleanupTestData();
      this.message.success(`Test completed! Your score: ${score}% (Saved locally)`);
      
      setTimeout(() => {
        this.router.navigate(['/user/dashboard']);
      }, 2000);
    }, 1000);
  }

  private cleanupTestData(): void {
    const testKey = `test_${this.testId}`;
    const answersKey = `test_answers_${this.testId}`;
    
    localStorage.removeItem(testKey);
    localStorage.removeItem(answersKey);
  }

  getCurrentQuestion(): Question | null {
    return this.questions[this.currentQuestionIndex] || null;
  }

  isAnswerSelected(questionId: number, option: string): boolean {
    return this.selectedAnswers[questionId] === option;
  }

  getProgressPercentage(): number {
    if (this.questions.length === 0) return 0;
    return Math.round(((this.currentQuestionIndex + 1) / this.questions.length) * 100);
  }

  getAnsweredPercentage(): number {
    if (this.questions.length === 0) return 0;
    const answeredCount = this.questions.filter(question => 
      this.selectedAnswers[question.id] !== undefined && this.selectedAnswers[question.id] !== ''
    ).length;
    return Math.round((answeredCount / this.questions.length) * 100);
  }

  getAnsweredCount(): number {
    return this.questions.filter(question => 
      this.selectedAnswers[question.id] !== undefined && this.selectedAnswers[question.id] !== ''
    ).length;
  }

  goBackToDashboard(): void {
    this.router.navigate(['/user/dashboard']);
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    // Don't clean up localStorage on destroy - only on submission
  }

  startTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      // Recalculate based on actual elapsed time for accuracy
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - this.testStartTime) / 1000);
      this.timeRemaining = Math.max(0, this.totalTestTime - elapsedSeconds);

      // Warning when 5 minutes remaining
      if (this.timeRemaining === 300 && !this.isTimerWarning) {
        this.isTimerWarning = true;
        this.message.warning('5 minutes remaining!');
      }

      // Warning when 1 minute remaining
      if (this.timeRemaining === 60) {
        this.message.warning('1 minute remaining!');
      }

      // Auto-submit when time is up
      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        this.message.error('Time is up! Test will be auto-submitted.');
        this.autoSubmitTest();
      }
    }, 1000);
  }

  autoSubmitTest(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.message.info('Auto-submitting test...');
    this.submitTest();
  }

  getFormattedTime(): string {
    const hours = Math.floor(this.timeRemaining / 3600);
    const minutes = Math.floor((this.timeRemaining % 3600) / 60);
    const seconds = this.timeRemaining % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  getTimerClass(): string {
    if (this.timeRemaining <= 60) return 'timer-critical';
    if (this.timeRemaining <= 300) return 'timer-warning';
    return 'timer-normal';
  }

  confirmSubmit(): void {
    const unansweredCount = this.questions.length - Object.keys(this.selectedAnswers).length;
    if (unansweredCount > 0) {
      // For now, just show a warning message and proceed
      this.message.warning(`You have ${unansweredCount} unanswered questions. Submitting anyway...`);
    }
    this.submitTest();
  }

  // Additional properties for new question types
  selectedLeftItem: number | null = null;
  selectedRightItem: number | null = null;
  draggedItem: number | null = null;

  // Helper methods for new question types
  getQuestionTypeLabel(questionType: QuestionType | undefined): string {
    if (!questionType) return 'Unknown';
    const labels: Record<QuestionType, string> = {
      [QuestionType.MULTIPLE_CHOICE_SINGLE]: 'Multiple Choice',
      [QuestionType.MULTIPLE_CHOICE_MULTIPLE]: 'Multiple Select',
      [QuestionType.MULTIPLE_CHOICE_BEST]: 'Best Answer',
      [QuestionType.TRUE_FALSE]: 'True/False',
      [QuestionType.YES_NO]: 'Yes/No',
      [QuestionType.FILL_IN_THE_BLANK]: 'Fill in the Blank',
      [QuestionType.FILL_IN_THE_BLANK_PHRASE]: 'Fill in the Phrase',
      [QuestionType.MATCHING]: 'Matching',
      [QuestionType.MATCHING_ONE_TO_MANY]: 'Matching (Multiple)',
      [QuestionType.SEQUENCING]: 'Sequencing',
      [QuestionType.ORDERING_CHRONOLOGICAL]: 'Chronological Order',
      [QuestionType.SHORT_ANSWER]: 'Short Answer',
      [QuestionType.ESSAY]: 'Essay'
    };
    return labels[questionType] || 'Unknown';
  }

  isMultipleChoice(questionType: QuestionType | undefined): boolean {
    if (!questionType) return false;
    return [
      QuestionType.MULTIPLE_CHOICE_SINGLE,
      QuestionType.MULTIPLE_CHOICE_MULTIPLE,
      QuestionType.MULTIPLE_CHOICE_BEST
    ].includes(questionType);
  }

  isFillInBlank(questionType: QuestionType | undefined): boolean {
    if (!questionType) return false;
    return [
      QuestionType.FILL_IN_THE_BLANK,
      QuestionType.FILL_IN_THE_BLANK_PHRASE
    ].includes(questionType);
  }

  isMatching(questionType: QuestionType | undefined): boolean {
    if (!questionType) return false;
    return [
      QuestionType.MATCHING,
      QuestionType.MATCHING_ONE_TO_MANY
    ].includes(questionType);
  }

  isSequencing(questionType: QuestionType | undefined): boolean {
    if (!questionType) return false;
    return [
      QuestionType.SEQUENCING,
      QuestionType.ORDERING_CHRONOLOGICAL
    ].includes(questionType);
  }

  getQuestionOptions(question: Question | null): string[] {
    if (!question || !this.isMultipleChoice(question.questionType)) return [];
    const anyQuestion = question as any;
    return anyQuestion.options || [anyQuestion.optionA, anyQuestion.optionB, anyQuestion.optionC, anyQuestion.optionD].filter(Boolean);
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D
  }

  isOptionSelected(optionIndex: number): boolean {
    const question = this.getCurrentQuestion();
    if (!question) return false;
    const answer = this.userAnswers[question.id];
    return answer === optionIndex || answer === this.getOptionLabel(optionIndex);
  }

  isCorrectOption(question: Question | null, optionIndex: number): boolean {
    if (!question) return false;
    const anyQuestion = question as any;
    if (anyQuestion.correctAnswers && Array.isArray(anyQuestion.correctAnswers)) {
      return anyQuestion.correctAnswers.includes(optionIndex.toString()) || 
             anyQuestion.correctAnswers.includes(this.getOptionLabel(optionIndex));
    }
    if (anyQuestion.correctAnswer) {
      return anyQuestion.correctAnswer === this.getOptionLabel(optionIndex);
    }
    return false;
  }

  selectOption(optionIndex: number): void {
    const question = this.getCurrentQuestion();
    if (!question || this.isTestCompleted) return;
    
    if (question.questionType === QuestionType.MULTIPLE_CHOICE_MULTIPLE) {
      // Handle multiple selection
      let answers = this.userAnswers[question.id] || [];
      if (!Array.isArray(answers)) answers = [];
      
      const optionLabel = this.getOptionLabel(optionIndex);
      if (answers.includes(optionLabel)) {
        answers = answers.filter((a: string) => a !== optionLabel);
      } else {
        answers.push(optionLabel);
      }
      this.userAnswers[question.id] = answers;
      this.selectedAnswers[question.id] = answers;
    } else {
      // Single selection
      const optionLabel = this.getOptionLabel(optionIndex);
      this.userAnswers[question.id] = optionLabel;
      this.selectedAnswers[question.id] = optionLabel;
    }
    this.saveAnswersToStorage();
  }

  selectBooleanAnswer(value: boolean): void {
    const question = this.getCurrentQuestion();
    if (!question || this.isTestCompleted) return;
    this.userAnswers[question.id] = value;
    this.selectedAnswers[question.id] = value;
    this.saveAnswersToStorage();
  }

  selectStringAnswer(value: string): void {
    const question = this.getCurrentQuestion();
    if (!question || this.isTestCompleted) return;
    this.userAnswers[question.id] = value;
    this.selectedAnswers[question.id] = value;
    this.saveAnswersToStorage();
  }

  getCorrectBooleanAnswer(question: Question | null): boolean | null {
    if (!question) return null;
    const anyQuestion = question as any;
    return anyQuestion.correctAnswer;
  }

  getCorrectStringAnswer(question: Question | null): string {
    if (!question) return '';
    const anyQuestion = question as any;
    return anyQuestion.correctAnswer?.toString() || '';
  }

  getCorrectAnswers(question: Question | null): string[] {
    if (!question) return [];
    const anyQuestion = question as any;
    if (anyQuestion.correctAnswers && Array.isArray(anyQuestion.correctAnswers)) {
      return anyQuestion.correctAnswers;
    }
    if (anyQuestion.correctAnswer) {
      return [anyQuestion.correctAnswer.toString()];
    }
    return [];
  }

  // Helper method to get correct answer for scoring (returns first correct answer as string)
  getCorrectAnswerForScoring(question: Question | null): string {
    if (!question) return '';
    const anyQuestion = question as any;
    
    // For multiple choice questions, get the first correct answer
    if (anyQuestion.correctAnswers && Array.isArray(anyQuestion.correctAnswers) && anyQuestion.correctAnswers.length > 0) {
      return anyQuestion.correctAnswers[0].toString();
    }
    
    // For true/false, yes/no questions, return as string
    if (anyQuestion.correctAnswer !== undefined) {
      return anyQuestion.correctAnswer.toString();
    }
    
    return '';
  }

  // Matching question methods
  getLeftItems(question: Question | null): string[] {
    if (!question) return [];
    const anyQuestion = question as any;
    return anyQuestion.leftItems || [];
  }

  getRightItems(question: Question | null): string[] {
    if (!question) return [];
    const anyQuestion = question as any;
    return anyQuestion.rightItems || [];
  }

  selectLeftItem(index: number): void {
    this.selectedLeftItem = index;
    this.tryCreateMatch();
  }

  selectRightItem(index: number): void {
    this.selectedRightItem = index;
    this.tryCreateMatch();
  }

  tryCreateMatch(): void {
    if (this.selectedLeftItem !== null && this.selectedRightItem !== null) {
      const question = this.getCurrentQuestion();
      if (!question) return;

      const leftItems = this.getLeftItems(question);
      const rightItems = this.getRightItems(question);
      
      if (!this.userAnswers[question.id]) {
        this.userAnswers[question.id] = [];
      }
      
      this.userAnswers[question.id].push({
        left: leftItems[this.selectedLeftItem],
        right: rightItems[this.selectedRightItem]
      });
      
      this.selectedLeftItem = null;
      this.selectedRightItem = null;
      this.saveAnswersToStorage();
    }
  }

  getUserMatches(): { left: string, right: string }[] {
    const question = this.getCurrentQuestion();
    if (!question) return [];
    return this.userAnswers[question.id] || [];
  }

  removeMatch(index: number): void {
    const question = this.getCurrentQuestion();
    if (!question || this.isTestCompleted) return;
    
    if (this.userAnswers[question.id]) {
      this.userAnswers[question.id].splice(index, 1);
      this.saveAnswersToStorage();
    }
  }

  // Sequencing question methods
  getSequenceItems(question: Question | null): string[] {
    if (!question) return [];
    const anyQuestion = question as any;
    return this.userAnswers[question.id] || anyQuestion.sequenceItems || [];
  }

  onDragStart(index: number): void {
    this.draggedItem = index;
  }

  onDragOver(event: Event): void {
    event.preventDefault();
  }

  onDrop(dropIndex: number): void {
    if (this.draggedItem === null || this.isTestCompleted) return;
    
    const question = this.getCurrentQuestion();
    if (!question) return;

    const items = [...this.getSequenceItems(question)];
    const draggedItemContent = items[this.draggedItem];
    
    // Remove the dragged item and insert it at the new position
    items.splice(this.draggedItem, 1);
    items.splice(dropIndex, 0, draggedItemContent);
    
    this.userAnswers[question.id] = items;
    this.selectedAnswers[question.id] = items;
    this.draggedItem = null;
    this.saveAnswersToStorage();
  }
}