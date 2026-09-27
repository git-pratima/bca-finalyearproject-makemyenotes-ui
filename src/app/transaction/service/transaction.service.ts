import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})

export class TransactionService {

  authStatuschanged = new EventEmitter<void>();
  private static BASE_URL = environment.apiUrl;
  private static ENCRYPTION_KEY = "phegon-dev-inventory";


  constructor(private http: HttpClient) {}

    // Retreive from localStorage and Decrypt
    private getFromStorage(key: string): any {
      try {
        const encryptedValue = localStorage.getItem(key);
        if (!encryptedValue) return null;
        return encryptedValue;
      } catch (error) {
        return null;
      }
    }

    




  private getHeader(): HttpHeaders {
    const token = this.getFromStorage("token");
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  toogleBookMark(id:number):Observable<any>{
    return this.http.get(`${TransactionService.BASE_URL}/transaction/bookmark/`+id, {
        headers: this.getHeader()
      });
  }


  getAllQuestions(page:number, size:number, order:string, orderBy:string, searchForm:any): Observable<any> {
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
      if (searchForm.topic) {
        params = params.set('topic', searchForm.topic);
      }
      if (searchForm.type) {
        params = params.set('type', searchForm.type);
      }
      if (searchForm.level) {
        params = params.set('level', searchForm.level);
      }
      if (searchForm.bookmark) {
        params = params.set('bookmark', searchForm.bookmark);
      }
      if (searchForm.searchText) {
        params = params.set('question', searchForm.searchText);
      }

      return this.http.get(`${TransactionService.BASE_URL}/transaction/all-transaction`, {
        headers: this.getHeader(),
        params: params
      });
  }

}
