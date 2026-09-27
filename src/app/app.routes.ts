import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { QuestionListComponent } from './question/question-list/question-list.component';
import { AddQuestionComponent } from './question/add-question/add-question.component';
import { UpdateQuestionComponent } from './question/update-question/update-question.component';
import { CategoryListComponent } from './category/category-list/category-list.component';
import { AddCategoryComponent } from './category/add-category/add-category.component';
import { UpdateCategoryComponent } from './category/update-category/update-category.component';
import { QuestionDetailsComponent } from './question/question-details/question-details.component';
import { FeedbackComponent } from './feedback/feedback/feedback.component';
import { Oauth2LoginComponent } from './oauth2-login/oauth2-login.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { TermsComponent } from './terms/terms.component';
import { TransactionComponent } from './transaction/transaction/transaction.component';
import { BookmarkComponent } from './bookmark/bookmark.component';
import { HomeComponent } from './home/home/home.component';
import { EventComponent } from './event/event.component';
import { authGuard } from './guards/auth.guard';
import { LogoutGuard } from './guards/logout.guard';

export const routes: Routes = [

  { path: 'login',     component: LoginComponent },
  { path: 'register',  component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard]},

  {
  path: 'home',
  component: HomeComponent,
  canActivate: [LogoutGuard]
},
{
  path: '',
  redirectTo: '/home',
  pathMatch: 'full'
},
  { path: 'question-details/:qId', component: QuestionDetailsComponent, canActivate: [authGuard] },
  { path: 'all-question', component: QuestionListComponent , canActivate: [authGuard] },
  { path: 'add-question', component: AddQuestionComponent, canActivate: [authGuard] },
  { path: 'update-question/:id', component: UpdateQuestionComponent, canActivate: [authGuard] },

  
  { path: 'all-category', component: CategoryListComponent, canActivate: [authGuard]  },
  { path: 'add-category', component: AddCategoryComponent, canActivate: [authGuard]  },
  { path: 'update-category/:catId', component: UpdateCategoryComponent, canActivate: [authGuard]  },

  { path: 'bookmarked-question', component: BookmarkComponent, canActivate: [authGuard]  },

  { path: 'feedback-list', component: FeedbackComponent, canActivate: [authGuard]  },
  { path: 'transaction', component: TransactionComponent, canActivate: [authGuard]  },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'auth/social-callback', component: Oauth2LoginComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'event', component: EventComponent }


];
