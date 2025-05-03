import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Pair} from '../model/pair';
import {TableDTO} from '../model/dto/table/table-dto';
import {
  RowCreatedDTO,
  RowCreateDTO,
  RowsDeletedDTO,
  RowsDeleteDTO,
  UpdateRowIndexDTO
} from '../model/dto/table/row-dto';
import {
  ColumnCreatedDTO,
  ColumnCreateDTO,
  ColumnDTO,
  ColumnPatchDTO, ColumnsDeletedDTO, ColumnsDeleteDTO,
  UpdateColumnIndexDTO
} from '../model/dto/table/column-dto';
import {CellDTO, CellPatchDTO, CellPatchedDTO} from '../model/dto/table/cell-dto';


@Injectable({
  providedIn: 'root'
})
export class TableApiService {

  private readonly BASE_URL: string = "/tables";

  private httpClient: HttpClient = inject(HttpClient);
  private _tableId: string = '';


  get tableId(): string {
    return this._tableId;
  }


  /**
   * Retrieves the full table structure (columns and rows) from the backend.
   * This method also stores the last-used tableId in the service for default use
   * in subsequent row/column operations.
   *
   * @param tableId   UUID of the table to fetch.
   * @returns         An Observable that emits a {@link TableDTO} containing
   *                   the table’s header (header columns) and content (rows).
   *
   * @remarks
   * - The `tableId` is sent as a query parameter (`?table-id=<UUID>`) per backend contract.
   * - Upon successful retrieval, the service’s internal `_tableId` field is updated,
   *   allowing other methods to default to this table without needing to pass `tableId` again.
   *
   * @example
   * // Fetch table and subscribe to its data
   * tableService.getTable('f47ac10b-58cc-4372-a567-0e02b2c3d479')
   *   .subscribe(table => {
   *     console.log('Columns:', table.header);
   *     console.log('Rows:', table.content);
   *   });
   */
  getTable(tableId: string): Observable<TableDTO> {
    this._tableId = tableId;
    const url: string = `${this.BASE_URL}/${tableId}`;

    return this.httpClient.get<TableDTO>(url);
  }


  /**
   * Sends a POST request to `/tables/{tableId}/rows` to create
   * a new row in the specified table
   *
   * @param rowIndex   Zero-based position at which to insert the new row.
   *                   Pass `null` to append the row at the end of the table.
   * @param tableId    UUID of the table in which to create the row.
   *                   Defaults to the service’s current `tableId` if not provided.
   * @returns          An Observable that emits the created row’s details
   *                   ({@link CreatedRowDTO}) once the backend responds
   *                   with HTTP 201 Created.
   *
   * @example
   * // Append a new row at the end:
   * service.addNewRow(null).subscribe(created => {
   *   console.log(`New row inserted at index ${created.rowIndex}`);
   * });
   *
   * @example
   * // Insert a new row at position 3 in a specific table:
   * const targetTable = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
   * service.addNewRow(3, targetTable).subscribe(created => {
   *   console.log(`Created row ID: ${created.id}`);
   * });
   */
  addNewRow(rowIndex: number | null,
            tableId: string = this.tableId): Observable<RowCreatedDTO> {

    const row: RowCreateDTO = {
      rowIndex: rowIndex
    }

    const url: string = `${this.BASE_URL}/${tableId}/rows`;
    return this.httpClient.post<RowCreatedDTO>(url, row);
  }


  /**
   * Sends a POST request to `/tables/{tableId}/columns` to create
   * a new column in the specified table
   *
   * @param dataTypeId    Numeric code identifying the column’s data type; must be ≥ 0.
   * @param columnIndex   Zero-based position at which to insert the new column.
   *                      Pass `null` to append the column at the end.
   * @param tableId       UUID of the table in which to create the column.
   *                      Defaults to the service’s current `tableId` if not provided.
   * @returns             An Observable that emits the created column’s details
   *                     ({@link ColumnCreatedDTO}) once the backend
   *                     responds with HTTP 201 Created.
   *
   * @example
   * // Append a new Textual column at the end:
   * const dataTypeId: number = textualDataType.getDataTypeId();
   *
   * service.addNewColumn(dataTypeId, null).subscribe(created => {
   *   console.log(`New column inserted at index ${created.columnIndex}`);
   * });
   *
   * @example
   * // Insert a new column at position 1 in a specific table:
   * const targetTable = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
   * const dataTypeId: number = textualDataType.getDataTypeId();
   * service.addNewColumn(dataTypeId, 1, targetTable).subscribe(created => {
   *   console.log(`Created column ID: ${created.id}`);
   * });
   */
  addNewColumn(dataTypeId: number,
               columnIndex: number | null,
               tableId: string = this.tableId): Observable<ColumnCreatedDTO> {

    const newColumn: ColumnCreateDTO = {
      dataTypeId: dataTypeId,
      columnIndex: columnIndex
    };

    const url = `${this.BASE_URL}/${tableId}/columns`;
    return this.httpClient.post<ColumnCreatedDTO>(url, newColumn);
  }


