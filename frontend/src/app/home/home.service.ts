import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {TableCard} from './table-card/table-card.interface';
import {TableCardComponent} from './table-card/table-card.component';


@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private http: HttpClient) {}


  fetchNextTableCards(id: string, quantity: number): Observable<TableCard[]> {
    const params: HttpParams = new HttpParams()
      .set('quantity', quantity)
      .set('id', id);

    return this.http.get<TableCard[]>(
      '/table/next',
      {params, responseType: 'json'}
    );
  }

  fetchTableCards(quantity: number): Observable<TableCard[]> {
    const params: HttpParams = new HttpParams()
      .set('quantity', quantity);

    return this.http.get<TableCard[]>(
      '/table',
      {params, responseType: 'json'}
    );
  }

  createTableCard(tableCard: TableCard): Observable<TableCard> {
    return this.http.post<TableCard>(
      '/table',
      tableCard,
      { responseType: 'json' }
    );
  }

  editTableCard(tableCard: TableCard) : Observable<string> {
    return this.http.put<string>(
      '/table',
      tableCard,
      { responseType: 'text' as 'json' }
    );
  }


  deleteTableCard(id: string): Observable<string> {
    const params: HttpParams = new HttpParams().set('id', id);

    return this.http.delete<string>(
      '/table',
      { params, responseType: 'text' as 'json' }
    );
  }
}
