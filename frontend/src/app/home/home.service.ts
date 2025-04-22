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
      '/table-card/next',
      {params, responseType: 'json'}
    );
  }

  fetchTableCards(quantity: number): Observable<TableCard[]> {
    const params: HttpParams = new HttpParams()
      .set('quantity', quantity);

    return this.http.get<TableCard[]>(
      '/table-card',
      {params, responseType: 'json'}
    );
  }

  createTableCard(tableCard: TableCard): Observable<TableCard> {
    return this.http.post<TableCard>(
      '/table-card',
      tableCard,
      { responseType: 'json' }
    );
  }

  editTableCard(tableCard: TableCard) : Observable<string> {
    return this.http.put<string>(
      '/table-card',
      tableCard,
      { responseType: 'text' as 'json' }
    );
  }


  deleteTableCard(id: string): Observable<string> {
    const params: HttpParams = new HttpParams().set('id', id);

    return this.http.delete<string>(
      '/table-card',
      { params, responseType: 'text' as 'json' }
    );
  }
}
