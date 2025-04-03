import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import {ToastService} from './toast/toast.service';
import {inject} from '@angular/core';

/**
 * Handle errors common to all {@link HttpClient}s
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toasts = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.error instanceof ErrorEvent || error.error instanceof ProgressEvent) {
        toasts.show({
          title: 'The server is unreachable',
          body: 'It might be our fault.<br>Please check your connection.',
          icon: 'plug-fill',
          background: 'danger'
        });
        return new Observable<never>();
      }
      return throwError(() => error); // propagate the error to the consumer
    })
  );
};
