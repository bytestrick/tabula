import {HttpInterceptorFn} from '@angular/common/http';

/**
 * Backend API URL prefix
 */
const BASE_URL = 'http://localhost:8080/api/v1';

/**
 * Interceptor that prepends the backend API URL to the request URL
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('/')) {
    return next(req.clone({
      url: `${BASE_URL}${req.url}`
    }));
  }
  return next(req);
};
