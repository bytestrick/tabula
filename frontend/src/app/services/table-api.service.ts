import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';

export interface ColumnDTO {
  tableId: string,
  dataType: number,
  columnName: string,
  columnIndex: number
}


export interface TableDTO {
  id: string,
  header: ColumnDTO[],
  content: string[][]
}


export interface CellDTO {
  tableId: string,
  rowIndex: number,
  columnIndex: number,
  value: string
}


@Injectable({
  providedIn: 'root'
})
export class TableApiService {

  private httpClient: HttpClient = inject(HttpClient);
  private _tableId: string = '';


  get tableId(): string {
    return this._tableId;
  }


  getTable(tableId: string): Observable<TableDTO> {
    this._tableId = tableId;
    const params: HttpParams = new HttpParams().set("table-id", tableId);

    return this.httpClient.get<TableDTO>("/table", { params });
  }


  appendNewRow(tableId: string = ''): void {
    const params: HttpParams = new HttpParams().set("table-id", tableId || this.tableId);

    this.httpClient.post('/table/row', {}, { params }).subscribe();
  }


  appendNewColumn(dataType: number, tableId: string = ''): void {
    const newColumn: ColumnDTO = {
      tableId: tableId || this.tableId,
      dataType: dataType,
      columnName: '',
      columnIndex: -1
    };

    this.httpClient.post('/table/column', newColumn).subscribe();
  }


  changeColumnDataType(columnIndex: number, newDataType: number, tableId: string = ''): void {
    const column: ColumnDTO = {
      tableId: tableId || this.tableId,
      dataType: newDataType,
      columnName: '',
      columnIndex: columnIndex
    };

    this.httpClient.post('/table/column-data-type', column).subscribe();
  }


  updateCellValue(rowIndex: number, columnIndex: number, value: string, tableId: string = ''): void {
    const cell: CellDTO = {
      tableId: tableId || this.tableId,
      rowIndex: rowIndex,
      columnIndex: columnIndex,
      value: value
    }

    this.httpClient.post('/table/cell', cell).subscribe();
  }
}
