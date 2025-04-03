import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService} from './auth.service';

/**
 * Interceptor to add the Authorization header to all requests.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService).authentication;
  if (auth && auth.token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${auth.token}`
      }
    });
  }
  return next(req);
}
