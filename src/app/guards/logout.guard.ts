import { CanActivateFn } from '@angular/router';

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ApiService } from '../service/api.service';

@Injectable({
  providedIn: 'root'
})
export class LogoutGuard implements CanActivate {

  constructor(private authService: ApiService, private router: Router) {}

  canActivate(): boolean {

    // perform logout before entering home
    this.authService.logout();

    // allow navigation to home
    return true;
  }
}

