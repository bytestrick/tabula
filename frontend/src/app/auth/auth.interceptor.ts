import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService} from './auth.service';
import {catchError, throwError} from 'rxjs';
import {ToastService} from '../toast/toast.service';

/**
 * Interceptor to add the Authorization header to all requests.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const auth = inject(AuthService);
  const token = auth.authentication?.token;
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.signOut();
        toast.show({
          title: 'You have been signed out',
          body: 'There was a problem with your authentication, please sign-in again.',
          background: 'danger',
          icon: 'person-x'
        })
      }
      return throwError(() => err);
    })
  );
};
