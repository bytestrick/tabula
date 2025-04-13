import {TestBed} from '@angular/core/testing';
import {
  HttpClient,
  HttpErrorResponse,
  HttpInterceptorFn,
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import {errorInterceptor} from './error.interceptor';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {ToastService} from '../toast/toast.service';


describe('errorInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => errorInterceptor(req, next));
  let http: HttpClient;
  let httpTestingController: HttpTestingController;
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([interceptor])),
        provideHttpClientTesting(),
        {provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['show'])}
      ]
    });
    http = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    toast = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
  });

  afterEach(() => httpTestingController.verify());

  it('should be created', () => expect(interceptor).toBeTruthy());

  it('should intercept ProgressEvent and show a toast', () => {
    http.get('/something').subscribe({
      next: () => fail('this request fails'),
      error: () => fail('the error is not propagated'),
    });

    const req = httpTestingController.expectOne('/something');
    req.error(new ProgressEvent('timeout'));

    expect(toast.show).toHaveBeenCalledOnceWith({
      title: 'The server is unreachable',
      body: 'It might be our fault.<br>Please check your connection.',
      icon: 'plug-fill',
      background: 'danger'
    });
  });

  it('should let a non ProgressEvent error pass through', () => {
    http.get('/something').subscribe({
      next: () => fail('this request fails'),
      error: (error: HttpErrorResponse) => {
        expect(error.error).not.toBeInstanceOf(ProgressEvent);
        expect(error.error).toEqual({message: 'Not intercepted'});
        expect(error.status).toBe(418);
        expect(error.statusText).toBe(`I'm a teapot`);
      }
    });

    const req = httpTestingController.expectOne('/something');
    req.flush({message: 'Not intercepted'}, {status: 418, statusText: `I'm a teapot`});

    expect(toast.show).not.toHaveBeenCalled();
  });

  it('should not intervene when there is no error', () => {
    const mockResponse = 'From the Greek helios comes the rare adjective heliac (/ˈhiːliæk/).';

    http.get<string>('/something').subscribe({
      next: (response: string) => {
        expect(response).toBe(mockResponse);
      },
      error: () => fail('this request succeeds'),
    });

    const req = httpTestingController.expectOne('/something');
    req.flush(mockResponse);
  })
});
