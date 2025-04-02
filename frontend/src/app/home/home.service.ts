import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {TableCard} from './table-card/table-card.interface';
import {TableCardComponent} from './table-card/table-card.component';


@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private http: HttpClient) {}

  public loadTableCard(page: number, size: number): Observable<TableCard[]> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + ''
    });

    const params: HttpParams = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<TableCard[]>(
      '/table-card',
      { params, responseType: 'json' }
    );
  }

  public createTableCard(title: string, description: string): Observable<TableCard> {
    return this.http.post<TableCard>(
      '/table-card',
      {
        title: title,
        description: description
      },
      {responseType: 'json'}
    );
  }

  public editTableCard(tableCardComponent: TableCardComponent) : Observable<string> {
    return this.http.put<string>(
      '/table-card',
      {
        id: tableCardComponent.getId(),
        title: tableCardComponent.getTitle(),
        description: tableCardComponent.getDescription(),
      },
      { responseType: 'text' as 'json' }
    );
  }


  public deleteTableCard(id: string): Observable<string> {
    const params: HttpParams = new HttpParams().set('id', id);

    return this.http.delete<string>(
      '/table-card',
      { params, responseType: 'text' as 'json' }
    );
  }
}
