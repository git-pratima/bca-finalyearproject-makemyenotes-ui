import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { QuestionService } from '../question/service/question.service';
import { CategoryService } from '../category/service/category.service';
import { NotificationService } from '../shared/notificationService';
import { BookmarkService } from './service/bookmark.service';

interface Question {
    id:string;
    category:string;
    subCategory:string;
    topic:string;
    type:string;
    question:string;
    answer:string;
    bookmark:string;
    level:string;
    modifiedDate:Date;
    image:string;
    imageurl:string;
    createdByCurrentUser:string;
}

@Component({
  selector: 'app-bookmark',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './bookmark.component.html',
  styleUrl: './bookmark.component.css'
})
export class BookmarkComponent  implements OnInit {

  searchForm = {
    category: '',
    subCategory: '',
    topic:'',
    type: '',
    bookmark: ''
  };


  constructor(private questionService: QuestionService, private bookmarkService: BookmarkService,
    private router: Router,
    private snackBar: MatSnackBar,
    private categoryService:CategoryService,
    private notify:NotificationService) {}
  
  questions: Question[] = [];
  message: string = '';
  categoryList: String[] = [];
  subCategoryList:string[] = [];

  totalPages = 0;
  totalElements = 0;
  page = 0;
  size = 8;
  sortBy = 'id';
  direction = 'asc';

  isTileView: boolean = false;


  ngOnInit(): void {
    this.loadDropdown();
    this.loadQuestions();
  }

  loadDropdown():void{
    this.categoryService.getAllCategoryList().subscribe({
      next: (res)=>{
        this.categoryList = res.categoryList;
        console.log(this.categoryList);
      },error:(err)=>console.error(err)
    });
  }

  onChangeCategory(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const category1 = selectElement.value;
    this.searchForm.subCategory='';
    this.categoryService.getAllSubCategoryList(category1).subscribe({
      next: (res)=>{
        this.subCategoryList = res.subCategoryList;
        console.log(this.subCategoryList);
      },error:(err)=>this.notify.success(err.error.message)
    });
    this.loadQuestions();
  }

  getImageSrc(base64String: string): string {
    if (!base64String) {
      return '';
    }
    return 'data:image/jpeg;base64,' + base64String;
  }

  loadQuestions(): void {
    console.log(this.searchForm);
    this.bookmarkService.getBookMarkedQuestions(this.page,this.size,this.direction,this.sortBy,this.searchForm).subscribe({
      next: (res) => {
        this.questions = res.questionList;
        console.log(this.questions);
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
      },
      error: (err) =>{
        console.error(err);
      }
    });
  }

  //NAVIGATE TO ADD PRODUCT PAGE
  navigateToAddQuestionPage(): void {
    this.router.navigate(['/add-question']);
  }

  //NAVIGATE TO EDIT PRODUCT PAGE
  navigateToEditProductPage(id: string): void {
    this.router.navigate([`/update-question/${id}`]);
  }

  navigateToViewQuestionDetails(id: string):void{
      this.router.navigate([`/question-details/${id}`]);
  }

  deleteQuestion(id:string):void{
    if(!confirm("Are you sure you want to delete this Question?")){
      return;
    }
    this.questionService.deleteQuestionById(id).subscribe({
      next: (res:any)=>{
        this.showMessage(res.message);
        const currentUrl = this.router.url;

        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl]);
        });

      },error:(err)=>{
        this.showMessage(err.error.message);
      }
    })
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

    // Ignore empty / non-numeric input
    if (isNaN(pageNumber)) return;

    // Convert from 1-based (what the user sees) to 0-based (what the API uses)
    const targetPage = pageNumber - 1;

    // Clamp to valid range and only navigate if it's a different page
    if (targetPage >= 0 && targetPage < this.totalPages && targetPage !== this.page) {
      this.changePage(targetPage);
    }
  }


  //SHOW ERROR
  showMessage(message: string) {
    this.message = message;
    setTimeout(() => {
      this.message = '';
    }, 4000);
  }





  // 1. Extend the type
viewMode: 'list' | 'tiles' | 'quickread' = 'list';

// 2. Keep this exactly as-is — no changes needed
toggleTileAndListView(): void {
  this.viewMode = this.viewMode === 'list' ? 'tiles' : 'list';
}

// 3. Add this new method
toggleQuickReadView(): void {
  this.viewMode = this.viewMode === 'quickread' ? 'list' : 'quickread';
}

// 4. Add these for the image popup
popupImage: string | null = null;
popupQuestion: string = '';

openImagePopup(question: any): void {
  const src = question.imageurl;
  if (!src) return; // don't open popup if no image
  this.popupImage = src;
  this.popupQuestion = question.question;
}

closeImagePopup(): void {
  this.popupImage = null;
  this.popupQuestion = '';
}



  get buttonText(): string {
    return this.viewMode === 'list' ? 'Switch to Tiles' : 'Switch to List';
  }


  resetSearch(){
    this.searchForm = {
      category: '',
      subCategory: '',
      type: '',
      bookmark: '',
      topic:''
    };
    this.page = 0; // reset to first page
    this.loadQuestions(); // reload full list
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'defaultquestion.png';
  }
  
}
