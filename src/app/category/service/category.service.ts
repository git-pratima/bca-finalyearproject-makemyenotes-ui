import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  authStatuschanged = new EventEmitter<void>();
  private static BASE_URL = environment.apiUrl;


  constructor(private http: HttpClient) {}
      encryptAndSaveToStorage(key: string, value: string): void {
      localStorage.setItem(key, value);
    }
  
    // Retreive from localStorage and Decrypt
    private getFromStorageAndDecrypt(key: string): any {
      try {
        const encryptedValue = localStorage.getItem(key);
        if (!encryptedValue) return null;
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

  /**CATEGOTY ENDPOINTS */
  createCategory(body: any): Observable<any> {
    return this.http.post(`${CategoryService.BASE_URL}/categories/add`, body, {
      headers: this.getHeader(),
    });
  }

  updateCategory(body: any): Observable<any> {
    return this.http.post(`${CategoryService.BASE_URL}/categories/update`, body, {
      headers: this.getHeader(),
    });
  }

  getAllCategory(page:number, size:number, order:string, orderBy:string, searchForm:any): Observable<any> {
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
    params = params.set('subCategory', searchForm.subCategory);
  }
  if (searchForm.topic) {
    params = params.set('topic', searchForm.topic);
  }
  if (searchForm.active) {
    params = params.set('active', searchForm.active);
  }

    return this.http.get(`${CategoryService.BASE_URL}/categories/all`, {
      headers: this.getHeader(),
      params: params
    });
  }

 //All category list
  getAllCategoryList(): Observable<any> {
    return this.http.get(`${CategoryService.BASE_URL}/categories/get-category-list`, {
      headers: this.getHeader(),
    });
  }

  //All Subcategory list wrt to category
  getAllSubCategoryList(cat: string): Observable<any> {
    return this.http.get(`${CategoryService.BASE_URL}/categories/get-subcategory-list/${cat}`, {
      headers: this.getHeader(),
    });
  }

  //All topic list wrt to subcategory
  getAllTopicList(subcat: string): Observable<any> {
    return this.http.get(`${CategoryService.BASE_URL}/categories/get-topic-list/${subcat}`, {
      headers: this.getHeader(),
    });
  }

  //All category wrt to user
  getCategoryList(): Observable<any> {
    return this.http.get(`${CategoryService.BASE_URL}/categories/user-category-list`, {
      headers: this.getHeader(),
    });
  }

  //All subcategory wrt to category and user
  getSubCategoryList(cat: string): Observable<any> {
    return this.http.get(`${CategoryService.BASE_URL}/categories/get-user-subcategory-list/${cat}`, {
      headers: this.getHeader(),
    });
  }

  //All topic wrt to subcategory and user
  getTopicList(subcat: string): Observable<any> {
    return this.http.get(`${CategoryService.BASE_URL}/categories/get-user-topic-list/${subcat}`, {
      headers: this.getHeader(),
    });
  }

  getCategoryById(id: string): Observable<any> {
    return this.http.get(`${CategoryService.BASE_URL}/categories/get-category/${id}`, {
      headers: this.getHeader(),
    });
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${CategoryService.BASE_URL}/categories/delete-category/${id}`, {
      headers: this.getHeader(),
    });
  }

}