import { CommonModule } from '@angular/common';
import { Component, Injector, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../service/transaction.service';
import { BaseComponent } from '../../shared/baseComponent';
import { CategoryService } from '../../category/service/category.service';
import { QuestionService } from '../../question/service/question.service';

export interface Question {
  pid: number;
  id: number;
  question: string;
  answer: string;
  bookmark: string;
  category: string;
  subCategory: string;
  topic: string;
  type: string;
  createdDate: string;
  modifiedDate: string;
  createdByCurrentUser: string;
}

// ── Color palettes ──────────────────────────────────────────────────────────
// Each palette: { bg, color, border }
const CATEGORY_PALETTES = [
  { bg: 'rgba(56,139,253,0.15)',   color: '#79b8ff', border: 'rgba(56,139,253,0.35)' },
  { bg: 'rgba(240,107,60,0.15)',   color: '#ffa07a', border: 'rgba(240,107,60,0.35)' },
  { bg: 'rgba(167,139,250,0.15)',  color: '#c4b5fd', border: 'rgba(167,139,250,0.35)' },
  { bg: 'rgba(52,211,153,0.15)',   color: '#6ee7b7', border: 'rgba(52,211,153,0.35)' },
  { bg: 'rgba(251,191,36,0.15)',   color: '#fcd34d', border: 'rgba(251,191,36,0.35)' },
  { bg: 'rgba(236,72,153,0.15)',   color: '#f9a8d4', border: 'rgba(236,72,153,0.35)' },
  { bg: 'rgba(20,184,166,0.15)',   color: '#5eead4', border: 'rgba(20,184,166,0.35)' },
  { bg: 'rgba(249,115,22,0.15)',   color: '#fdba74', border: 'rgba(249,115,22,0.35)' },
];

const SUBCATEGORY_PALETTES = [
  { bg: 'rgba(100,220,180,0.12)',  color: '#5dcaa5', border: 'rgba(100,220,180,0.28)' },
  { bg: 'rgba(96,165,250,0.12)',   color: '#93c5fd', border: 'rgba(96,165,250,0.28)' },
  { bg: 'rgba(248,113,113,0.12)',  color: '#fca5a5', border: 'rgba(248,113,113,0.28)' },
  { bg: 'rgba(196,181,253,0.12)',  color: '#ddd6fe', border: 'rgba(196,181,253,0.28)' },
  { bg: 'rgba(110,231,183,0.12)',  color: '#a7f3d0', border: 'rgba(110,231,183,0.28)' },
  { bg: 'rgba(253,186,116,0.12)',  color: '#fed7aa', border: 'rgba(253,186,116,0.28)' },
  { bg: 'rgba(165,243,252,0.12)',  color: '#a5f3fc', border: 'rgba(165,243,252,0.28)' },
  { bg: 'rgba(249,168,212,0.12)',  color: '#fbcfe8', border: 'rgba(249,168,212,0.28)' },
  { bg: 'rgba(217,249,157,0.12)',  color: '#d9f99d', border: 'rgba(217,249,157,0.28)' },
  { bg: 'rgba(254,215,170,0.12)',  color: '#fed7aa', border: 'rgba(254,215,170,0.28)' },
];

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.css'
})
export class TransactionComponent extends BaseComponent implements OnInit {

  constructor(
    injector: Injector,
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private questionService: QuestionService
  ) {
    super(injector);
  }

  searchForm = {
    category: '',
    subCategory: '',
    topic: '',
    type: '',
    level: '',
    bookmark: '',
    searchText: ''
  };

  questions: Question[] = [];
  categoryList: String[] = [];
  subCategoryList: String[] = [];
  topicList: String[] = [];

  // Pagination
  totalPages = 0;
  totalElements = 0;
  page = 0;
  size = 10;
  sortBy = 'id';
  direction = 'asc';

  // ── Color maps (populated dynamically as data arrives) ──────────────────
  private categoryColorMap = new Map<string, number>();
  private subCategoryColorMap = new Map<string, number>();

  ngOnInit(): void {
    this.resetFilters();
    this.loadCategoryDropdown();
    this.loadQuestions();
  }

  // ── Color helpers ────────────────────────────────────────────────────────

  /** Returns an index into CATEGORY_PALETTES, assigning one if not yet seen. */
  private getCategoryIndex(category: string): number {
    if (!this.categoryColorMap.has(category)) {
      this.categoryColorMap.set(category, this.categoryColorMap.size % CATEGORY_PALETTES.length);
    }
    return this.categoryColorMap.get(category)!;
  }

