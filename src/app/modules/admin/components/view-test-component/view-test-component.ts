import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { Question } from '../../../shared/interfaces/question.interface';
import { QuestionType } from '../../../shared/enums/question-types.enum';

@Component({
  selector: 'app-view-test-component',
  standalone: true,
  imports: [SharedModule, CommonModule, NzCardModule, ReactiveFormsModule],
  templateUrl: './view-test-component.html',  // ✅ correct name
  styleUrls: ['./view-test-component.scss']   // ✅ corrected
})
export class ViewTestComponent {
  questions: Question[] = [];
  testId: number | null = null;
  QuestionType = QuestionType; // Make enum available in template

  constructor(private adminService: AdminService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.testId = this.route.snapshot.params['id'];
    if (this.testId) {
      this.adminService.getTestQuestions(this.testId).subscribe({
        next: (data) => {
          console.log("Fetched test data:", data); // ✅ Debugging
          this.questions = data.questions; // ✅ Correctly assign
        },
        error: (error) => {
          console.error('Error fetching test questions:', error);
        }
      });
    }
  }

  // Helper methods for template
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

  isCorrectOption(question: Question, optionIndex: number): boolean {
    if (this.isMultipleChoice(question.questionType)) {
      const mcQuestion = question as any;
      if (mcQuestion.correctAnswers && Array.isArray(mcQuestion.correctAnswers)) {
        return mcQuestion.correctAnswers.includes(optionIndex.toString()) || 
               mcQuestion.correctAnswers.includes(this.getOptionLabel(optionIndex));
      }
      if (mcQuestion.correctAnswer) {
        return mcQuestion.correctAnswer === this.getOptionLabel(optionIndex);
      }
    }
    return false;
  }

  getCorrectAnswer(question: Question): string {
    const anyQuestion = question as any;
    if (anyQuestion.correctAnswer !== undefined) {
      return anyQuestion.correctAnswer.toString().toLowerCase();
    }
    if (anyQuestion.correctAnswers && anyQuestion.correctAnswers.length > 0) {
      return anyQuestion.correctAnswers[0].toString().toLowerCase();
    }
    return '';
  }

  getCorrectAnswers(question: Question): string[] {
    const anyQuestion = question as any;
    if (anyQuestion.correctAnswers && Array.isArray(anyQuestion.correctAnswers)) {
      return anyQuestion.correctAnswers;
    }
    if (anyQuestion.correctAnswer) {
      return [anyQuestion.correctAnswer];
    }
    return [];
  }

  getMatchingPairs(question: Question): { left: string, right: string }[] {
    const matchingQuestion = question as any;
    return matchingQuestion.matchingPairs || [];
  }

  getSequenceItems(question: Question): string[] {
    const sequenceQuestion = question as any;
    return sequenceQuestion.sequenceItems || [];
  }

  getEssayGuidelines(question: Question): string {
    const essayQuestion = question as any;
    return essayQuestion.guidelines || '';
  }
}
