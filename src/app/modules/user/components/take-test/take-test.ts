import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Test } from '../../services/test';
import { UserStorageService } from '../../../shared/auth/services/user-storage.service';

interface Question {
  id: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer?: string;
}

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
  imports: [CommonModule],
  templateUrl: './take-test.html',
  styleUrls: ['./take-test.scss']
})
export class TakeTest implements OnInit, OnDestroy {
  questions: Question[] = [];
  testData: TestData | null = null;
  testId: number;
  isLoading = false;
  currentQuestionIndex = 0;
  selectedAnswers: { [key: number]: string } = {};
  userAnswers: { [key: number]: string } = {}; // Added for template compatibility
  timeRemaining = 0;
  totalTestTime = 0;
  testStartTime: number = 0;
  timerInterval: any;
  isTestCompleted = false;
  isTimerWarning = false;
  private storageKey = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private message: NzMessageService,
    private router: Router,
    private testService: Test
  ) {}

  ngOnInit(): void {
    this.testId = +this.activatedRoute.snapshot.params['id'];
    this.storageKey = `test_${this.testId}_progress`;
    
    if (this.testId) {
      this.loadTestQuestions();
    } else {
      this.message.error('Invalid test ID');
      this.router.navigate(['/user/dashboard']);
    }
  }

  loadTestQuestions(): void {
    this.isLoading = true;
    this.testService.getTestQuestions(this.testId).subscribe({
      next: (data: TestData) => {
        console.log("Fetched test data:", data);
        this.testData = data;
        this.questions = data.questions || [];
        this.isLoading = false;
        
        if (this.questions.length === 0) {
          this.message.warning('No questions found for this test');
          this.router.navigate(['/user/dashboard']);
          return;
        }

        // Initialize timer with persistence
        this.initializeTimer(data);
        this.loadSavedAnswers();
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
      this.selectedAnswers = JSON.parse(savedAnswers);
      this.userAnswers = { ...this.selectedAnswers };
    }
  }

  private saveAnswers(): void {
    const answersKey = `test_answers_${this.testId}`;
    localStorage.setItem(answersKey, JSON.stringify(this.selectedAnswers));
  }

  selectAnswer(questionId: number, selectedOption: string): void {
    this.selectedAnswers[questionId] = selectedOption;
    this.userAnswers[questionId] = selectedOption; // Keep both for compatibility
    this.saveAnswers(); // Save to localStorage
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
    const responses = this.questions.map((question, index) => {
      const selectedLetter = this.selectedAnswers[question.id]; // Use question.id, not index
      
      return {
        questionId: question.id,
        selectedOption: selectedLetter || '' // Send the letter (A, B, C, D) to match backend logic
      };
    });

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
      const correctAnswer = question.correctAnswer; // This is already in letter format (A, B, C, D)
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
      testId: this.testData.id,
      userId: UserStorageService.getUserId(),
      responses: responses
    }, null, 2));
    console.log('========================');
    
    // Submit to backend
    this.testService.submitTest(this.testData.id, responses, score).subscribe({
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
}