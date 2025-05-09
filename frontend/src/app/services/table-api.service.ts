import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Pair} from '../model/pair';
import {TableDTO} from '../model/dto/table/table-dto';
import {RowCreatedDTO, RowCreateDTO, RowsDeletedDTO, RowsDeleteDTO,} from '../model/dto/table/row-dto';
import {
  ColumnCreatedDTO,
  ColumnCreateDTO,
  ColumnPatchDTO,
  ColumnPatchedDTO,
  ColumnsDeletedDTO,
  ColumnsDeleteDTO,
} from '../model/dto/table/column-dto';
import {CellPatchDTO, CellPatchedDTO} from '../model/dto/table/cell-dto';
import {MovedRowsOrColumnsDTO, MoveRowOrColumnDto} from '../model/dto/table/move-row-or-column-dto';


@Injectable({
  providedIn: 'root'
})
/**
 * Service for interacting with table-related REST endpoints.
 *
 * Provides CRUD operations for tables, rows, columns, and cells,
 * communicating with a Spring Boot backend using DAO pattern.
 */
export class TableApiService {

  private readonly BASE_URL: string = "/tables";

  private httpClient: HttpClient = inject(HttpClient);
  private _tableId: string = '';


  /**
   * Current table UUID used by default in operations when tableId is omitted.
   * @property tableId
   */
  get tableId(): string {
    return this._tableId;
  }


  /**
   * Retrieves the full table structure (columns and rows) from the backend.
   * Stores the last-used tableId for subsequent operations.
   *
   * @param tableId
   *   UUID of the table to fetch.
   * @returns
   *   Observable emitting a {@link TableDTO} with `header` and `content`.
   */
  getTable(tableId: string): Observable<TableDTO> {
    this._tableId = tableId;
    const url: string = `${this.BASE_URL}/${tableId}/content`;

    return this.httpClient.get<TableDTO>(url);
  }


  /**
   * Creates a new row in the specified table.
   *
   * @param rowIndex - Zero-based position to insert the new row; null appends at end.
   * @param tableId - UUID of target table; defaults to current tableId.
   * @returns Observable emitting {@link RowCreatedDTO}.
   */
  addNewRow(rowIndex: number | null,
            tableId: string = this.tableId): Observable<RowCreatedDTO> {

    const row: RowCreateDTO = {
      rowIndex: rowIndex
    }

    const url: string = `${this.BASE_URL}/${tableId}/content/rows`;
    return this.httpClient.post<RowCreatedDTO>(url, row);
  }


  /**
   * Creates a new column in the specified table.
   *
   * @param dataTypeId - Numeric code (≥ 0) for the new column's data type.
   * @param columnIndex - Zero-based position to insert; null appends at end.
   * @param tableId - UUID of target table; defaults to current tableId.
   * @returns Observable emitting {@link ColumnCreatedDTO}.
   */
  addNewColumn(dataTypeId: number,
               columnIndex: number | null,
               tableId: string = this.tableId): Observable<ColumnCreatedDTO> {

    const newColumn: ColumnCreateDTO = {
      dataTypeId: dataTypeId,
      columnIndex: columnIndex
    };

    const url = `${this.BASE_URL}/${tableId}/content/columns`;
    return this.httpClient.post<ColumnCreatedDTO>(url, newColumn);
  }


  /**
   * Updates an existing column's data type.
   *
   * @param columnId - UUID of column to update.
   * @param newDataTypeId - New data type code (≥ 0) for the column.
   * @param tableId - UUID of parent table; defaults to current tableId.
   * @returns Observable emitting {@link ColumnPatchedDTO}.
   */
  changeColumnDataType(columnId: string,
                       newDataTypeId: number,
                       tableId: string = this.tableId): Observable<ColumnPatchedDTO> {

    const column: ColumnPatchDTO = {
      dataTypeId: newDataTypeId,
    };

    const url: string = `${this.BASE_URL}/${tableId}/content/columns/${columnId}`;
    return this.httpClient.patch<ColumnPatchedDTO>(url, column);
  }


  /**
   * Renames an existing column.
   *
   * @param columnId - UUID of the column to rename.
   * @param newName - New name for the column.
   * @param tableId - UUID of parent table; defaults to current tableId.
   * @returns Observable emitting {@link ColumnPatchedDTO}.
   */
  changeColumnName(columnId: string,
                   newName: string,
                   tableId: string = this.tableId): Observable<ColumnPatchedDTO> {

    const column: ColumnPatchDTO = {
      columnName: newName,
    };

    const url: string = `${this.BASE_URL}/${tableId}/content/columns/${columnId}`;
    return this.httpClient.patch<ColumnPatchedDTO>(url, column);
  }


