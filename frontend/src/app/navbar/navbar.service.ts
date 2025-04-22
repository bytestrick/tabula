import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
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

  constructor(private http: HttpClient) {}


  fuzzySearch(pattern: string): Observable<TableCard[]> {
    const params: HttpParams = new HttpParams()
      .set('pattern', pattern)

    return this.http.get<TableCard[]>(
      '/search',
      { params, responseType: 'json' }
    );
  }

  retrievesUserInformation(email: string): Observable<UserInfo> {
    const params: HttpParams = new HttpParams()
      .set('email', email)

    return this.http.get<UserInfo>(
      '/api/user/info',
      { params, responseType: 'json' }
    );
  }
}
