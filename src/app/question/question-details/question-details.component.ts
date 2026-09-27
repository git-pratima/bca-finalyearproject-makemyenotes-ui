import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../category/service/category.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { QuestionService } from '../service/question.service';
import { finalize } from 'rxjs';

export interface InterviewQuestion {
  id: string;
  question: string;
  answer: string;
  addedBy: string;
  createdDate: Date;
  modifiedDate: Date;
  expanded?: boolean;
  parentQuestionId: string;
}

@Component({
  selector: 'app-question-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './question-details.component.html',
  styleUrl: './question-details.component.css'
})
export class QuestionDetailsComponent implements OnInit {

  interviewQuestions: InterviewQuestion[] = [];
  isModalOpen = false;
  isEditMode = false;
  modalForm: Partial<InterviewQuestion> = {};

  questionId!: string;
  question: any = {};

  themeOpen = false;
  activeTab: 'bg' | 'text' = 'bg';
  currentBg = '#0d0f1a';
  currentText = '#cbd5e1';
  isSaving = false;
  saveSuccess = false;
  imageErrored: Set<number> = new Set();

  readonly DEFAULT_BG = '#0d0f1a';
  readonly DEFAULT_TEXT = '#cbd5e1';

  bgPresets = [
    { color: '#0d0f1a', label: 'Dark navy' },
    { color: '#0a1628', label: 'Midnight blue' },
    { color: '#1a1a2e', label: 'Deep indigo' },
    { color: '#ffffff', label: 'White' },
    { color: '#d4a853', label: 'Golden' },
    { color: '#054348', label: 'Forest green' },
    { color: '#7b2d8b', label: 'Deep purple' },
    { color: '#8b1a1a', label: 'Dark red' },
    { color: '#1a4a6b', label: 'Ocean blue' },
    { color: '#4a3728', label: 'Dark brown' },
  ];

  textPresets = [
    { color: '#ffffff', label: 'White' },
    { color: '#cbd5e1', label: 'Muted silver' },
    { color: '#000000', label: 'Black' },
    { color: '#1e293b', label: 'Dark slate' },
    { color: '#6366f1', label: 'Indigo' },
    { color: '#14b8a6', label: 'Teal' },
    { color: '#f43f5e', label: 'Rose' },
    { color: '#f59e0b', label: 'Amber' },
    { color: '#22c55e', label: 'Green' },
    { color: '#e879f9', label: 'Fuchsia' },
  ];

  constructor(
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private router: Router,
    private http: HttpClient,
    private questionService: QuestionService
  ) {}

  ngOnInit(): void {
    this.questionId = this.route.snapshot.paramMap.get('qId') || '';
    this.loadQuestionDetails(this.questionId);
    this.loadInterviewQuestions(this.questionId);
  }

  loadQuestionDetails(qId: string): void {
    this.questionService.getQuestionDetailsById(qId).subscribe({
      next: (res) => {
        this.question = res.question;
        if (this.question?.bgColor)   this.currentBg   = this.question.bgColor;
        if (this.question?.textColor) this.currentText = this.question.textColor;
      },
      error: (err) => console.error(err)
    });
  }

  saveTheme(): void {
    if (!this.question?.id) return;
    this.isSaving = true;
    this.questionService.saveTheme(this.question.id, this.currentBg, this.currentText)
      .pipe(finalize(() => this.isSaving = false))
      .subscribe({
        next: () => {
          this.saveSuccess = true;
          setTimeout(() => this.saveSuccess = false, 2000);
        },
        error: (err) => console.error('Failed to save theme', err)
      });
  }

  resetTheme(): void {
    this.currentBg   = this.question.bgColor;
    this.currentText = this.question.textColor;
  }

  getImageSrc(base64String: string): string {
    if (!base64String) return '';
    return 'data:image/jpeg;base64,' + base64String;
  }


  onImageError(event: Event, questionId: number) {
    (event.target as HTMLImageElement).src = 'defaultquestion.png';
    this.imageErrored.add(questionId);
  }

  editQuestion(id: string): void {
    this.router.navigate([`/update-question/${id}`]);
  }

  prevQuestion(id: string) {
    this.questionService.getPrevQuestionById(id).subscribe({
      next: (res) => {
        this.question = res.question;
        this.loadInterviewQuestions(this.question.id);
      },
      error: (err) => console.error(err)
    });
  }

  nextQuestion(id: string) {
    this.questionService.getNextQuestionById(id).subscribe({
      next: (res) => {
        this.question = res.question;
        this.loadInterviewQuestions(this.question.id);
      },
      error: (err) => console.error(err)
    });
  }

  // ─── Interview Questions ───────────────────────────────────

  loadInterviewQuestions(parentId: string): void {
    this.questionService.getInterviewQuestions(parentId).subscribe({
      next: (res) => {
        this.interviewQuestions = res.interviewQuestionDTOList;
      }
    });
  }

  toggleAnswer(iq: InterviewQuestion): void {
    iq.expanded = !iq.expanded;
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.modalForm = {
      question: '',
      answer: '',
      expanded: false,
      parentQuestionId: this.question.id
    };
    this.isModalOpen = true;
  }

  editInterviewQuestion(iq: InterviewQuestion): void {
    this.isEditMode = true;
    this.modalForm = { ...iq };
    this.isModalOpen = true;
  }

  saveInterviewQuestion(): void {
    if (!this.modalForm.question?.trim() || !this.modalForm.answer?.trim()) {
      alert('Question and Answer are required.');
      return;
    }
    if (this.isEditMode && this.modalForm.id) {
      this.questionService.updateInterviewQuestion(this.modalForm as InterviewQuestion).subscribe({
        next: (updated) => {
          const index = this.interviewQuestions.findIndex(q => q.id === updated.interviewQuestionDTO.id);
          if (index > -1) {
            this.interviewQuestions[index] = { ...updated.interviewQuestionDTO, expanded: false ? false : true };
          }
          this.closeModal();
        },
        error: (err) => console.error('Failed to update', err)
      });
    } else {
      const newIQ: Partial<InterviewQuestion> = {
        ...this.modalForm,
        parentQuestionId: this.question.id,
        createdDate: new Date()
      };
      this.questionService.addInterviewQuestion(newIQ).subscribe({
        next: (res) => {
          this.interviewQuestions.push({ ...res.interviewQuestionDTO, expanded: false ? false : true });
          this.closeModal();
        },
        error: (err) => console.error('Failed to add', err.error.message)
      });
    }
  }

  deleteInterviewQuestion(id: string): void {
    if (!confirm('Delete this interview question?')) return;
    this.questionService.deleteInterviewQuestion(id).subscribe({
      next: () => {
        this.interviewQuestions = this.interviewQuestions.filter(q => q.id !== id);
      },
      error: (err) => console.error('Failed to delete', err)
    });
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.modalForm = {};
  }
}