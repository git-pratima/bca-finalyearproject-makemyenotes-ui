import { EventEmitter, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookmarkService {

  authStatuschanged = new EventEmitter<void>();
  private static BASE_URL = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getBookMarkedQuestions(page:number, size:number, order:string, orderBy:string, searchForm:any): Observable<any> {
      let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('direction', order)
      .set('sortBy', orderBy);
  
        // Add search filters if provided
        if (searchForm.category) {
          params = params.set('category', searchForm.category);
        }
        if (searchForm.subCategory) {
          params = params.set('subcategory', searchForm.subCategory);
        }
        if (searchForm.type) {
          params = params.set('type', searchForm.type);
        }
        if (searchForm.bookmark) {
          params = params.set('bookmark', searchForm.bookmark);
        }
  
        return this.http.get(`${BookmarkService.BASE_URL}/question/all-bookmarked`, {
          headers: this.getHeader(),
          params: params
        });
    }

    private getHeader(): HttpHeaders {
      const token = this.getFromStorage("token");
        return new HttpHeaders({
          Authorization: `Bearer ${token}`,
      });
    }

    private getFromStorage(key: string): any {
      try {
        const encryptedValue = localStorage.getItem(key);
        if (!encryptedValue) return null;
        return encryptedValue;
      } catch (error) {
        return null;
      }
    }

}
