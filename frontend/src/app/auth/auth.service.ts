import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Router} from '@angular/router';

interface AuthenticationResponse {
  token: string;
}

/**
 * {@link Injectable} service that manages authentication
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  http = inject(HttpClient);
  router = inject(Router);

  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor() {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser') || 'null'));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  public get isLoggedIn(): boolean {
    return this.currentUserValue !== null;
  }

  /**
   * Log in the application
   */
  login(email: string, password: string, rememberMe: boolean): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(
      '/auth/login',
      {email, password, rememberMe},
      {withCredentials: true}
    ).pipe(
      tap(response => {
        localStorage.setItem('currentUser', JSON.stringify({email, token: response.token}));
        this.currentUserSubject.next(response);
      })
    );
  }

  /**
   * Log out from the app
   */
  logout() {
    if (this.isLoggedIn) {
      this.http.post('/auth/logout', {}).subscribe(console.log);
    }
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
