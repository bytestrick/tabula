import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SignUpComponent} from './sign-up.component';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastService} from '../../toast/toast.service';
import {provideHttpClient} from '@angular/common/http';
import {AuthService} from '../auth.service';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {Reason} from '../otp/otp.component';

describe('SignUpComponent', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;
  let router: jasmine.SpyObj<Router>;
  let toast: jasmine.SpyObj<ToastService>;
  let auth: jasmine.SpyObj<AuthService>;
  let mockLocalStorage: Storage;
  let authStateSpy: jasmine.Spy;
  let httpTestingController: HttpTestingController;
  const realLocalStorage = window.localStorage;

  beforeEach(async () => {
    mockLocalStorage = jasmine.createSpyObj('localStorage', ['getItem', 'setItem', 'removeItem']);
    Object.defineProperty(window, 'localStorage', {value: mockLocalStorage});

    await TestBed.configureTestingModule({
      imports: [SignUpComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: ActivatedRoute, useValue: {}},
        {
          provide: Router, useValue: {
            events: {
              subscribe: () => {
              }
            },
            createUrlTree: jasmine.createSpy('createUrlTree'),
            serializeUrl: jasmine.createSpy('createUrlTree'),
            navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
          }
        },
        {provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['show', 'serverError'])},
        {provide: AuthService, useValue: {}},
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;

    toast = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    auth = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    httpTestingController = TestBed.inject(HttpTestingController);
    authStateSpy = jasmine.createSpy('isAuthenticated').and.returnValue(false);
    Object.defineProperty(auth, 'isAuthenticated', {get: authStateSpy});
  });

  afterEach(() => Object.defineProperty(window, 'localStorage', {value: realLocalStorage}));

  it('should create', () => {
    expect(component).toBeTruthy();
    authStateSpy.and.returnValue(false);
    fixture.detectChanges();
    expect(router.navigate).not.toHaveBeenCalled();
    httpTestingController.expectOne('countries.json').flush({});
  });

  it('deflects invalid accesses', () => {
    authStateSpy.and.returnValue(true);
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/']);
  });

  it('should enable a user to register', async () => {
    fixture.detectChanges();
    const pass = fixture.nativeElement.querySelector('#pass') as HTMLInputElement;
    const confirm = fixture.nativeElement.querySelector('#confirm') as HTMLInputElement;
    const name = fixture.nativeElement.querySelector('#name') as HTMLInputElement;
    const surname = fixture.nativeElement.querySelector('#surname') as HTMLSelectElement;
    const country = fixture.nativeElement.querySelector('#country') as HTMLInputElement;
    const email = fixture.nativeElement.querySelector('#email') as HTMLInputElement;
    const btn = fixture.nativeElement.querySelector('form div button.btn-primary') as HTMLButtonElement;

    pass.value = 'FooBarBaz9@';
    confirm.value = pass.value;
    name.value = "John";
    surname.value = "Doe";
    email.value = "john.doe@example.com";
    country.innerHTML += '<option value="1"></option>';
    country.value = "1";

    [pass, confirm, name, surname, email].forEach(el => el.dispatchEvent(new Event('input')));
    country.dispatchEvent(new Event('change'));

    btn.click();
    const req = httpTestingController.expectOne('/auth/sign-up');
    expect(req.request.body).toEqual({
      email: email.value,
      name: name.value,
      surname: surname.value,
      rememberMe: false,
      password: pass.value,
      country: undefined,
    });
    req.flush({});
    expect(localStorage.setItem).toHaveBeenCalledOnceWith('otpData',
      JSON.stringify({email: email.value, reason: Reason.VerifyEmail}));
    expect(router.navigate).toHaveBeenCalledOnceWith(['/otp']);
    expect(toast.show).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({body: 'Now you must verify your email to finish the sign-up process'}));

    // error path
    btn.click();
    httpTestingController.expectOne('/auth/sign-up')
      .flush({message: 'Email already registered'}, {status: 400, statusText: ''});
    fixture.detectChanges();
    expect(email.nextElementSibling?.textContent?.trim()).toEqual('Email already registered');

    // unknown error path
    email.dispatchEvent(new Event('input'));
    btn.click();
    httpTestingController.expectOne('/auth/sign-up')
      .flush({message: 'FooBar'}, {status: 400, statusText: ''});
    fixture.detectChanges();
    expect(toast.serverError).toHaveBeenCalledOnceWith('FooBar');
  });
});
