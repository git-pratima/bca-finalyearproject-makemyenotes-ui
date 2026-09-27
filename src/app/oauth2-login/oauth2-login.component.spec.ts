import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Oauth2LoginComponent } from './oauth2-login.component';

describe('Oauth2LoginComponent', () => {
  let component: Oauth2LoginComponent;
  let fixture: ComponentFixture<Oauth2LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Oauth2LoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Oauth2LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
