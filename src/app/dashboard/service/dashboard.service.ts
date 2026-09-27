import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  authStatuschanged = new EventEmitter<void>();
  private static BASE_URL = environment.apiUrl;
  private static ENCRYPTION_KEY = "phegon-dev-inventory";


  constructor(private http: HttpClient) {}

    // Encrypt data and save to localStorage
    encryptAndSaveToStorage(key: string, value: string): void {
      //const encryptedValue = CryptoJS.AES.encrypt(value, DashboardService.ENCRYPTION_KEY).toString();
      localStorage.setItem(key, value);
    }
  
    // Retreive from localStorage and Decrypt
    private getFromStorageAndDecrypt(key: string): any {
      try {
        const encryptedValue = localStorage.getItem(key);
        if (!encryptedValue) return null;
        //return CryptoJS.AES.decrypt(encryptedValue, DashboardService.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
        return encryptedValue;
      } catch (error) {
        return null;
      }
    }

  private getHeader(): HttpHeaders {
    const token = this.getFromStorageAndDecrypt("token");
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getDashboardData(): Observable<any> {
    return this.http.get(`${DashboardService.BASE_URL}/dashboard/dashboard-data`, {
      headers: this.getHeader(),
    });
  }

  createTodos(events: {id:string; task: string;completed:string; checked: boolean; }[]):Observable<any> {
    return this.http.post(`${DashboardService.BASE_URL}/todo/todo-list`, events,{
      headers: this.getHeader().set('X-Skip-Loader', 'true'),
    });
  }

  getNextFiveMatches(): Observable<any> {
    return this.http.get(`${DashboardService.BASE_URL}/match/next-five-match`, {
      headers: this.getHeader().set('X-Skip-Loader', 'true')
    });
  }

  saveSubscription(match: any): Observable<any> {
    return this.http.post(`${DashboardService.BASE_URL}/match/save-subscribedmatch`, match,{
      headers: this.getHeader().set('X-Skip-Loader', 'true'),
    });
  }

  
  unsubscribeSubscription(match: any): Observable<any> {
  return this.http.delete(`${DashboardService.BASE_URL}/delete-match`, {
    headers: this.getHeader().set('X-Skip-Loader', 'true'),
    body: match
  });
}

  getSubscribedMatch(): Observable<any> {
    return this.http.get(`${DashboardService.BASE_URL}/match/subscribed-match`,{
      headers: this.getHeader().set('X-Skip-Loader', 'true')
    });
  }

}
