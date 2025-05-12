import {inject, Injectable} from '@angular/core';
import {Cell} from '../model/table/cell';
import {HeaderCell} from '../model/table/header-cell';
import {IDataType} from '../model/data-types/i-data-type';
import {moveItemInArray} from '@angular/cdk/drag-drop';
import {CellCord} from '../model/table/cell-cord';
import {TableApiService} from './table-api.service';
import {DataTypeRegistryService} from './data-type-registry.service';
import {Pair} from '../model/pair';
import {Row} from '../model/table/row';
import {HeaderColumn} from '../model/table/headerColumn';
import {TableDTO} from '../model/dto/table/table-dto';
import {CellPatchedDTO} from '../model/dto/table/cell-dto';
import {Selection} from '../model/table/selection';
import {ColumnPatchedDTO} from '../model/dto/table/column-dto';
import {MovedRowsOrColumnsDTO} from '../model/dto/table/move-row-or-column-dto';


@Injectable()
export class TableService {
  private dataTypeService: DataTypeRegistryService = inject(DataTypeRegistryService);
  private tableAPI: TableApiService = inject(TableApiService);

  private table: Row[] = [];
  private header: HeaderColumn[] = [];

  private selectedRows: Selection = new Selection();
  private selectedColumns: Selection = new Selection();

  private _isLoaded: boolean = false;

  private readonly HEADER_CELL_DEFAULT_NAME: string = 'New Column';
  private readonly DEFAULT_DATA_TYPE_ID: number = 1;

  readonly INVALID_CELL_INDEX: number = -2; // Must be a negative number

  /**
   * Appends a new column to the current table.
   *
   * Sends a request to the backend to create a new column with the given data-type.
   * Once created, it adds the new header column to the header and appends a new empty cell
   * to each existing row to maintain consistency.
   *
   * @param dataType - The data-type to be assigned to the new column.
   */
  appendNewColumn(dataType: IDataType): void {
    this.tableAPI.addNewColumn(dataType.getDataTypeId(), null).subscribe(
      createdColumn => {
        const newHeaderCell: HeaderCell = new HeaderCell(this.HEADER_CELL_DEFAULT_NAME, dataType);
        const newHeaderColumn: HeaderColumn = new HeaderColumn(createdColumn.id, newHeaderCell);

        this.header.push(newHeaderColumn);

        // Adds new cells to rows already present
        for (let i: number = 0; i < this.getRowsNumber(); ++i) {
          while (this.table[i].getLength() < this.getColumnsNumber()) {
            const currentDataType: IDataType = this.getColumnDataType(this.table[i].getLength());
            this.table[i].appendNewCell(currentDataType.getNewDataType());
          }
        }
      }
    );
  }

  /**
   * Retrieves the data-type of a column at the specified index.
   *
   * @param columnIndex The index of the column.
   * @returns The data-type of the column.
   */
  private getColumnDataType(columnIndex: number): IDataType {
    return this.header[columnIndex].getColumnDataType();
  }

  /**
   * Appends a new row to the current table.
   *
   * Sends a request to the backend to create a new row. Once created, a new row
   * is appended to the local table structure and initialized with empty cells for each column,
   * according to their respective data-types.
   */
  addNewRow(): void {
    this.tableAPI.addNewRow(null).subscribe(
      createdRow => {
        this.table.push(new Row(createdRow.id));
        const lastRowI: number = this.getRowsNumber() - 1;

        for (let i: number = 0; i < this.getColumnsNumber(); ++i) {
          this.table[lastRowI].appendNewCell(this.getColumnDataType(i).getNewDataType());
        }
      }
    );
  }

  getRowsNumber(): number {
    return this.table.length;
  }

  getColumnsNumber(): number {
    return this.header.length;
  }

  getHeadersColumns(): HeaderColumn[] {
    return this.header;
  }

  /**
   * Inserts a new row at the specified index in the table.
   *
   * @param rowIndex - Zero-based index at which to insert the new row.
   */
  insertNewRowAt(rowIndex: number): void {
    if (rowIndex < 0 || rowIndex >= this.getRowsNumber())
      return;

    this.tableAPI.addNewRow(rowIndex).subscribe(
      createdRow => {
        this.table.splice(rowIndex, 0, new Row(createdRow.id));

        for (let j: number = 0; j < this.getColumnsNumber(); ++j)
          this.table[rowIndex].appendNewCell(this.getColumnDataType(j).getNewDataType());
      }
    );
  }

