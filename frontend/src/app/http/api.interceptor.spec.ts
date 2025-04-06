import {TestBed} from '@angular/core/testing';
import {HttpClient, HttpInterceptorFn, provideHttpClient, withInterceptors} from '@angular/common/http';

import {apiInterceptor} from './api.interceptor';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {backendBaseUrl} from '../constants';

describe('apiInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => apiInterceptor(req, next));
  let http: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([interceptor])),
        provideHttpClientTesting(),
      ]
    });
    http = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('should be created', () => expect(interceptor).toBeTruthy());

  it('should prepend the API URL prefix to the URL to request that use a relative path starting with /', () => {
    http.get('/some/path').subscribe();

    const req = httpTestingController.expectOne(`${backendBaseUrl}/some/path`);
    req.flush({});
    expect(req.request.url).toBe(`${backendBaseUrl}/some/path`);
  })

  it('should not intervene on requests that use an absolute path', () => {
    const url = 'https://api.example.com/v1/some/path';
    http.get(url).subscribe();

    const req = httpTestingController.expectOne(url);
    req.flush({});
    expect(req.request.url).toBe(url);
  })
});
