import {TestBed} from '@angular/core/testing';
import {HttpClient, HttpInterceptorFn, provideHttpClient, withInterceptors} from '@angular/common/http';

import {authInterceptor} from './auth.interceptor';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {AuthService} from './auth.service';

describe('authInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => authInterceptor(req, next));
  let http: HttpClient;
  let httpTestingController: HttpTestingController;
  let authStateSpy: jasmine.Spy;

  beforeEach(() => {
    const mockAuthService = jasmine.createSpyObj('AuthService', ['signIn']);
    authStateSpy = jasmine.createSpy('authentication');
    Object.defineProperty(mockAuthService, 'authentication', {get: authStateSpy});

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([interceptor])),
        provideHttpClientTesting(),
        {provide: AuthService, useValue: mockAuthService},
      ]
    });
    http = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('should be created', () => expect(interceptor).toBeTruthy());

  it('should set the Authorization header when the user is authenticated', () => {
    const token = '951fae53-2d9a-46c9-a7ca-39d38b0b54dd';
    authStateSpy.and.returnValue({email: 'test@example.com', token});

    http.get('/something-something').subscribe();

    const req = httpTestingController.expectOne('/something-something');
    req.flush({});
    expect(req.request.headers.has('Authorization')).toBeTrue();
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
  });

  it('should NOT set the Authorization header when the user is not authenticated', () => {
    authStateSpy.and.returnValue(null);

    http.get('/something-something').subscribe();

    const req = httpTestingController.expectOne('/something-something');
    req.flush({});
    expect(req.request.headers.has('Authorization')).toBeFalse();
  })
});