  /**
   * Inserts a new column at the specified index in the table.
   *
   * @param columnIndex - Zero-based index at which to insert the new column.
   * @param dataType - The data-type to be assigned to the new column.
   */
  insertNewColumnAt(columnIndex: number, dataType: IDataType): void {
    if (columnIndex < 0 && columnIndex >= this.getColumnsNumber())
      return;

    this.tableAPI.addNewColumn(dataType.getDataTypeId(), columnIndex).subscribe(
      createdColumn => {
        this.header.splice(columnIndex, 0, new HeaderColumn(createdColumn.id, new HeaderCell(this.HEADER_CELL_DEFAULT_NAME, dataType)));

        for (let i: number = 0; i < this.getRowsNumber(); ++i) {
          this.table[i].insertNewCellAt(columnIndex, this.getColumnDataType(columnIndex).getNewDataType());
        }
      }
    );
  }


  getRows(): Row[] {
    return this.table;
  }

  /**
   * Moves a single row from one position to another within the table.
   *
   * @param fromIndex - The zero-based index of the row to move.
   * @param toIndex - The zero-based target index where the row should be placed.
   */
  private _moveRow(fromIndex: number, toIndex: number): void {
    moveItemInArray(this.table, fromIndex, toIndex);
  }

  /**
   * Moves one or more rows from one position to another.
   *
   * Sends a PATCH request via TableApiService to persist the new row order.
   * Upon receiving the backend’s MovedRowsOrColumnsDTO, shifts each affected row
   * in the local model by the returned delta.
   *
   * @param fromIndex
   *   Zero-based index of the row used as the reference for movement.
   * @param toIndex
   *   Zero-based target index where the rows should end up.
   */
  moveRows(fromIndex: number, toIndex: number): void {
    if (!this.canMoveRow(fromIndex, toIndex))
      return;

    let rowsIdsToMove: string[];
    let fromIndexId: string = this.getRowId(fromIndex);

    if (!this.selectedRows.isSelected(fromIndexId))
      rowsIdsToMove = [fromIndexId];
    else
      rowsIdsToMove = this.selectedRows.getSelectedIds();

    this.tableAPI.moveRowsIndexes(rowsIdsToMove, fromIndex, toIndex).subscribe(
      (moveIndexes: MovedRowsOrColumnsDTO): void => {
        for (let i of moveIndexes.indexes)
          this._moveRow(i, i + moveIndexes.delta);
      }
    );
  }

  private canMoveColumn(fromIndex: number, toIndex: number): boolean {
    if (fromIndex < 0 || fromIndex >= this.getColumnsNumber())
      return false;

    if (toIndex < 0 || toIndex >= this.getColumnsNumber())
      return false;

    return fromIndex !== toIndex;
  }

  private canMoveRow(fromIndex: number, toIndex: number): boolean {
    if (fromIndex < 0 || fromIndex >= this.getRowsNumber())
      return false;

    if (toIndex < 0 || toIndex >= this.getRowsNumber())
      return false;

    return fromIndex !== toIndex;
  }

  /**
   * Moves a single column from one position to another within the table.
   *
   * @param fromIndex - The zero-based index of the column to move.
   * @param toIndex - The zero-based target index where the column should be placed.
   */
  private _moveColumn(fromIndex: number, toIndex: number): void {
    for (let row of this.table)
      moveItemInArray(row.getCells(), fromIndex, toIndex);

    moveItemInArray(this.header, fromIndex, toIndex);
  }

  /**
   * Moves one or more columns from one position to another.
   *
   * Sends a PATCH request via TableApiService to persist the new column order.
   * Upon receiving the backend’s MovedRowsOrColumnsDTO, shifts each affected column
   * in the local model by the returned delta.
   *
   * @param fromIndex
   *   Zero-based index of the column used as the reference for movement.
   * @param toIndex
   *   Zero-based target index where the columns should end up.
   */
  moveColumns(fromIndex: number, toIndex: number): void {
    if (!this.canMoveColumn(fromIndex, toIndex))
      return;

    let columnsIdsToMove: string[];
    let fromIndexId: string = this.getHeaderColumnId(fromIndex);

    if (!this.selectedColumns.isSelected(fromIndexId))
      columnsIdsToMove = [fromIndexId];
    else
      columnsIdsToMove = this.selectedColumns.getSelectedIds();

    this.tableAPI.moveColumnsIndexes(columnsIdsToMove, fromIndex, toIndex).subscribe(
      (moveIndexes: MovedRowsOrColumnsDTO): void => {
        for (let i of moveIndexes.indexes)
          this._moveColumn(i, i + moveIndexes.delta);
      }
    );
  }

