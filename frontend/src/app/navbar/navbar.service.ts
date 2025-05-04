import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {TableCard} from '../home/table-card/table-card.interface';
import {Country} from '../auth/sign-up/country-select.component';

export interface UserDetails {
  name: string,
  surname: string,
  email: string
  country?: Country
}

@Injectable({
  providedIn: 'root'
})
export class NavbarService {
  private http = inject(HttpClient);

  fuzzySearch(pattern: string): Observable<TableCard[]> {
    return this.http.get<TableCard[]>('/search', {params: {pattern}});
  }

  retrievesUserInformation(email: string): Observable<UserDetails> {
    return this.http.get<UserDetails>('/user', {params: {email}});
  }
}
