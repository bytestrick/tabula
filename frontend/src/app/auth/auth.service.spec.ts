import {TestBed} from '@angular/core/testing';
import {Authentication, AuthService, SignInRequest} from './auth.service';
import {HttpErrorResponse, provideHttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {ToastService} from '../toast/toast.service';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';

function prepareSignIn(
  service: AuthService,
  router: jasmine.SpyObj<Router>,
  httpTestingController:
  HttpTestingController,
  token: string
) {
  service = TestBed.inject(AuthService);
  expect(service).toBeTruthy();
  router.navigate.and.returnValue(Promise.resolve(true));
  service.signIn({email: 'test@test.com', password: 'abracadabra', rememberMe: false}).subscribe();
  httpTestingController.expectOne(`/auth/sign-in`).flush(token);
  service.authentication = {email: 'test@test.com', token};
  service.signOut();
}

describe('AuthService', () => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
    + 'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.'
    + 'KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30';
  let service: AuthService;
  let httpTestingController: HttpTestingController;
  let router: jasmine.SpyObj<Router>;
  let toast: jasmine.SpyObj<ToastService>;
  let mockLocalStorage: Storage;

  beforeEach(() => {
    mockLocalStorage = jasmine.createSpyObj('localStorage', ['getItem', 'setItem', 'removeItem']);
    Object.defineProperty(window, 'localStorage', {value: mockLocalStorage});

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate'])},
        {provide: ToastService, useValue: jasmine.createSpyObj('Router', ['show', 'serverError'])},
      ]
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    toast = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => httpTestingController.verify());

  it('should be created', () => {
    service = TestBed.inject(AuthService);
    expect(service).toBeTruthy();
    expect(localStorage.getItem).toHaveBeenCalledWith('authentication');
    expect(service.isAuthenticated).toBeFalse();
    expect(service.authentication).toBeNull();
  });

  it('should load preexisting authentication state', () => {
    const authStatus: Authentication = {email: 'test@example.com', token};
    (mockLocalStorage.getItem as jasmine.Spy).withArgs('authentication').and.returnValue(JSON.stringify(authStatus));
    service = TestBed.inject(AuthService);
    expect(localStorage.getItem).toHaveBeenCalledOnceWith('authentication');
    expect(service.isAuthenticated).toBeTrue();
    expect(service.authentication).toEqual(authStatus);
  });

  it('should sign-in a user given their credentials, if those are correct', () => {
    service = TestBed.inject(AuthService);
    expect(service).toBeTruthy();
    const form: SignInRequest = {email: 'test@test.com', password: 'abracadabra', rememberMe: false};
    service.signIn(form).subscribe(response => expect(response).toEqual({token}));

    httpTestingController.expectOne(`/auth/sign-in`).flush({token});
    const auth = {email: form.email, token};
    expect(localStorage.setItem).toHaveBeenCalledOnceWith('authentication', JSON.stringify(auth));
    expect(service.isAuthenticated).toBeTrue();
    expect(service.authentication).toEqual(auth);
  });

  it('should throw an error when trying to sign-in when a user is already signed-in', () => {
    service = TestBed.inject(AuthService);
    expect(service).toBeTruthy();
    const form = {email: 'test@test.com', password: 'abracadabra', rememberMe: false};
    service.signIn(form).subscribe();
    httpTestingController.expectOne(`/auth/sign-in`).flush(token);
    service.authentication = {email: 'test@test.com', token};

    expect(() => service.signIn(form)).toThrowError('Already signed-in');
  });

  it('should not sign-in a user when their credentials are incorrect', () => {
    service = TestBed.inject(AuthService);
    expect(service).toBeTruthy();
    const form: SignInRequest = {email: 'test@test.com', password: 'abracadabra', rememberMe: false};
    service.signIn(form).subscribe({
      next: () => fail('sign-in request fails'),
      error: (error: HttpErrorResponse) => {
        expect(error.error).toEqual({message: 'could not sign-in'});
        expect(error.status).toBe(400);
        expect(error.statusText).toBe('incorrect credentials');
      }
    });

    const req = httpTestingController.expectOne(`/auth/sign-in`);
    req.flush({message: 'could not sign-in'}, {status: 400, statusText: 'incorrect credentials'});
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(service.isAuthenticated).toBeFalse();
    expect(service.authentication).toBeNull();
  });

  it('should sign-out a user that is authenticated', () => {
    prepareSignIn(service, router, httpTestingController, token);

    httpTestingController.expectOne(`/auth/sign-out`).flush({});

    expect(localStorage.removeItem).toHaveBeenCalledOnceWith('authentication');
    expect(toast.show).toHaveBeenCalledWith(jasmine.objectContaining({body: 'Sign-out successful'}));
    expect(router.navigate).toHaveBeenCalledOnceWith(['/sign-in']);
    expect(service.authentication).toBeNull();
    expect(service.isAuthenticated).toBeFalse();
  });

  it('should sign-out the user anyway when the server returns an error', () => {
    prepareSignIn(service, router, httpTestingController, token);

    const req = httpTestingController.expectOne(`/auth/sign-out`);
    req.flush({message: 'No token found'}, {status: 400, statusText: 'No token found'});
    expect(toast.serverError).toHaveBeenCalledOnceWith('No token found');
    expect(router.navigate).toHaveBeenCalledOnceWith(['/sign-in']);
    expect(service.authentication).toBeNull();
    expect(service.isAuthenticated).toBeFalse();
  });

  it('should throw an error when asked to sign-out a user that is not authenticated first', () => {
    service = TestBed.inject(AuthService);
    expect(service).toBeTruthy();
    expect(() => service.signOut()).toThrowError(`Can't sign-out without being signed-in first`);
  });
});
