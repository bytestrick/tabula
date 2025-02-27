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
  login(email: string, password: string): Observable<void> {
    return this.http.post<void>(
      `${BASE_URL}/api/login`,
      { email, password },
      {responseType: 'json', withCredentials: true }
    );
  }

  /**
   * Log out from the app
   */
  logout(): Observable<void> {
    return this.http.post<void>(`${BASE_URL}/api/logout`, {});
  }
}
