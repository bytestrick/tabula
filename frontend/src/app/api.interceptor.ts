import {HttpInterceptorFn} from '@angular/common/http';
import {backendBaseUrl} from './app.config';

/**
 * Interceptor that prepends the backend API URL to the request URL
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('/')) {
    return next(req.clone({
      url: `${backendBaseUrl}${req.url}`
    }));
  }
  return next(req);
};
