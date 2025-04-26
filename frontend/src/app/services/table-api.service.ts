import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Pair} from '../model/pair';

export interface ColumnDTO {
  tableId: string,
  dataType?: number,
  columnName?: string,
  columnIndex?: number
}


export interface UpdateColumnIndexDTO {
  tableId: string,
  currentColumnIndex: number,
  newColumnIndex: number
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


export interface RowDTO {
  tableId: string,
  rowIndex: number
}


export interface UpdateRowIndexDTO {
  tableId: string,
  currentRowIndex: number,
  newRowIndex: number
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


  appendNewRow(tableId: string = '' || this.tableId): void {
    const params: HttpParams = new HttpParams().set("table-id", tableId);

    this.httpClient.post('/table/row', {}, { params }).subscribe();
  }


  appendNewColumn(dataType: number, tableId: string = '' || this.tableId): void {
    const newColumn: ColumnDTO = {
      tableId: tableId,
      dataType: dataType
    };

    this.httpClient.post('/table/column', newColumn).subscribe();
  }


  changeColumnDataType(columnIndex: number, newDataType: number, tableId: string = '' || this.tableId): void {
    const column: ColumnDTO = {
      tableId: tableId,
      dataType: newDataType,
      columnIndex: columnIndex
    };

    this.httpClient.post('/table/column-data-type', column).subscribe();
  }


  updateCellValue(rowIndex: number, columnIndex: number, value: string, tableId: string = '' || this.tableId): void {
    const cell: CellDTO = {
      tableId: tableId,
      rowIndex: rowIndex,
      columnIndex: columnIndex,
      value: value
    }

    this.httpClient.post('/table/cell', cell).subscribe();
  }


  deleteRows(rowIndexes: number[], tableId: string = '' || this.tableId): void {
    let rowsToDelete: RowDTO[] = [];

    for (let i of rowIndexes)
      rowsToDelete.push({
        tableId: tableId,
        rowIndex: i
      });

    this.httpClient.delete('/table/row', { body: rowsToDelete }).subscribe();
  }


  deleteColumns(columnsIndexes: number[], tableId: string = '' || this.tableId): void {
    let columnsToDelete: ColumnDTO[] = [];

    for (let j of columnsIndexes)
      columnsToDelete.push({
        tableId: tableId,
        dataType: 1,
        columnIndex: j
      });

    this.httpClient.delete('/table/column', { body: columnsToDelete }).subscribe();
  }


  updateRowsIndexes(rowsIndexes: Pair<number, number>[], tableId: string = '' || this.tableId): void {
    let rowsToUpdate: UpdateRowIndexDTO[] = [];

    for (let p of rowsIndexes)
      rowsToUpdate.push({
        tableId: tableId,
        currentRowIndex: p.first,
        newRowIndex: p.second
      });

    this.httpClient.patch('/table/row', rowsToUpdate).subscribe();
  }


  updateColumnsIndexes(columnsIndexes: Pair<number, number>[], tableId: string = '' || this.tableId): void {
    let columnsToUpdate: UpdateColumnIndexDTO[] = [];

    for (let p of columnsIndexes)
      columnsToUpdate.push({
        tableId: tableId,
        currentColumnIndex: p.first,
        newColumnIndex: p.second
      });

    this.httpClient.patch('/table/column', columnsToUpdate).subscribe();
  }
}
