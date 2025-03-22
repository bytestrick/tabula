import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {TableCardComponent} from '../home/table-card/table-card.component';

@Injectable({
  providedIn: 'root'
})
export class NavbarService {

  constructor(private httpClient: HttpClient) {}

  public getTableCard(): Observable<TableCardComponent> {
    return this.httpClient.get<TableCardComponent>(`/tableCard`);
    // return this.httpClient.get<TableCardComponent>(`${environment.apiBaseUrl}/tableCard`);
  }
}