  /**
   * Retrieves a single column of cells from the table.
   *
   * @param columnIndex  Zero-based index of the column to retrieve.
   * @param limit        Maximum number of rows to include. Defaults to all rows.
   *                     If `limit` is less than or equal to 0, an empty array is returned.
   * @returns            An array of {@link Cell} objects from row 0 up to `limit - 1`,
   *                     or an empty array if the index or limit is invalid.
   */
  getColumnCells(columnIndex: number, limit: number = this.getRowsNumber()): Cell[] {
    if (limit <= 0 || columnIndex < 0 || columnIndex >= this.getColumnsNumber())
      return [];

    const column: Cell[] = [];

    for (let i: number = 0; i < Math.min(this.getRowsNumber(), limit); ++i)
      column.push(this.table[i].getCell(columnIndex));

    return column;
  }

  /**
   * Retrieves a single row of cells from the table.
   *
   * @param rowIndex  Zero-based index of the row to retrieve.
   * @param limit     Maximum number of columns to include. Defaults to all columns.
   *                  If `limit` is less than or equal to 0, an empty array is returned.
   * @returns         An array of {@link Cell} objects from column 0 up to limit - 1,
   *                  or an empty array if the index or limit is invalid.
   */
  getRowCells(rowIndex: number, limit: number = this.getColumnsNumber()): Cell[] {
    if (limit <= 0 || rowIndex < 0 || rowIndex >= this.getRowsNumber())
      return [];

    return this.table[rowIndex].getCells().slice(0, Math.min(this.getColumnsNumber(), limit));
  }

  /**
   * Selects or updates the selection of a row.
   * If the row index is out of bounds, no action is taken.
   * @param rowIndex - Index of the row to select.
   */
  selectRow(rowIndex: number): void {
    if (rowIndex < 0 || rowIndex >= this.getRowsNumber())
      return;

    this.selectedRows.selectOrUpdate(this.getRowId(rowIndex));
  }

  /**
   * Deselects a row at the specified index.
   * If the row index is out of bounds, no action is taken.
   * @param rowIndex - Index of the row to deselect.
   */
  deselectRow(rowIndex: number): void {
    if (rowIndex < 0 || rowIndex >= this.getRowsNumber())
      return;

    this.selectedRows.deselect(this.getRowId(rowIndex));
  }

  /**
   * Selects or updates the selection of a column.
   * If the column index is out of bounds, no action is taken.
   * @param columnIndex - Index of the column to select.
   */
  selectColumn(columnIndex: number): void {
    if (columnIndex < 0 || columnIndex >= this.getColumnsNumber())
      return;

    this.selectedColumns.selectOrUpdate(this.getHeaderColumnId(columnIndex));
  }

  /**
   * Deselects a column at the specified index.
   * If the column index is out of bounds, no action is taken.
   * @param columnIndex - Index of the column to deselect.
   */
  deselectColumn(columnIndex: number): void {
    if (columnIndex < 0 || columnIndex >= this.getColumnsNumber())
      return;

    this.selectedColumns.deselect(this.getHeaderColumnId(columnIndex));
  }

  /**
   * Checks whether a column is selected.
   * @param columnIndex - Index of the column to check.
   * @returns True if the column is selected, false otherwise or if out of bounds.
   */
  isColumnSelected(columnIndex: number): boolean {
    if (columnIndex < 0 || columnIndex >= this.getColumnsNumber())
      return false;

    return this.selectedColumns.isSelected(this.getHeaderColumnId(columnIndex));
  }

  /**
   * Returns the number of selected columns.
   * @returns The count of currently selected columns.
   */
  getSelectedColumnNumber(): number {
    return this.selectedColumns.getSelectionNumber();
  }

