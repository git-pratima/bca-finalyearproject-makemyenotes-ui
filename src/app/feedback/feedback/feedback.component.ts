import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CategoryService } from '../../category/service/category.service';
import { FeedbackService } from '../service/feedback.service';
import { NotificationService } from '../../shared/notificationService';

interface Feedback {
  id: number;
  rating: number;
  createdBy: string;
  message: string;
  createdAt:Date;
  seen:string;
}

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.css'
})
export class FeedbackComponent implements OnInit {

  searchForm = {
    rating: '',
    read: '',
    startOfDay: '',
    endOfDay: '',
    seen:''
  };
  categoryList: String[] = [];
  feedbacks: Feedback[] = [];
  totalPages = 0;
  totalElements = 0;
  page = 0;
  size = 10;
  sortBy = 'id';
  direction = 'asc';

  constructor(private http: HttpClient, private router: Router, private feedbackService:FeedbackService, private notify:NotificationService) {}

  ngOnInit(): void {
    this.loadFeedback();
  }

  resetSearch(): void {
    this.searchForm = {
      rating: '',
      read: '',
      startOfDay: '',
      endOfDay: '',
      seen:''
    };
    this.page = 0; // reset to first page
    this.loadFeedback(); // reload full list
}

  loadFeedback(): void {
    console.log(this.searchForm);
    this.feedbackService.getAllFeedback(this.page,this.size,this.direction,this.sortBy,this.searchForm).subscribe({
      next: (res) => {
        this.feedbacks = res.feedBackDetails;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
      },
      error: (err) => console.error(err)
    });
  }

  changePage(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.page = newPage;
      this.loadFeedback();
    }
  }

  changeSize(event: any): void {
    this.size = event.target.value;
    this.page = 0;
    this.loadFeedback();
  }

  sort(column: string): void {
    if (this.sortBy === column) {
      this.direction = this.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.direction = 'asc';
    }
    this.loadFeedback();
  }

  markAsRead(id: number):void{
   
      this.feedbackService.markAsRead(id).subscribe({
          next: (res:any) => {
                this.notify.info(res.message);
                window.location.reload();
              },
              error: (err: any) => {
              if(err.error.status===401){
                alert('Need Access/Login!');
                this.router.navigate(['/login']);
              }
              this.notify.error(err.error.message);
            }
    });
  }

  deleteFeedback(id: number): void {
      if (!confirm("Are you sure you want to delete this Reference Code?")) {
        return ;
      }

      this.feedbackService.deleteFeedback(id).subscribe({
          next: (res:any) => {
                this.notify.info(res.message);
                window.location.reload();
              },
              error: (err: any) => {
              if(err.error.status===401){
                alert('Need Access/Login!');
                this.router.navigate(['/login']);
              }
              this.notify.info(err.error.message);
            }
    });
  }

  // Search method
  search(): void {
    const start = new Date(this.searchForm.startOfDay);
    const end = new Date(this.searchForm.endOfDay);
    if (start >= end) {
      alert("Start of Day must be before End of Day");
      return;
    }
    console.log(this.searchForm);
    this.page = 0; // reset to first page
    this.loadFeedback(); // reload with filters applied
  }


}

