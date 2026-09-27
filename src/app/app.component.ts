import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ApiService } from './service/api.service';
import { LoaderComponent } from './loading-effect/loader/loader.component';
import { FormsModule } from '@angular/forms';
import { NotificationService } from './shared/notificationService';
import { feedbackModel } from './shared/app.model';
import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule,LoaderComponent,FormsModule, CommonModule,RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})


export class AppComponent implements OnInit{

  theme: 'dark' | 'light' = 'dark';
  showModal = false;
  rating = 0;        // can be 1, 1.5, 2, 2.5, etc.
  feedbackText = '';
  userName:string | null = null;
  title = 'Make My e Notes';
  message:string | null = null;
  private platformId = inject(PLATFORM_ID);

  
  feedbackPayload: feedbackModel = {
    id: '',
    rating: 0,
    message: ''
  };

  constructor(
    private apiService: ApiService,
    private notify: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

// Add property
isNavReady = false;

// Update ngOnInit
ngOnInit(): void {
  if (isPlatformBrowser(this.platformId)) {
    this.userName = localStorage.getItem("username");
    this.theme = localStorage.getItem('theme') === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.theme);
  }

  // ✅ ADD THIS — hide outlet until first navigation completes
  this.router.events.pipe(
    filter(event => event instanceof NavigationEnd)
  ).subscribe(() => {
    this.isNavReady = true;
  });
}

  toggleTheme(): void {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', this.theme);
      document.documentElement.setAttribute('data-theme', this.theme);
    }
  }

  isAuth():boolean{
    if (isPlatformBrowser(this.platformId)) {
      this.userName = localStorage.getItem("username");
    }
    return this.apiService.isAuthenticated();
  }

  isAdmin():boolean{
    return this.apiService.isAdmin();
  }

  logOut():void{
    this.apiService.logout();
    this.router.navigate(["/home"])
    this.cdr.detectChanges();
  }


  openFeedback() {
    this.showModal = true;
    this.rating = 0;
    this.feedbackText = '';
  }

  closeModal() {
    this.showModal = false;
  }

  setRating(value: number) {
    this.rating = value;
  }

  submitFeedback() {
    this.feedbackPayload = {
      rating: this.rating,
      message: this.feedbackText
    };

    if(this.feedbackPayload.rating==0 || this.feedbackPayload.message==''){
        alert("All fields are required.");
        return;
      }

      this.apiService.saveFeedback(this.feedbackPayload).subscribe({
            next: (res:any) => {
                  this.notify.info('Feedback Sumitted Sucessfully!');
                },
                error: (err: any) => {
                if(err.error.status===401){
                  this.notify.error('Need Access/Login!');
                  this.router.navigate(['/login']);
                }
                this.notify.error(err.error.message);
              }
            });
    this.closeModal();
  }

}
