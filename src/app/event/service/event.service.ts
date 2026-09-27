import { EventEmitter, Injectable, Injector } from '@angular/core';
import { BaseComponent } from '../../shared/baseComponent';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService extends BaseComponent {
  authStatuschanged = new EventEmitter<void>();
  private static BASE_URL = environment.apiUrl;

  constructor(injector:Injector){
    super(injector);
  }

saveEvent(event: any): Observable<any> {
  console.log("Event: "+JSON.stringify(event));
  return this.http.post(`${EventService.BASE_URL}/event/save-event`, event, {
     headers: this.apiService.getHeader()
    });
  }

deleteEvent(id: string): Observable<any> {
  return this.http.delete(
    `${EventService.BASE_URL}/event/delete-event/` + id,
    { headers: this.apiService.getHeader() }
  );
}

getUserEvents():Observable<any>{
  return this.http.get(`${EventService.BASE_URL}/event/get-user-event`, {
     headers: this.apiService.getHeader()
    });
}

}
