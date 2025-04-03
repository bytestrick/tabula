import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Router} from '@angular/router';
import {SignInRequest} from './sign-in/sign-in.component';

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
  private http = inject(HttpClient);

  private currentUserSubject: BehaviorSubject<any>;
  private currentUser: Observable<any>;

  constructor() {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser') || '{}'));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  get currentUserValue() {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return this.currentUserValue !== null;
  }

  signIn(form: SignInRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>('/auth/sign-in', form).pipe(
      tap(response => {
        localStorage.setItem('currentUser', JSON.stringify({email: form.email, token: response.token}));
        this.currentUserSubject.next(response);
      })
    );
  }

  signOut() {
    if (this.isLoggedIn) {
      this.http.post('/auth/sign-out', {}).subscribe(console.log);
    }
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
