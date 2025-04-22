import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {DataTypeDTO} from './data-type-registry.service';

export interface ColumnDTO {
  dataType: number,
  columnName: string
}


export interface TableDTO {
  id: string,
  header: ColumnDTO[],
  content: string[][]
}

@Injectable({
  providedIn: 'root'
})
export class TableApiService {

  private httpClient: HttpClient = inject(HttpClient);


  getTable(tableId: string): Observable<TableDTO> {
    const params: HttpParams = new HttpParams().set("table-id", tableId);

    return this.httpClient.get<TableDTO>("/table", { params });
  }
}
