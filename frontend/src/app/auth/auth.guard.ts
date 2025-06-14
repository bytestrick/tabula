import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from './auth.service';
import {inject} from '@angular/core';

/**
 * A route guard that regulates which parts of the application the user can
 * access based on the authentication state.
 */
export const authGuard: CanActivateFn = (_, state) => {
  if (inject(AuthService).isAuthenticated) {
    return true;
  }
  inject(Router).navigate(['/sign-in'], {queryParams: {returnUrl: state.url}})
    .finally(() => console.warn(`Can't access ${state.url} while not signed in`));
  return false;
};
