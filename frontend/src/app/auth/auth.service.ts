import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  http = inject(HttpClient);

  login(username: string, password: string) {
    this.http.get('/api/login', { withCredentials: true });
  }

  logout() {
    this.http.get('/api/logout', { withCredentials: true });
  }
}
