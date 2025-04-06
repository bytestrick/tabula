import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SignInComponent} from './sign-in.component';
import {AuthService} from '../auth.service';
import {ActivatedRoute, Router, UrlTree} from '@angular/router';
import {ToastService} from '../../toast/toast.service';
import {HttpClient} from '@angular/common/http';
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
  snapshot: {
    queryParams: {
      ['returnUrl']: 'hello',
    }
  }
};

const mockToastService = {
  show: jasmine.createSpy('show'),
};

const mockAuthService = {
  signIn: jasmine.createSpy('signIn').and.returnValue({}),
  isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValue(false)
}


describe('SignInComponent', () => {
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;
  let httpClient: jasmine.SpyObj<HttpClient>;
  let router: jasmine.SpyObj<Router>;
  let toast: jasmine.SpyObj<ToastService>;
  let route: jasmine.SpyObj<ActivatedRoute>;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignInComponent],
      providers: [
        {provide: Router, useValue: mockRouter},
        {provide: ToastService, useValue: mockToastService},
        {provide: HttpClient, useValue: mockHttpClient},
        {provide: AuthService, useValue: mockAuthService},
        {provide: ActivatedRoute, useValue: mockActivatedRoute}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    httpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
    toast = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    route = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    auth = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
