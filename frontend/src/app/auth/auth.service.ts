import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {ToastService} from '../toast/toast.service';
import {Router} from '@angular/router';

export interface SignInRequest {
  email: string,
  password: string,
  rememberMe: boolean
}

interface AuthenticationResponse {
  token: string;
}

export interface Authentication {
  email: string;
  token: string;
}

/**
 * {@link Injectable} service that manages authentication
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private router = inject(Router);

  private auth: Authentication | null;

  get authentication(): Authentication | null {
    return this.auth;
  }

  constructor() {
    const authenticationRaw = localStorage.getItem('authentication');
    this.auth = authenticationRaw ? JSON.parse(authenticationRaw) : null;
  }

  base64urlToBase64(base64url: string): string {
    let base64 = base64url
      .replace("-", "+")
      .replace("_", "/");

    const padding: number = base64.length % 4;
    if (padding > 0) {
      base64 += '='.repeat(4 - padding);
    }

    return base64;
  }

  get isExpired(): boolean {
    const token = this.authentication?.token.split('.')[1];
    if (!token) return true;

    const payload = JSON.parse(atob(this.base64urlToBase64(token)));
    const exp = payload.exp;
    return new Date(exp * 1000) < new Date();
  }

  get isAuthenticated(): boolean {
    return this.authentication !== null && !this.isExpired;
  }

  signIn(form: SignInRequest): Observable<AuthenticationResponse> {
    if (this.isAuthenticated) {
      throw new Error('Already signed-in');
    }

    return this.http.post<AuthenticationResponse>('/auth/sign-in', form).pipe(
      tap(response => {
        this.auth = {email: form.email, token: response.token};
        localStorage.setItem('authentication', JSON.stringify(this.authentication));
      })
    );
  }

  /**
   * Makes a sign-out request to the server and signs out the client regardless of the response
   */
  signOut() {
    if (this.isAuthenticated) {
      this.http.post('/auth/sign-out', {}).subscribe({
        next: () => this.toast.show({body: 'Sign-out successful', background: 'success'}),
        error: (error: HttpErrorResponse) => this.toast.serverError(error.error?.message)
      });
      this.clientSignOut();
    } else {
      throw new Error(`Can't sign-out without being signed-in first`);
    }
  }

  /**
   * Cleans up the authentication state without making any requests
   */
  clientSignOut() {
    localStorage.removeItem('authentication');
    this.auth = null;
    this.router.navigate(['/sign-in']).then();
  }
}
