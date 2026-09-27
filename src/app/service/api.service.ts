import { EventEmitter, Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  authStatuschanged = new EventEmitter<void>();

  private static BASE_URL = environment.apiUrl;
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {}

  // ✅ single safe accessor — all localStorage calls go through here
  public getStorage(key: string): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(key);
    }
    return null;
  }

  saveToStorage(key: string, value: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, value);
    }
  }

  private clearAuth(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      sessionStorage.clear();
    }
  }

  private getFromStorageAndDecrypt(key: string): any {
    try {
      const encryptedValue = this.getStorage(key);
      if (!encryptedValue) return null;
      return encryptedValue;
    } catch (error) {
      return null;
    }
  }

  public getHeader(): HttpHeaders {
    const token = this.getFromStorageAndDecrypt("token");
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  loadOnlineUsers(): Observable<any> {
    return this.http.get(`${ApiService.BASE_URL}/users/online`, {
      headers: this.getHeader(),
    });
  }

  registerUser(body: any): Observable<any> {
    return this.http.post(`${ApiService.BASE_URL}/auth/register`, body);
  }

  loginUser(body: any): Observable<any> {
    return this.http.post(`${ApiService.BASE_URL}/auth/login`, body);
  }

  getLoggedInUserInfo(): Observable<any> {
    return this.http.get(`${ApiService.BASE_URL}/users/current`, {
      headers: this.getHeader(),
    });
  }

  logout(): void {
    this.clearAuth();
  }

  isAuthenticated(): boolean {
    const token = this.getFromStorageAndDecrypt("token");
    return !!token;
  }

  isAdmin(): boolean {
    const role = this.getFromStorageAndDecrypt("role");
    return role === "ADMIN";
  }

  saveFeedback(formData: any): Observable<any> {
    return this.http.post(`${ApiService.BASE_URL}/feedback/save`, formData, {
      headers: this.getHeader(),
    });
  }

}