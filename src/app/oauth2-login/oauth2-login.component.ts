import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-oauth2-login',
  standalone: true,
  imports: [],
  templateUrl: './oauth2-login.component.html',
  styleUrl: './oauth2-login.component.css'
})
export class Oauth2LoginComponent implements OnInit {

  private platformId = inject(PLATFORM_ID);

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const role = params['role'];
      const username = params['username'];

      if (token) {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', token);
          localStorage.setItem('role', role);
          localStorage.setItem('username', username);
        }
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}