  /**
   * Checks whether a row is selected.
   * @param rowIndex - Index of the row to check.
   * @returns True if the row is selected, false otherwise or if out of bounds.
   */
  isRowSelected(rowIndex: number): boolean {
    if (rowIndex < 0 || rowIndex >= this.getRowsNumber())
      return false;

    return this.selectedRows.isSelected(this.getRowId(rowIndex));
  }

  /**
   * Returns the number of selected rows.
   * @returns The count of currently selected rows.
   */
  getSelectedRowNumber(): number {
    return this.selectedRows.getSelectionNumber();
  }

  /**
   * Retrieves a cell from a specific row and column.
   *
   * @param rowIndex      Zero-based index of the row.
   * @param columnIndex   Zero-based index of the column.
   * @returns             The {@link Cell} at the specified position.
   */
  private getCell(rowIndex: number, columnIndex: number): Cell {
    return this.table[rowIndex].getCell(columnIndex);
  }

  /**
   * Retrieves a header cell for the specified column.
   *
   * @param columnIndex   Zero-based index of the column.
   * @returns             The {@link HeaderCell} at the specified column.
   */
  private getHeaderCell(columnIndex: number): HeaderCell {
    return this.header[columnIndex].getHeaderCell();
  }

  /**
   * Removes a row from the local table model by index.
   *
   * @param rowIndex      Zero-based index of the row to remove.
   *                      If out of bounds, no action is taken.
   */
  private _deleteRow(rowIndex: number): void {
    if (rowIndex < 0 || rowIndex >= this.getRowsNumber())
      return;

    this.table.splice(rowIndex, 1);
  }

  /**
   * Retrieves the UUID of a row by its index.
   *
   * @param rowIndex      Zero-based index of the row.
   * @returns             The row’s UUID.
   */
  private getRowId(rowIndex: number): string {
    return this.table[rowIndex].id;
  }

  /**
   * Deletes a single row both locally and on the backend.
   *
   * @param rowIndex      Zero-based index of the row to delete.
   *                      If out of bounds, no action is taken.
   */
  deleteRow(rowIndex: number): void {
    const rowId: string = this.getRowId(rowIndex);

    this.tableAPI.deleteRows([rowId]).subscribe(
      rowsDeleted => {
        this._deleteRow(rowsDeleted.indexes[0]);
      }
    );
  }

  /**
   * Deletes all currently selected rows both locally and on the backend.
   *
   * Selected rows are removed from the model in reverse index order
   * to avoid shifting issues, then a batch delete request is sent.
   */
  deleteSelectedRows(): void {
    const rowsIdsToDelete: string[] = this.selectedRows.getSelectedIds();

    this.tableAPI.deleteRows(rowsIdsToDelete).subscribe(
      rowsDeleted => {
        const rowsIndexesToDelete: number[] = rowsDeleted.indexes.sort((a: number, b: number): number => b - a);

        for (const rowIndex of rowsIndexesToDelete)
          this._deleteRow(rowIndex);
      }
    );
  }

  /**
   * Retrieves the UUID of a header column by its index.
   *
   * @param columnIndex   Zero-based index of the column.
   * @returns             The column’s UUID.
   */
  private getHeaderColumnId(columnIndex: number): string {
    return this.header[columnIndex].id;
  }

  /**
   * Deletes a single column both locally and on the backend.
   *
   * @param columnIndex   Zero-based index of the column to delete.
   *                      If out of bounds, no action is taken.
   */
  deleteColumn(columnIndex: number): void {
    const columnId: string = this.getHeaderColumnId(columnIndex);

    this.tableAPI.deleteColumns([columnId]).subscribe(
      columnDeleted => {
        this._deleteColumn(columnDeleted.indexes[0]);
      }
    );
  }

  /**
   * Removes a column from the local table model by index.
   * Also removes the corresponding cell from every row,
   * and deselects the column if it was selected.
   *
   * @param columnIndex   Zero-based index of the column to remove.
   *                      If out of bounds, no action is taken.
   */
  private _deleteColumn(columnIndex: number): void {
    if (columnIndex < 0 || columnIndex >= this.getColumnsNumber())
      return;

    this.header.splice(columnIndex, 1);

    for (const row of this.table) {
      row.deleteCell(columnIndex);
    }

    if (this.isColumnSelected(columnIndex))
      this.deselectColumn(columnIndex);
  }

