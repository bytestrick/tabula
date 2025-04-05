import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {TableCard} from '../home/table-card/table-card.interface';

@Injectable({
  providedIn: 'root'
})
export class NavbarService {

  constructor(private http: HttpClient) {}

  public fuzzySearch(pattern: string): Observable<TableCard[]> {
    const params: HttpParams = new HttpParams()
      .set('pattern', pattern)

    return this.http.get<TableCard[]>(
      '/search',
      { params, responseType: 'json' }
    );
  }
}
