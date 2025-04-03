import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {SignInRequest} from './sign-in/sign-in.component';
import {ToastService} from '../toast/toast.service';
import {Router} from '@angular/router';

interface AuthenticationResponse {
  token: string;
}

interface Authentication {
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

  authentication: Authentication | null;

  constructor() {
    const authenticationRaw = localStorage.getItem('authentication');
    this.authentication = authenticationRaw ? JSON.parse(authenticationRaw) : null;
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
        this.authentication = {email: form.email, token: response.token}
        localStorage.setItem('authentication', JSON.stringify(this.authentication));
      })
    );
  }

  signOut() {
    if (this.isAuthenticated) {
      this.http.post('/auth/sign-out', {}).subscribe({
        next: () => {
          this.clearAuthentication();
          this.toast.show({body: 'Sign-out successful', background: 'success'});
        },
        error: (error: HttpErrorResponse) => {
          if (error.error?.message.startsWith('No token found')) {
            // this is improbable
            this.toast.show({
              title: 'Invalid sign-out request',
              body: 'Your authentication state was invalid. We signed you out anyway.',
              background: 'warning',
              icon: 'person-x'
            });
            this.clearAuthentication();
          } else {
            this.toast.serverError(error.error?.message);
          }
        }
      });
    } else {
      throw new Error(`Can't sign-out without being signed-in`);
    }
  }

  private clearAuthentication() {
    localStorage.removeItem('authentication');
    this.authentication = null;
    this.router.navigate(['/sign-in']).then();
  }
}