  /**
   * Deletes all currently selected columns both locally and on the backend.
   *
   * Selected columns are removed from the model in reverse index order
   * to avoid shifting issues, then a batch delete request is sent.
   */
  deleteSelectedColumns(): void {
    const columnsIdsToDelete: string[] = this.selectedColumns.getSelectedIds();

    this.tableAPI.deleteColumns(columnsIdsToDelete).subscribe(
      columnDeleted => {
        const columnsIndexesToDelete: number[] = columnDeleted.indexes.sort((a: number, b: number): number => b - a);

        for (const columnIndex of columnsIndexesToDelete)
          this._deleteColumn(columnIndex);
      }
    );
  }

  /**
   * Duplicates the row at the specified `rowIndex` and inserts
   * the new row at `rowIndex`.
   *
   * @param rowIndex - Index of the row to duplicate.
   * @returns void
   */
  duplicateRow(rowIndex: number): void {
    if (rowIndex < 0 || rowIndex >= this.getRowsNumber())
      return;

    this.tableAPI.addNewRow(rowIndex, true).subscribe(
      rowCreatedDTO => {
        const newRow: Row = new Row(rowCreatedDTO.id);

        for (let j: number = 0; j < this.getColumnsNumber(); ++j)
          newRow.appendNewCell(this.getColumnDataType(j).getNewDataType(), rowCreatedDTO.cellsValues[j]);

        this.table.splice(rowIndex, 0, newRow);
      }
    )
  }

  /**
   * Duplicates the column at the specified `columnIndex` and inserts
   * the new column at `columnIndex`.
   *
   * @param columnIndex - Index of the column to duplicate.
   * @returns void
   */
  duplicateColumn(columnIndex: number): void {
    if (columnIndex < 0 || columnIndex >= this.getColumnsNumber())
      return;

    this.tableAPI.addNewColumn(this.getHeaderCell(columnIndex).cellDataType.getDataTypeId(), columnIndex, true).subscribe(
      createdColumnDTO => {
        const newHeaderCell: HeaderCell = new HeaderCell(
          createdColumnDTO.columnName || this.HEADER_CELL_DEFAULT_NAME,
          this.dataTypeService.convertIntoIDataType(createdColumnDTO.dataTypeId).getNewDataType()
        )

        this.header.splice(
          createdColumnDTO.columnIndex,
          0,
          new HeaderColumn(createdColumnDTO.id, newHeaderCell)
        );

        for (let i: number = 0; i < this.getRowsNumber(); ++i)
          this.table[i].insertNewCellAt(
            createdColumnDTO.columnIndex,
            this.dataTypeService.convertIntoIDataType(createdColumnDTO.dataTypeId).getNewDataType(),
            createdColumnDTO.cellsValues[i]
          )
      }
    )
  }

  /**
   * Changes the data type of an existing column at the given index.
   *
   * Sends a PATCH request via TableApiService to update the column’s data type
   * on the backend. When the backend responds, replaces the HeaderColumn
   * and each cell in that column locally with instances matching the new data type.
   *
   * @param columnIndex
   *   Zero-based index of the column whose data type should be changed.
   * @param dataType
   *   The IDataType instance representing the new data type to apply.
   */
  changeColumnDataType(columnIndex: number, dataType: IDataType): void {
    if (columnIndex < 0 || columnIndex >= this.getColumnsNumber())
      return;

    const currentDataType: IDataType = this.getColumnDataType(columnIndex);

    if (currentDataType instanceof dataType.constructor)
      return;

    const headerColumn: HeaderColumn = this.header[columnIndex];

    this.tableAPI.changeColumnDataType(headerColumn.id, dataType.getDataTypeId()).subscribe(
      (columnPatched: ColumnPatchedDTO): void => {
        const newDataType: IDataType = this.dataTypeService.convertIntoIDataType(
          columnPatched.dataTypeId || this.DEFAULT_DATA_TYPE_ID
        ).getNewDataType();
        const newName: string = columnPatched.columnName || this.HEADER_CELL_DEFAULT_NAME;

        this.header[columnPatched.columnIndex] = new HeaderColumn(
          columnPatched.id, new HeaderCell(newName, newDataType)
        );

        for (let i: number = 0; i < this.getRowsNumber(); ++i) {
          this.table[i].replaceCell(columnPatched.columnIndex, new Cell(newDataType, null));
        }
      }
    );
  }

