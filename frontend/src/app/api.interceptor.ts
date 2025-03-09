import {HttpInterceptorFn} from '@angular/common/http';

/**
 * Backend API URL prefix
 */
const BASE_URL = 'http://localhost:8080';

/**
 * Interceptor that prepends the backend API URL to the request URL
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('/api')) {
    return next(req.clone({
      url: `${BASE_URL}${req.url}`
    }));
  }
  return next(req);
};
