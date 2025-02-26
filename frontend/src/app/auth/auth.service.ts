import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from '../app.config';
import { Router } from '@angular/router';

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
  login(username: string, password: string): Observable<void> {
    return this.http.post<void>(
      `${BASE_URL}/api/login`,
      { username, password },
      // { withCredentials: true }
      { responseType: 'json' }
    );
  }

  /**
   * Log out from the app
   */
  logout(): Observable<void> {
    return this.http.post<void>(`/api/logout`, {}, { withCredentials: true });
  }
}