  /**
   * Retrieves a cell (header or body) based on the provided coordinates.
   *
   * @param cord
   *   An instance of {@link CellCord} containing:
   *   - `j`: zero-based column index
   *   - `i`: zero-based row index (ignored if `isHeaderCell` is true)
   *   - `isHeaderCell`: if true, returns a header cell at column `j`; otherwise returns a body cell at (`i`, `j`)
   * @returns
   *   The {@link Cell} at the specified coordinates, or `null` if:
   *   - `j` is out of column bounds, or
   *   - `i` is out of row bounds when `isHeaderCell` is false
   */
  getCellFromCoords(cord: CellCord): Cell | null {
    if (cord.j < 0 || cord.j >= this.getColumnsNumber())
      return null;

    if (!cord.isHeaderCell && (cord.i < 0 || cord.i >= this.getRowsNumber()))
      return null;

    return cord.isHeaderCell ?
      this.getHeaderCell(cord.j) :
      this.getCell(cord.i, cord.j);
  }

  /**
   * Sets the value of one or more cells based on the current selection context.
   *
   * If the clicked cell is unselected, only that cell is updated.
   * If it belongs to a selected row or column, all matching cells are updated.
   * Issues one or more PATCH requests via TableApiService and applies
   * the backend’s CellPatchedDTO responses to the local model.
   *
   * @param cord
   *   The {@link CellCord} identifying row/column indices and whether it’s a header cell.
   * @param value
   *   The new string value to assign; if null or undefined, no request is made.
   * @param dataTypeId
   *   Numeric code of the data type, used by the backend to parse the value.
   */
  setCellsValue(cord: CellCord, value: string, dataTypeId: number): void {
    if (value == null)
      return;

    const clickedCell: Cell | null = this.getCellFromCoords(cord);

    if (!clickedCell)
      return;

    if (!cord.isHeaderCell) {
      if (!this.isRowSelected(cord.i) && !this.isColumnSelected(cord.j)) {
        this.updateSingleCell(cord, value, dataTypeId);
      } else if (this.isRowSelected(cord.i)) {
        this.updateSelectedRows(value, dataTypeId);
      } else if (this.isColumnSelected(cord.j)) {
        this.updateSelectedColumns(value, dataTypeId);
      } else {
        this.updateSelectedRows(value, dataTypeId);
        this.updateSelectedColumns(value, dataTypeId);
      }
    } else {
      this.updateSingleCell(cord, value, dataTypeId);
    }
  }

  private setContentCellValueFromDTO(cellPatchedDTOList: CellPatchedDTO[]): void {
    for (const cellPatchedDTO of cellPatchedDTOList) {
      const cell: Cell = this.getCellFromCoords(new CellCord(cellPatchedDTO.rowIndex, cellPatchedDTO.columnIndex))!;
      cell.value = cellPatchedDTO.value;
    }
  }

  /**
   * Updates a single cell’s value both locally and on the backend.
   *
   * If cord.isHeaderCell is true, sends a column-name change; otherwise,
   * sends a cell-value update. Upon response, applies the returned DTO
   * to update the corresponding Cell in the local model.
   *
   * @param cord
   *   The {@link CellCord} identifying the target cell (row/column or header).
   * @param value
   *   The new string value to assign.
   * @param dataTypeId
   *   Numeric code of the data type, required for cell-value updates.
   */
  private updateSingleCell(cord: CellCord, value: string, dataTypeId: number): void {
    if (cord.isHeaderCell) {
      this.tableAPI.changeColumnName(this.getHeaderColumnId(cord.j), value).subscribe(
        (columnPatched: ColumnPatchedDTO): void => {
          const cell: Cell = this.getCellFromCoords(new CellCord(-1, columnPatched.columnIndex, true))!;
          cell.value = columnPatched.columnName || this.HEADER_CELL_DEFAULT_NAME;
        }
      );
    } else {
      const rowId: string = this.getRowId(cord.i);
      const columnId: string = this.getHeaderColumnId(cord.j);
      const idPair: Pair<string, string> = new Pair(rowId, columnId);
      const data: Pair<Pair<string, string>, string> = new Pair<Pair<string, string>, string>(idPair, value);

      this.tableAPI.updateCellsValue([data], dataTypeId).subscribe(
        (cellsPatched: CellPatchedDTO[]): void => this.setContentCellValueFromDTO(cellsPatched)
      );
    }
  }

