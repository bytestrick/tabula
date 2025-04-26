import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {TableCard} from '../home/table-card/table-card.interface';

export interface UserInfo {
  name: string,
  surname: string,
  email: string
}

@Injectable({
  providedIn: 'root'
})
export class NavbarService {
  private http = inject(HttpClient);

  fuzzySearch(pattern: string): Observable<TableCard[]> {
    return this.http.get<TableCard[]>('/search', {params: {pattern}});
  }

  retrievesUserInformation(email: string): Observable<UserInfo> {
    return this.http.get<UserInfo>('/user/info', {params: {email}});
  }
}
