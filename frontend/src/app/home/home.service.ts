import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {TableCard} from './table-card/table-card.interface';


@Injectable({
  providedIn: 'root'
})
export class HomeService {

  private readonly BASE_URL: string = '/tables';

  private http = inject(HttpClient);


  fetchNextTableCards(id: string, quantity: number): Observable<TableCard[]> {
    const url: string = `${this.BASE_URL}/after/${id}`;
    return this.http.get<TableCard[]>(url, { params: { quantity } });
  }

  fetchTableCardsFromEnd(quantity: number): Observable<TableCard[]> {
    const url: string = `${this.BASE_URL}/last`;
    return this.http.get<TableCard[]>(url, { params: { quantity } });
  }

  createTableCard(tableCard: TableCard): Observable<TableCard> {
    return this.http.post<TableCard>(this.BASE_URL, tableCard);
  }

  editTableCard(tableCard: TableCard): Observable<string> {
    const url: string = `${this.BASE_URL}/${tableCard.id}`;
    return this.http.put<string>(url, tableCard);
  }

  deleteTableCard(id: string): Observable<string> {
    const url: string = `${this.BASE_URL}/${id}`;
    return this.http.delete<string>(url);
  }
}