  /**
   * Updates all cells in the selected rows that share the same data type
   * as the originally clicked cell.
   *
   * Builds a batch of PATCH operations via TableApiService using each
   * selected row ID and then applies the backend’s responses to update
   * local cell values.
   *
   * @param value
   *   The new string value to assign to each matching cell.
   * @param dataTypeId
   *   Numeric code of the data type, used by the backend to parse the values.
   */
  private updateSelectedRows(value: string, dataTypeId: number): void {
    const selectedRowsIds: string[] = this.selectedRows.getSelectedIds();
    const data: Pair<Pair<string, undefined>, string>[] = []

    for (let id of selectedRowsIds) {
      data.push(new Pair(new Pair(id, undefined), value));
    }

    this.tableAPI.updateCellsValue(data, dataTypeId).subscribe(
      (cellsPatched: CellPatchedDTO[]): void => this.setContentCellValueFromDTO(cellsPatched)
    );
  }

  /**
   * Updates all cells in the selected columns.
   *
   * Builds a batch of PATCH operations via TableApiService using each
   * selected column ID and then applies the backend’s responses to update
   * local cell values.
   *
   * @param value
   *   The new string value to assign to each cell in the selected columns.
   * @param dataTypeId
   *   Numeric code of the data type, used by the backend to parse the values.
   */
  private updateSelectedColumns(value: string, dataTypeId: number): void {
    const selectedColumnsIds: string[] = this.selectedColumns.getSelectedIds();
    const data: Pair<Pair<undefined, string>, string>[] = []

    for (let id of selectedColumnsIds) {
      data.push(new Pair(new Pair(undefined, id), value));
    }

    this.tableAPI.updateCellsValue(data, dataTypeId).subscribe(
      (cellsPatched: CellPatchedDTO[]): void => this.setContentCellValueFromDTO(cellsPatched)
    );
  }

  /**
   * Populates the local table model from a TableDTO received from the backend.
   *
   * This method initializes the component’s `header` and `table` arrays.
   * If column name is missing uses `this.HEADER_CELL_DEFAULT_NAME` as default name.
   * If column data-type is missing uses `this.DEFAULT_DATA_TYPE_ID` (Textual data-type) as default data-type.
   *
   * @param tableDTO  The DTO containing header (header's columns) and content (rows) to load.
   */
  private loadFromTableDTO(tableDTO: TableDTO): void {
    for (let columnDTO of tableDTO.header) {
      const headerCell: HeaderCell = new HeaderCell(
        columnDTO.columnName || this.HEADER_CELL_DEFAULT_NAME,
        this.dataTypeService.convertIntoIDataType(columnDTO.dataType || this.DEFAULT_DATA_TYPE_ID)
      );
      const column: HeaderColumn = new HeaderColumn(columnDTO.id, headerCell);

      this.header.push(column);
    }

    for (let row of tableDTO.content) {
      this.table.push(new Row(row.id))

      for (let j: number = 0; j < row.cells.length; ++j) {
        this.table[this.getRowsNumber() - 1].appendNewCell(this.getColumnDataType(j).getNewDataType(), row.cells[j].value);
      }
    }
  }

  /**
   * Initializes the table view by fetching data from the backend.
   *
   * This method resets the `isLoaded` flag, requests the table via the API,
   * and upon success calls `loadFromTableDTO` to build the in-memory model,
   * then sets `isLoaded` to true.
   *
   * @param tableId  UUID of the table to load.
   */
  init(tableId: string): void {
    this.isLoaded = false;
    this.tableAPI.getTable(tableId).subscribe(
      {
        next: tableDTO => {
          this.loadFromTableDTO(tableDTO);
          this.isLoaded = true;
        }
      }
    )
  }

  set isLoaded(value: boolean) {
    this._isLoaded = value;
  }

  get isLoaded(): boolean {
    return this._isLoaded;
  }
}
