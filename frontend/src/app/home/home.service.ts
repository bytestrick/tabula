import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {TableCard} from './table-card/table-card.interface';


@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private http = inject(HttpClient);

  fetchNextTableCards(id: string, quantity: number): Observable<TableCard[]> {
    return this.http.get<TableCard[]>('/table/next', {params: {quantity, id}});
  }

  fetchTableCards(quantity: number): Observable<TableCard[]> {
    return this.http.get<TableCard[]>('/table', {params: {quantity}});
  }

  createTableCard(tableCard: TableCard): Observable<TableCard> {
    return this.http.post<TableCard>('/table', tableCard);
  }

  editTableCard(tableCard: TableCard): Observable<string> {
    return this.http.put<string>('/table', tableCard);
  }

  deleteTableCard(id: string): Observable<string> {
    return this.http.delete<string>('/table', {params: {id}});
  }


  currentUserHasTable(tableId: string): Observable<boolean> {
    const params: HttpParams = new HttpParams().set('table-id', tableId);

    return this.http.get<boolean>('/user-table', { params });
  }
}
