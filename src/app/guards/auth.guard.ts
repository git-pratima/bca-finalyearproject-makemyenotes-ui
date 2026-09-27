import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // SSR Safety: localStorage is only available in the browser
  if (!isPlatformBrowser(platformId)) {
    // During SSR, do not block the route — let the browser re-evaluate
    return false;
  }

  const token = localStorage.getItem('token'); // 🔁 replace 'token' with your actual key

  if (token) {
    return true;
  }

  // Not authenticated → redirect to login
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url } // optional: preserve intended route
  });
  return false;
};