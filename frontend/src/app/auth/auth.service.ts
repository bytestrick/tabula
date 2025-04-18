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

  get isAuthenticated(): boolean {
    return this.authentication !== null;
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

  signOut() {
    if (this.isAuthenticated) {
      this.http.post('/auth/sign-out', {}).subscribe({
        next: () => this.toast.show({body: 'Sign-out successful', background: 'success'}),
        error: (error: HttpErrorResponse) => this.toast.serverError(error.error?.message)
      });
      localStorage.removeItem('authentication');
      this.auth = null;
      this.router.navigate(['/sign-in']).then();
    } else {
      throw new Error(`Can't sign-out without being signed-in first`);
    }
  }
}
