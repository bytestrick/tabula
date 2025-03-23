import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from './auth.service';
import {inject} from '@angular/core';

/**
 * A route guard that regulates which parts of the application the user can
 * access based on the authentication state.
 */
export const authGuard: CanActivateFn = (route, state) => {
  if (inject(AuthService).isLoggedIn) {
    return true;
  }
  inject(Router).navigate(['/login'], {queryParams: {returnUrl: state.url}})
    .finally(() => console.warn(`Can't access ${state.url} while not logged in`));
  return false;
};