  /** Returns an index into SUBCATEGORY_PALETTES, assigning one if not yet seen. */
  private getSubCategoryIndex(subCategory: string): number {
    if (!this.subCategoryColorMap.has(subCategory)) {
      this.subCategoryColorMap.set(subCategory, this.subCategoryColorMap.size % SUBCATEGORY_PALETTES.length);
    }
    return this.subCategoryColorMap.get(subCategory)!;
  }

  /** Returns an inline-style object for a category badge. */
  getCategoryStyle(category: string): { [key: string]: string } {
    const p = CATEGORY_PALETTES[this.getCategoryIndex(category)];
    return {
      'background': p.bg,
      'color': p.color,
      'border': `1px solid ${p.border}`
    };
  }

  /** Returns an inline-style object for a sub-category badge. */
  getSubCategoryStyle(subCategory: string): { [key: string]: string } {
    const p = SUBCATEGORY_PALETTES[this.getSubCategoryIndex(subCategory)];
    return {
      'background': p.bg,
      'color': p.color,
      'border': `1px solid ${p.border}`
    };
  }

  // ── Data loading ─────────────────────────────────────────────────────────

  loadCategoryDropdown(): void {
    this.categoryService.getAllCategoryList().subscribe({
      next: (res) => { this.categoryList = res.categoryList; },
      error: (err) => console.error(err)
    });
  }

  onCategoryChange(event: Event): void {
    this.searchForm.subCategory = '';
    this.searchForm.topic = '';
    const selectElement = event.target as HTMLSelectElement;
    const category = selectElement.value;
    if (category !== '') {
      this.categoryService.getAllSubCategoryList(category).subscribe({
        next: (res) => { this.subCategoryList = res.subCategoryList; },
        error: (err) => { this.notify.error(err.error.message); }
      });
    }
    this.loadQuestions();
  }

  onSubCategoryChange(event: Event): void {
    this.searchForm.topic = '';
    const selectElement = event.target as HTMLSelectElement;
    const category = selectElement.value;
    if (category !== '') {
      this.categoryService.getAllTopicList(category).subscribe({
        next: (res) => { this.topicList = res.topicList; },
        error: (err) => { this.notify.error(err.error.message); }
      });
    }
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.transactionService.getAllQuestions(
      this.page, this.size, this.direction, this.sortBy, this.searchForm
    ).subscribe({
      next: (res) => {
        this.questions = res.questionList;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        // Pre-warm the color maps so colors are stable across pages
        this.questions.forEach(q => {
          this.getCategoryIndex(q.category);
          this.getSubCategoryIndex(q.subCategory);
        });
      },
      error: (err) => console.error(err)
    });
  }

  resetFilters(): void {
    this.searchForm = {
      category: '',
      subCategory: '',
      topic: '',
      type: '',
      level: '',
      bookmark: '',
      searchText: ''
    };
    this.totalPages = 0;
    this.totalElements = 0;
    this.page = 0;
    this.size = 10;
    this.sortBy = 'id';
    this.direction = 'asc';
    this.loadQuestions();
  }

  toggleBookmark(item: Question): void {
    item.bookmark = item.bookmark === 'Yes' ? 'No' : 'Yes';
    this.transactionService.toogleBookMark(item.id).subscribe({
      next: (res) => { this.notify.success(res.message); },
      error: (err) => { this.notify.error(err.error.message); }
    });
  }

  changePage(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.page = newPage;
      this.loadQuestions();
    }
  }

  changeSize(event: any): void {
    this.size = event.target.value;
    this.page = 0;
    this.loadQuestions();
  }

  sort(column: string): void {
    if (this.sortBy === column) {
      this.direction = this.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.direction = 'asc';
    }
    this.loadQuestions();
  }

  goToPage(value: string): void {
    const pageNumber = parseInt(value, 10);
    if (isNaN(pageNumber)) return;
    const targetPage = pageNumber - 1;
    if (targetPage >= 0 && targetPage < this.totalPages && targetPage !== this.page) {
      this.changePage(targetPage);
    }
  }

  deleteQuestion(id: number): void {
    if (!confirm('Are you sure you want to delete this Question?')) return;
    this.questionService.deleteQuestionById(id.toString()).subscribe({
      next: (res: any) => {
        this.notify.info(res.message);
        const currentUrl = this.router.url;
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl]);
        });
      },
      error: (err) => { this.notify.error(err.error.message); }
    });
  }

  navigateToEditProductPage(id: number): void {
    this.router.navigate([`/update-question/${id}`]);
  }

  navigateToViewQuestionDetails(id: number): void {
    this.router.navigate([`/question-details/${id}`]);
  }
}