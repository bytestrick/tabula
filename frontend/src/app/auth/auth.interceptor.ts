import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService} from './auth.service';

/**
 * Interceptor to add the Authorization header to all requests.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const currentUser = inject(AuthService).currentUserValue;
  if (currentUser && currentUser.token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${currentUser.token}`
      }
    });
  }
  return next(req);
}
