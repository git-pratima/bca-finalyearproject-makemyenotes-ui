import { TestBed } from '@angular/core/testing';

import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should clear local and session storage on logout', () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('theme', 'light');
    sessionStorage.setItem('temporary-data', 'test-value');

    service.logout();

    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });
});
