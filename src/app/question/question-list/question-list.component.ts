import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionService } from '../service/question.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../category/service/category.service';
import { NotificationService } from '../../shared/notificationService';

interface Question {
    id: string;
    category: string;
    subCategory: string;
    topic: string;
    type: string;
    question: string;
    answer: string;
    bookmark: string;
    level: string;
    modifiedDate: Date;
    image: string;
    imageurl:string;
}

// ── SubCategory color palettes ───────────────────────────────────────────────
const SUBCATEGORY_PALETTES = [
  { bg: 'rgba(100,220,180,0.12)',  color: '#5dcaa5', border: 'rgba(100,220,180,0.28)' },
  { bg: 'rgba(96,165,250,0.12)',   color: '#93c5fd', border: 'rgba(96,165,250,0.28)'  },
  { bg: 'rgba(248,113,113,0.12)',  color: '#fca5a5', border: 'rgba(248,113,113,0.28)' },
  { bg: 'rgba(196,181,253,0.12)',  color: '#ddd6fe', border: 'rgba(196,181,253,0.28)' },
  { bg: 'rgba(110,231,183,0.12)',  color: '#a7f3d0', border: 'rgba(110,231,183,0.28)' },
  { bg: 'rgba(253,186,116,0.12)',  color: '#fed7aa', border: 'rgba(253,186,116,0.28)' },
  { bg: 'rgba(165,243,252,0.12)',  color: '#a5f3fc', border: 'rgba(165,243,252,0.28)' },
  { bg: 'rgba(249,168,212,0.12)',  color: '#fbcfe8', border: 'rgba(249,168,212,0.28)' },
  { bg: 'rgba(217,249,157,0.12)',  color: '#d9f99d', border: 'rgba(217,249,157,0.28)' },
  { bg: 'rgba(251,191,36,0.12)',   color: '#fcd34d', border: 'rgba(251,191,36,0.28)'  },
];

@Component({
  selector: 'app-question-list',
  standalone: true,
  imports: [MatSnackBarModule, CommonModule, FormsModule],
  templateUrl: './question-list.component.html',
  styleUrl: './question-list.component.css'
})
export class QuestionListComponent implements OnInit {

  searchForm = {
    category: '',
    subCategory: '',
    topic: '',
    type: '',
    bookmark: ''
  };

  constructor(
    private questionService: QuestionService,
    private router: Router,
    private snackBar: MatSnackBar,
    private categoryService: CategoryService,
    private notify: NotificationService
  ) {}

  products: Question[] = [];
  message: string = '';
  categoryList: String[] = [];
  subCategoryList: string[] = [];

  totalPages = 0;
  totalElements = 0;
  page = 0;
  size = 8;
  sortBy = 'id';
  direction = 'asc';

  // ── Color map ──────────────────────────────────────────────────────────────
  private subCategoryColorMap = new Map<string, number>();

  private getSubCategoryIndex(subCategory: string): number {
    if (!this.subCategoryColorMap.has(subCategory)) {
      this.subCategoryColorMap.set(
        subCategory,
        this.subCategoryColorMap.size % SUBCATEGORY_PALETTES.length
      );
    }
    return this.subCategoryColorMap.get(subCategory)!;
  }

  /** Call from the template via [ngStyle] */
  getSubCategoryStyle(subCategory: string): { [key: string]: string } {
    const p = SUBCATEGORY_PALETTES[this.getSubCategoryIndex(subCategory)];
    return {
      background: p.bg,
      color: p.color,
      border: `1px solid ${p.border}`
    };
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadDropdown();
    this.loadQuestions();
  }

  // ── Data ───────────────────────────────────────────────────────────────────

  loadDropdown(): void {
    this.categoryService.getCategoryList().subscribe({
      next: (res) => { this.categoryList = res.categoryList; },
      error: (err) => console.error(err)
    });
  }

  onChangeCategory(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const category1 = selectElement.value;
    this.categoryService.getSubCategoryList(category1).subscribe({
      next: (res) => { this.subCategoryList = res.subCategoryList; },
      error: (err) => this.notify.success(err.error.message)
    });
    this.loadQuestions();
  }

  getImageSrc(base64String: string): string {
    if (!base64String) return '';
    return 'data:image/jpeg;base64,' + base64String;
  }

  loadQuestions(): void {
    this.questionService.getAllQuestions(
      this.page, this.size, this.direction, this.sortBy, this.searchForm
    ).subscribe({
      next: (res) => {
        this.products = res.questionList;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        console.log(this.products);
        this.products.forEach(p => this.getSubCategoryIndex(p.subCategory));
      },
      error: (err) => console.error(err)
    });
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  navigateToAddQuestionPage(): void {
    this.router.navigate(['/add-question']);
  }

  navigateToEditProductPage(id: string): void {
    this.router.navigate([`/update-question/${id}`]);
  }

  navigateToViewQuestionDetails(id: string): void {
    this.router.navigate([`/question-details/${id}`]);
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  deleteQuestion(id: string): void {
    if (!confirm('Are you sure you want to delete this Question?')) return;
    this.questionService.deleteQuestionById(id).subscribe({
      next: (res: any) => {
        this.showMessage(res.message);
        const currentUrl = this.router.url;
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl]);
        });
      },
      error: (err) => { this.showMessage(err.error.message); }
    });
  }

  // ── Pagination ─────────────────────────────────────────────────────────────

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

  // ── Helpers ────────────────────────────────────────────────────────────────

  showMessage(message: string) {
    this.message = message;
    setTimeout(() => { this.message = ''; }, 4000);
  }

  viewMode: 'list' | 'tiles' = 'list';

  toggleTileAndListView(): void {
    this.viewMode = this.viewMode === 'list' ? 'tiles' : 'list';
  }

  get buttonText(): string {
    return this.viewMode === 'list' ? 'Switch to Tiles' : 'Switch to List';
  }

  resetSearch(): void {
    this.searchForm = { category: '', subCategory: '', type: '', bookmark: '', topic: '' };
    this.page = 0;
    this.loadQuestions();
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'defaultquestion.png';
  }
}