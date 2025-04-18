import {HttpInterceptorFn} from '@angular/common/http';
import {backendBaseUrl} from '../constants';

/**
 * Prepend the backend API URL prefix to the request URL.
 *
 * This lets you call `http.post("/some-resource", {}).subscribe({})` instead of having to write
 * `http://.../api/v1/some-resource`.
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('/')) {
    return next(req.clone({
      url: `${backendBaseUrl}${req.url}`
    }));
  }
  return next(req);
};
