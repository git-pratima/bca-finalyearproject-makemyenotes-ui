// shared/base.component.ts
import { Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from './notificationService';
import { ApiService } from '../service/api.service';

export abstract class BaseComponent {

  protected route!: ActivatedRoute;
  protected router!: Router;
  protected fb!: FormBuilder;
  protected http!: HttpClient;
  protected notify!:NotificationService;
  protected apiService!:ApiService

  constructor(injector: Injector) {
    this.route  = injector.get(ActivatedRoute);
    this.router = injector.get(Router);
    this.fb     = injector.get(FormBuilder);
    this.http   = injector.get(HttpClient);
    this.notify = injector.get(NotificationService);
    this.apiService = injector.get(ApiService);
  }
}