  /**
   * Updates multiple cell values.
   *
   * @param idsValues - Array of Pair<Pair<rowId, columnId>, newValue>.
   * @param dataTypeId - Numeric code for the cell data type.
   * @param tableId - UUID of target table; defaults to current tableId.
   * @returns Observable emitting array of {@link CellPatchedDTO}.
   */
  updateCellsValue(idsValues: Pair<Pair<string | undefined, string | undefined>, string>[],
                   dataTypeId: number,
                   tableId: string = '' || this.tableId): Observable<CellPatchedDTO[]> {

    const cellsToUpdate: CellPatchDTO[] = [];

    for (let p of idsValues) {
      cellsToUpdate.push({
        rowId: p.first.first,
        columnId: p.first.second,
        dataTypeId: dataTypeId,
        newValue: p.second
      });
    }

    const url: string = `${this.BASE_URL}/${tableId}/content/cells`;
    return this.httpClient.patch<CellPatchedDTO[]>(url, cellsToUpdate);
  }


  /**
   * Deletes rows from the specified table.
   *
   * @param rowsIds - UUIDs of rows to delete.
   * @param tableId - UUID of parent table; defaults to current tableId.
   * @returns Observable emitting {@link RowsDeletedDTO}.
   */
  deleteRows(rowsIds: string[], tableId: string = this.tableId): Observable<RowsDeletedDTO> {
    const url = `${this.BASE_URL}/${tableId}/content/rows`;
    const rowsDeleteDTO: RowsDeleteDTO = {ids: rowsIds};
    return this.httpClient.delete<RowsDeletedDTO>(url, {body: rowsDeleteDTO});
  }


  /**
   * Deletes columns from the specified table.
   *
   * @param columnsIds - UUIDs of columns to delete.
   * @param tableId - UUID of parent table; defaults to current tableId.
   * @returns Observable emitting {@link ColumnsDeletedDTO}.
   */
  deleteColumns(columnsIds: string[], tableId: string = this.tableId): Observable<ColumnsDeletedDTO> {
    const url = `${this.BASE_URL}/${tableId}/content/columns`;
    const columnsDeleteDTO: ColumnsDeleteDTO = {ids: columnsIds};
    return this.httpClient.delete<ColumnsDeletedDTO>(url, {body: columnsDeleteDTO});
  }


  /**
   * Moves rows within the specified table.
   *
   * @param idsToMove - UUIDs of rows to move.
   * @param fromIndex - Starting zero-based index.
   * @param toIndex - Destination zero-based index.
   * @param tableId - UUID of parent table; defaults to current tableId.
   * @returns Observable emitting {@link MovedRowsOrColumnsDTO}.
   */
  moveRowsIndexes(idsToMove: string[],
                  fromIndex: number,
                  toIndex: number,
                  tableId: string = this.tableId): Observable<MovedRowsOrColumnsDTO> {

    let rowsToMove: MoveRowOrColumnDto = {
      idsToMove: idsToMove,
      fromIndex: fromIndex,
      toIndex: toIndex
    };

    const url: string = `${this.BASE_URL}/${tableId}/content/rows`;
    return this.httpClient.patch<MovedRowsOrColumnsDTO>(url, rowsToMove);
  }


  /**
   * Moves columns within the specified table.
   *
   * @param idsToMove - UUIDs of columns to move.
   * @param fromIndex - Starting zero-based index.
   * @param toIndex - Destination zero-based index.
   * @param tableId - UUID of parent table; defaults to current tableId.
   * @returns Observable emitting {@link MovedRowsOrColumnsDTO}.
   */
  moveColumnsIndexes(idsToMove: string[],
                     fromIndex: number,
                     toIndex: number,
                     tableId: string = this.tableId): Observable<MovedRowsOrColumnsDTO> {

    let ColumnsToMove: MoveRowOrColumnDto = {
      idsToMove: idsToMove,
      fromIndex: fromIndex,
      toIndex: toIndex
    };

    const url: string = `${this.BASE_URL}/${tableId}/content/columns`;
    return this.httpClient.patch<MovedRowsOrColumnsDTO>(url, ColumnsToMove);
  }
}
