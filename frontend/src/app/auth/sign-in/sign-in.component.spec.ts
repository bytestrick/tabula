import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SignInComponent} from './sign-in.component';
import {AuthService} from '../auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastService} from '../../toast/toast.service';
import {HttpErrorResponse, provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {Reason} from '../otp/otp.component';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {of, throwError} from 'rxjs';

describe('SignInComponent', () => {
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;
  let router: jasmine.SpyObj<Router>;
  let toast: jasmine.SpyObj<ToastService>;
  let route: jasmine.SpyObj<ActivatedRoute>;
  let auth: jasmine.SpyObj<AuthService>;
  let authStateSpy: jasmine.Spy;
  let httpTestingController: HttpTestingController;
  let mockLocalStorage: Storage;
  const realLocalStorage = window.localStorage;

  beforeEach(async () => {
    mockLocalStorage = jasmine.createSpyObj('localStorage', ['getItem', 'setItem', 'removeItem']);
    Object.defineProperty(window, 'localStorage', {value: mockLocalStorage});

    await TestBed.configureTestingModule({
      imports: [SignInComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
            events: {
              subscribe: () => {
              }
            },
            createUrlTree: jasmine.createSpy('createUrlTree'),
            serializeUrl: jasmine.createSpy('createUrlTree'),
          }
        },
        {provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['show', 'serverError'])},
        {provide: AuthService, useValue: jasmine.createSpyObj('AuthService', ['signIn'])},
        {
          provide: ActivatedRoute,
          useValue: jasmine.createSpyObj('ActivatedRoute', ['toString'], {snapshot: {queryParams: {}}})
        },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignInComponent);
    component = fixture.componentInstance;

    toast = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    route = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    auth = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    httpTestingController = TestBed.inject(HttpTestingController);

    authStateSpy = jasmine.createSpy('isAuthenticated').and.returnValue(false);
    Object.defineProperty(auth, 'isAuthenticated', {get: authStateSpy});
  });

  afterEach(() => Object.defineProperty(window, 'localStorage', {value: realLocalStorage}));

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('deflects invalid accesses', () => {
    authStateSpy.and.returnValue(true);
    route.snapshot.queryParams['returnUrl'] = '/abracadabra';
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/abracadabra'])
  });

  it('lets users reset their password', () => {
    const btn = fixture.nativeElement.querySelector('form div:nth-of-type(3) button') as HTMLButtonElement;
    const emailInput = fixture.nativeElement.querySelector('#email') as HTMLInputElement;
    btn.click();
    fixture.detectChanges();
    expect(emailInput.nextElementSibling?.textContent?.trim()).toBe('Email required');

    // success path
    emailInput.value = 'test@example.com';
    emailInput.dispatchEvent(new Event('input'));
    btn.click();

    const req = httpTestingController.expectOne('/auth/send-otp');
    const otpData = {email: 'test@example.com', reason: Reason.ResetPassword};
    expect(req.request.body).toEqual({...otpData, receiver: 'test@example.com', reason: otpData.reason.toLowerCase()});
    req.flush({});
    expect(localStorage.setItem).toHaveBeenCalledOnceWith('otpData', JSON.stringify(otpData));
    expect(router.navigate).toHaveBeenCalledOnceWith(['/otp']);

    // error path
    emailInput.value = 'test2@example.com';
    emailInput.dispatchEvent(new Event('input'));
    btn.click();
    httpTestingController.expectOne('/auth/send-otp').flush({message: 'No user found'}, {status: 400, statusText: ''});
    fixture.detectChanges();
    expect(emailInput.nextElementSibling?.textContent?.trim()).toBe('There is no user registered with this email');

    // unknown error
    emailInput.value = 'test3@example.com';
    emailInput.dispatchEvent(new Event('input'));
    btn.click();
    httpTestingController.expectOne('/auth/send-otp').flush({message: '32847'}, {status: 400, statusText: ''});
    expect(toast.serverError).toHaveBeenCalledOnceWith('32847');
  });

  it('enables a user to sign-in', () => {
    fixture.detectChanges();
    const credentials = {email: 'test@example.com', password: 'YellowPyramid#1', rememberMe: false};
    const btn = fixture.nativeElement.querySelector('form div:nth-of-type(4) button') as HTMLButtonElement;

    const emailInput = fixture.nativeElement.querySelector('#email') as HTMLInputElement;
    emailInput.value = credentials.email;
    emailInput.dispatchEvent(new Event('input'));

    const passwordInput = fixture.nativeElement.querySelector('#pass') as HTMLInputElement;
    passwordInput.value = credentials.password;
    passwordInput.dispatchEvent(new Event('input'));

    auth.signIn.and.returnValue(of({token: 'token'}));
    btn.click();
    expect(auth.signIn).toHaveBeenCalledOnceWith(credentials);
    expect(toast.show).toHaveBeenCalledOnceWith(jasmine.objectContaining({title: 'Sign in successful'}));
    expect(router.navigate).toHaveBeenCalledOnceWith(['/']);

    // unknown email error
    auth.signIn.and.returnValue(throwError(() =>
      new HttpErrorResponse({error: {message: 'No user found'}, status: 400})));
    btn.click();
    fixture.detectChanges();
    expect(emailInput.nextElementSibling?.textContent?.trim()).toBe('There is no user registered with this email');

    // incorrect password error
    emailInput.value = 'test2@example.com';
    emailInput.dispatchEvent(new Event('input'));
    auth.signIn.and.returnValue(throwError(() =>
      new HttpErrorResponse({error: {message: 'Incorrect password'}, status: 400})));
    btn.click();
    fixture.detectChanges();
    expect(passwordInput.nextElementSibling?.nextElementSibling?.textContent?.trim()).toBe('Incorrect password');

    // other errors
    emailInput.value = 'test3@example.com';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.dispatchEvent(new Event('input'));
    auth.signIn.and.returnValue(throwError(() =>
      new HttpErrorResponse({error: {message: 'Bar'}, status: 400})));
    btn.click();
    expect(toast.serverError).toHaveBeenCalledWith('Bar');
  });

  it('makes an unverified user verify their email', () => {
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('form div:nth-of-type(4) button') as HTMLButtonElement;
    const emailInput = fixture.nativeElement.querySelector('#email') as HTMLInputElement;
    emailInput.value = 'test@example.com';
    emailInput.dispatchEvent(new Event('input'));
    const passwordInput = fixture.nativeElement.querySelector('#pass') as HTMLInputElement;
    passwordInput.value = 'Elephant1.';
    passwordInput.dispatchEvent(new Event('input'));

    auth.signIn.and.returnValue(throwError(() =>
      new HttpErrorResponse({error: {message: 'Not enabled'}, status: 400})));
    btn.click();

    const otpData = {email: emailInput.value, reason: Reason.VerifyEmail};
    const req = httpTestingController.expectOne('/auth/send-otp');
    expect(req.request.body).toEqual({...otpData, receiver: emailInput.value});
    req.flush({});

    expect(localStorage.setItem).toHaveBeenCalledOnceWith('otpData', JSON.stringify(otpData));
    expect(toast.show).toHaveBeenCalledOnceWith(jasmine.objectContaining({title: 'Unverified account'}));
    expect(router.navigate).toHaveBeenCalledOnceWith(['/otp']);

    // generic error handling
    auth.signIn.and.returnValue(throwError(() =>
      new HttpErrorResponse({error: {message: 'Not enabled'}, status: 400})));
    btn.click();
    httpTestingController.expectOne('/auth/send-otp').flush({message: 'Baz'}, {status: 400, statusText: ''});
    expect(toast.serverError).toHaveBeenCalledOnceWith('Baz');
  });
});
