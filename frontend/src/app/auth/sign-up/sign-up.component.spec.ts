import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUpComponent } from './sign-up.component';
import {ActivatedRoute, Router, UrlTree} from '@angular/router';
import {ToastService} from '../../toast/toast.service';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../auth.service';
import {of, Subject} from 'rxjs';

const mockHttpClient = {
  post: jasmine.createSpy('post').and.returnValue(of({})),
};

const mockRouter = {
  navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve('')),
  url: '/current-url',
  events: new Subject(),
  createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue({} as UrlTree),
  serializeUrl: jasmine.createSpy('serializeUrl').and.returnValue('/serialized-url'),
}

const mockActivatedRoute = {
};

const mockToastService = {
  show: jasmine.createSpy('show'),
};

const mockAuthService = {
  signIn: jasmine.createSpy('signIn').and.returnValue({}),
  isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValue(false)
}

describe('SignUpComponent', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;
  let httpClient: jasmine.SpyObj<HttpClient>;
  let router: jasmine.SpyObj<Router>;
  let toast: jasmine.SpyObj<ToastService>;
  let auth: jasmine.SpyObj<AuthService>;
  let route: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignUpComponent],
      providers: [
        {provide: ActivatedRoute, useValue: mockActivatedRoute},
        {provide: Router, useValue: mockRouter},
        {provide: ToastService, useValue: mockToastService},
        {provide: HttpClient, useValue: mockHttpClient},
        {provide: AuthService, useValue: mockAuthService},
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    httpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
    toast = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    auth = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    route = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
