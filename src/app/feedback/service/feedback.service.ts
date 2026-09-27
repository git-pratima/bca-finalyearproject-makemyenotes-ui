import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoryService } from '../../category/service/category.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  authStatuschanged = new EventEmitter<void>();
  private static BASE_URL = environment.apiUrl;


  constructor(private http: HttpClient) {}

    // Encrypt data and save to localStorage
    encryptAndSaveToStorage(key: string, value: string): void {
      //const encryptedValue = CryptoJS.AES.encrypt(value, CategoryService.ENCRYPTION_KEY).toString();
      localStorage.setItem(key, value);
    }
  
    // Retreive from localStorage and Decrypt
    private getFromStorageAndDecrypt(key: string): any {
      try {
        const encryptedValue = localStorage.getItem(key);
        if (!encryptedValue) return null;
        //return CryptoJS.AES.decrypt(encryptedValue, CategoryService.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
        return encryptedValue;
      } catch (error) {
        return null;
      }
    }

  private clearAuth() {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
  }

  private getHeader(): HttpHeaders {
    const token = this.getFromStorageAndDecrypt("token");
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getLoggedInUserInfo(): Observable<any> {
    return this.http.get(`${FeedbackService.BASE_URL}/users/current`, {
      headers: this.getHeader(),
    });
  }

  getAllFeedback(page:number, size:number, order:string, orderBy:string, searchForm:any): Observable<any> {
    console.log(searchForm);
    let params = new HttpParams()
    .set('page', page)
    .set('size', size)
    .set('direction', order)
    .set('sortBy', orderBy);

    //Add search filters if provided
    if (searchForm.rating) {
      params = params.set('rating', searchForm.rating);
    }
    if (searchForm.startOfDay) {
      params = params.set('startOfDay', searchForm.startOfDay);
    }
    if (searchForm.endOfDay) {
      params = params.set('endOfDay', searchForm.endOfDay);
    }
    if (searchForm.seen) {
      params = params.set('seen', searchForm.seen);
    }

    return this.http.get(`${FeedbackService.BASE_URL}/feedback/all-feedback`, {
      headers: this.getHeader(),
      params: params
    });
  }

  deleteFeedback(id: number): Observable<any> {
    return this.http.delete(`${FeedbackService.BASE_URL}/feedback/delete-feedback/${id}`, {
      headers: this.getHeader(),
    });
  }

  markAsRead(id: number): Observable<any> {
    return this.http.get(`${FeedbackService.BASE_URL}/feedback/mark-feedback/${id}`, {
      headers: this.getHeader(),
    });
  }


  isAuthenticated():boolean{
    const token = this.getFromStorageAndDecrypt("token");
    return !!token;
  }

  isAdmin():boolean {
    const role = this.getFromStorageAndDecrypt("role");
    return role === "ADMIN";
  }

}