  /**
   * Updates the data-type of an existing column on the backend.
   *
   * Sends a PATCH request to `/tables/{tableId}/columns/{columnId}` with a payload
   * containing only the `dataTypeId` field. Other column attributes remain unchanged.
   *
   * @param columnId      UUID of the column to update.
   * @param newDataTypeId Numeric code identifying the new data type; must be ≥ 0.
   * @param tableId       UUID of the table containing the column.
   *                      Defaults to the service’s current `tableId` if not provided.
   *
   * @returns             Observable that completes when the operation is done.
   */
  changeColumnDataType(columnId: string,
                       newDataTypeId: number,
                       tableId: string = this.tableId): Observable<void> {

    const column: ColumnPatchDTO = {
      dataTypeId: newDataTypeId,
    };

    const url: string = `${this.BASE_URL}/${tableId}/columns/${columnId}`;
    return this.httpClient.patch<void>(url, column);
  }


  /**
   * Updates the value of a specific cell in the current table.
   *
   * Sends a PATCH request to `/tables/{tableId}/cells/{rowIndex}/{columnIndex}` with
   * a payload containing the new cell value. Other cell properties remain unchanged.
   *
   * @param rowIndex    Zero-based index of the row containing the target cell.
   * @param columnIndex Zero-based index of the column containing the target cell.
   * @param value       New value to set for the cell; an empty string clears the cell.
   * @param tableId     UUID of the table containing the cell.
   *                    Defaults to the service’s current `tableId` if not provided.
   *
   * @returns           Observable that completes when the operation is done.
   *
   * @example
   * // Update the cell at row 2, column 3 to "Hello":
   * tableService.updateCellValue(2, 3, 'Hello');
   */
  updateCellValue(rowIndex: number,
                  columnIndex: number,
                  value: string,
                  tableId: string = '' || this.tableId): Observable<CellPatchedDTO> {

    const cell: CellPatchDTO = {
      value: value
    }

    const url: string = `${this.BASE_URL}/${tableId}/cells/${rowIndex}/${columnIndex}`;
    return this.httpClient.patch<CellPatchedDTO>(url, cell);
  }


  /**
   * Deletes one or more rows from the specified table.
   *
   * Sends a DELETE request to `/tables/{tableId}/rows` with a request body containing a JSON object of row UUIDs.
   * On success, returns an Observable emitting a DTO with the array of deleted row indexes,
   * allowing the client to update its view accordingly.
   *
   * @param rowsIds - Array of UUID strings identifying the rows to delete.
   * @param tableId - UUID of the table from which to delete rows.
   *                  Defaults to the service’s current `tableId` if not provided.
   * @returns       Observable emitting a {@link RowsDeletedDTO} containing the list of deleted indexes.
   *
   * @example
   * // Delete rows ['r1', 'r2', 'r3'] in the current table
   * service.deleteRows(['r1', 'r2', 'r3']).subscribe(response => {
   *   console.log(response.indexes); // e.g. [0, 2, 5]
   * });
   *
   * @example
   * // Delete a single row in a specific table
   * service.deleteRows(['r4'], 'f47ac10b-58cc-4372-a567-0e02b2c3d479')
   *        .subscribe(response => console.log(response.indexes));
   */
  deleteRows(rowsIds: string[], tableId: string = this.tableId): Observable<RowsDeletedDTO> {
    const url = `${this.BASE_URL}/${tableId}/rows`;
    const rowsDeleteDTO: RowsDeleteDTO = { ids: rowsIds };
    return this.httpClient.delete<RowsDeletedDTO>(url, { body: rowsDeleteDTO });
  }


  /**
   * Deletes one or more columns from the specified table.
   *
   * Sends a DELETE request to `/tables/{tableId}/columns` with a request body containing a JSON object of column UUIDs.
   * On success, returns an Observable emitting a DTO with the array of deleted column indexes,
   * allowing the client to update its view accordingly.
   *
   * @param columnsIds - Array of UUID strings identifying the columns to delete.
   * @param tableId    - UUID of the table from which to delete columns.
   *                     Defaults to the service’s current `tableId` if not provided.
   * @returns          Observable emitting a {@link ColumnsDeletedDTO} containing the list of deleted indexes.
   *
   * @example
   * // Delete columns ['c1', 'c2'] in the current table
   * service.deleteColumns(['c1', 'c2']).subscribe(response => {
   *   console.log(response.indexes); // e.g. [1, 3]
   * });
   *
   * @example
   * // Delete a single column in a specific table
   * service.deleteColumns(['c3'], '9f16b9c2-3e47-4d3a-8f0c-123456789abc')
   *        .subscribe(response => console.log(response.indexes));
   */
  deleteColumns(columnsIds: string[], tableId: string = this.tableId): Observable<ColumnsDeletedDTO> {
    const url = `${this.BASE_URL}/${tableId}/columns`;
    const columnsDeleteDTO: ColumnsDeleteDTO = { ids: columnsIds };
    return this.httpClient.delete<ColumnsDeletedDTO>(url, { body: columnsDeleteDTO });
  }


  updateRowsIndexes(rowsIndexes: Pair<number, number>[], tableId: string = this.tableId): void {
    let rowsToUpdate: UpdateRowIndexDTO[] = [];

    for (let p of rowsIndexes)
      rowsToUpdate.push({
        tableId: tableId,
        currentRowIndex: p.first,
        newRowIndex: p.second
      });

    this.httpClient.patch('/table/rows', rowsToUpdate).subscribe();
  }


  updateColumnsIndexes(columnsIndexes: Pair<number, number>[], tableId: string = this.tableId): void {
    let columnsToUpdate: UpdateColumnIndexDTO[] = [];

    for (let p of columnsIndexes)
      columnsToUpdate.push({
        tableId: tableId,
        currentColumnIndex: p.first,
        newColumnIndex: p.second
      });

    this.httpClient.patch('/table/columns', columnsToUpdate).subscribe();
  }
}
