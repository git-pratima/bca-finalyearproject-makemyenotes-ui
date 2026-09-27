import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../service/api.service';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';
import { NotificationService } from '../shared/notificationService';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  private static OAUTH_URL = environment.oauthUrl;

  constructor(private apiService:ApiService, private router:Router, private notify:NotificationService){}

  formData: any = {
    email: '',
    password: ''
  };

  ngOnInit(): void {
    this.apiService.logout();
  }

  message:string | null = null;

  async handleSubmit(){
    if(!this.formData.email || !this.formData.password ){
      alert("All fields are required.");
      return;
    }

    try {
      const response: any = await firstValueFrom(this.apiService.loginUser(this.formData));
      if (response.status === 200) {
        this.apiService.saveToStorage('token', response.token);
        this.apiService.saveToStorage('role', response.role);
        this.apiService.saveToStorage('username', response.userName);
        this.router.navigate(["/dashboard"]);
      }
    } catch (error:any) {
      this.notify.error(error?.error?.message || error?.message || "Unable to Login a user" + error);      
    }
  }

  loginWithGoogle() {
    window.location.href = `${LoginComponent.OAUTH_URL}/oauth2/authorize/google`;
  }
}
