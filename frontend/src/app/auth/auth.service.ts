import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';

/**
 * {@link Injectable} service that manages authentication
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  http = inject(HttpClient);
  router = inject(Router);

  /**
   * Log in the application
   */
  login(email: string, password: string, rememberMe: boolean): Observable<void> {
    return this.http.post<void>(
      '/login',
      {email, password, rememberMe},
      {responseType: 'json', withCredentials: true}
    );
  }

  /**
   * Log out from the app
   */
  logout(): Observable<void> {
    return this.http.post<void>('/logout', {});
  }
}
