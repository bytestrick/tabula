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

  readonly INVALID_CELL_INDEX: number = -2; // Must be a negative number

  /**
   * Appends a new column to the current table.
   *
   * Sends a request to the backend to create a new column with the given data-type.
   * Once created, it adds the new header's column to the header and appends a new empty cell
   * to each existing row to maintain consistency.
   *
   * @param dataType The data-type to be assigned to the new column.
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
   * If the given index is out of bounds (less than 0 or greater than or equal to the
   * current number of rows), the method returns early without making a request.
   * Otherwise, it sends a request to create a new row at that index. On success,
   * the new row is spliced into the local `table` array at `rowIndex`, and
   * a new empty cell is appended for each existing column, matching its data-type.
   *
   * @param rowIndex  Zero-based index at which to insert the new row.
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
   * If the given index is out of bounds (less than 0 or greater than or equal to the
   * current number of columns), the method returns early without making a request.
   * Otherwise, it sends a request to create a new column with the specified data-type
   * at that index. On success, the new column is spliced into the local `header` array
   * at `columnIndex`, and each existing row is updated by inserting a new empty cell
   * at that same index, matching the column’s data-type.
   *
   * @param columnIndex  Zero-based index at which to insert the new column.
   * @param dataType     The data-type to be assigned to the new column.
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
   * Moves a single row from one position to another within the table,
   * and updates selection state if the moved row was selected.
   *
   * @param fromIndex - The zero-based index of the row to move.
   * @param toIndex - The zero-based target index where the row should be placed.
   */
  private _moveRow(fromIndex: number, toIndex: number): void {
    if (fromIndex < 0 || fromIndex >= this.getRowsNumber())
      return;

    if (toIndex < 0 || toIndex >= this.getRowsNumber())
      return;

    if (fromIndex === toIndex)
      return;

    moveItemInArray(this.table, fromIndex, toIndex);

    if (this.isRowSelected(fromIndex) && !this.isRowSelected(toIndex)) {
      this.deselectRow(fromIndex);
      this.selectRow(toIndex);
    }
    else if (!this.isRowSelected(fromIndex) && this.isRowSelected(toIndex)) {
      this.deselectRow(toIndex);
      this.selectRow(fromIndex);
    }
  }



  /**
   * Computes all index‐mapping operations required when a row/column is moved
   * from one position to another, so that downstream consumers can update.
   *
   * @param fromIndex - The original index of the moved row.
   * @param toIndex - The destination index of the moved row.
   * @returns An array of Pair&lt;oldIndex, newIndex&gt; describing each shifted index.
   */
  private getMovedIndexes(fromIndex: number, toIndex: number): Pair<number, number>[] {
    const indexesToUpdate: Pair<number, number>[] = [];

    if (fromIndex > toIndex) {
      for (let i: number = toIndex; i <= fromIndex - 1; ++i) {
        indexesToUpdate.push(new Pair(i, i + 1));
      }
    }
    else if (fromIndex < toIndex) {
      for (let i: number = fromIndex + 1; i <= toIndex; ++i) {
        indexesToUpdate.push(new Pair(i, i - 1));
      }
    }
    else
      return [];

    indexesToUpdate.push(new Pair(fromIndex, toIndex));

    return indexesToUpdate;
  }


  /**
   * Move a single row and immediately notify
   * the table API of which indexes have changed.
   *
   * @param fromIndex - The index of the row to move.
   * @param toIndex - The index to which the row should be moved.
   */
  moveRow(fromIndex: number, toIndex: number): void {
    this._moveRow(fromIndex, toIndex);
    this.tableAPI.updateRowsIndexes(this.getMovedIndexes(fromIndex, toIndex));
  }


  /**
   * Sorts a list of selected indexes in the correct order for
   * multi-row movement, based on the direction of movement.
   *
   * @param rawDelta - The raw offset (positive or negative) indicating direction.
   * @param selectedIndexes - Array of selected row or column indexes.
   * @returns A new array sorted ascending when moving up (delta<0),
   *          or descending when moving down (delta>0).
   */
  private getSortedSelectedIndexToMove(rawDelta: number, selectedIndexes: number[]): number[] {
    if (selectedIndexes.length === 0)
      return [];

    if (rawDelta < 0) {
      // sort selected indexes in ascending order
      return selectedIndexes.sort((a, b) => a - b);
    }
    else if (rawDelta > 0) {
      // sorts the selected indexes in descending order
      return selectedIndexes.sort((a, b) => b - a);
    }

    return [];
  }


  /**
   * Ensures the computed delta does not cause any moved index
   * to go out of the valid bounds [minBounds, maxBounds).
   *
   * @param rawDelta - The initial desired delta.
   * @param sortedIndexesToMove - The sorted list of indexes about to be moved.
   * @param minBounds - The minimum valid index (inclusive).
   * @param maxBounds - The maximum valid index (exclusive).
   * @returns An adjusted delta that keeps all moves within bounds.
   */
  private getAdjustedDeltaToBounds(rawDelta: number, sortedIndexesToMove: number[], minBounds: number, maxBounds: number): number {
    if (sortedIndexesToMove.length === 0)
      return 0;

    if (rawDelta < 0) {
      while(sortedIndexesToMove[0] + rawDelta < minBounds)
        ++rawDelta;
    }
    else if (rawDelta > 0) {
      while(sortedIndexesToMove[0] + rawDelta >= maxBounds)
        --rawDelta;
    }

    return rawDelta;
  }


  /**
   * Merges a new batch of moved index mappings into the existing list,
   * updating any overlapping oldIndex→newIndex pairs and adding new ones.
   *
   * @param indexesToUpdate - The accumulator array of existing mappings.
   * @param currentMovedIndexes - The latest array of moved index pairs.
   */
  private reconstructIndexesToUpdate(indexesToUpdate: Pair<number, number>[], currentMovedIndexes: Pair<number, number>[]): void {
    const newIndexesDiscovered: Pair<number, number>[] = [];
    const indexesSnapshot: Pair<number, number>[] = [];

    for (let p of indexesToUpdate)
      indexesSnapshot.push(new Pair(p.first, p.second));

    for (let p of currentMovedIndexes) {
      let matchedSnapshotIndex: number = -1;

      for (let k: number = 0; k < indexesSnapshot.length; ++k) {
        if (indexesSnapshot[k].second === p.first) {
          matchedSnapshotIndex = k;
          break;
        }
      }

      if (matchedSnapshotIndex >= 0) {
        indexesToUpdate[matchedSnapshotIndex].second = p.second;
      }
      else
        newIndexesDiscovered.push(p);
    }

    for (let p of newIndexesDiscovered)
      indexesToUpdate.push(p);
  }


  /**
   * Moves all currently selected rows from one index to another,
   * adjusting for boundaries, preserving order, and batching update notifications.
   *
   * @param fromIndex - The reference index from which movement is measured.
   * @param toIndex - The target index where the selection block should end up.
   */
  moveSelectedRows(fromIndex: number, toIndex: number): void {
    const rawDelta: number = toIndex - fromIndex;

    const rowsToMove: number[] = this.getSortedSelectedIndexToMove(rawDelta, this.selectedRows.getSelectedIndexes());
    const adjustedDelta: number = this.getAdjustedDeltaToBounds(rawDelta, rowsToMove, 0, this.getRowsNumber());

    const indexesToUpdate: Pair<number, number>[] = [];

    for (let i of rowsToMove) {
      this._moveRow(i, i + adjustedDelta);

      const currentMovedIndexes: Pair<number, number>[] = this.getMovedIndexes(i, i + adjustedDelta);
      this.reconstructIndexesToUpdate(indexesToUpdate, currentMovedIndexes);
    }

    this.tableAPI.updateRowsIndexes(indexesToUpdate);
  }


  /**
   * Moves a single column from one position to another within the table,
   * and updates selection state if the moved column was selected.
   *
   * @param fromIndex - The zero-based index of the column to move.
   * @param toIndex - The zero-based target index where the column should be placed.
   */
  private _moveColumn(fromIndex: number, toIndex: number): void {
    if (fromIndex < 0 || fromIndex >= this.getColumnsNumber())
      return;

    if (toIndex < 0 || toIndex >= this.getColumnsNumber())
      return;

    if (fromIndex === toIndex)
      return;

    for (let row of this.table)
      moveItemInArray(row.getCells(), fromIndex, toIndex);

    moveItemInArray(this.header, fromIndex, toIndex);
  }


  /**
   * Moves a single column and immediately notifies the table API
   * of which column indexes have changed.
   *
   * @param fromIndex - The index of the column to move.
   * @param toIndex - The index to which the column should be moved.
   */
  moveColumn(fromIndex: number, toIndex: number): void {
    this._moveColumn(fromIndex, toIndex);
    this.tableAPI.updateColumnsIndexes(this.getMovedIndexes(fromIndex, toIndex));
  }


  /**
   * Moves all currently selected columns from one index to another,
   * adjusting for boundaries, preserving order, and batching update notifications.
   *
   * @param fromIndex - The reference index from which movement is measured.
   * @param toIndex - The target index where the selection block should end up.
   */
  moveSelectedColumns(fromIndex: number, toIndex: number): void {
    const rawDelta: number = toIndex - fromIndex;

    const columnsToMove: number[] = this.getSortedSelectedIndexToMove(rawDelta, this.selectedColumns.getSelectedIndexes());
    const adjustedDelta: number = this.getAdjustedDeltaToBounds(rawDelta, columnsToMove, 0, this.getColumnsNumber());

    const indexesToUpdate: Pair<number, number>[] = [];

    for (let j of columnsToMove) {
      this._moveColumn(j, j + adjustedDelta);

      const currentMovedIndexes: Pair<number, number>[] = this.getMovedIndexes(j, j + adjustedDelta);
      this.reconstructIndexesToUpdate(indexesToUpdate, currentMovedIndexes);
    }

    this.tableAPI.updateColumnsIndexes(indexesToUpdate);
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


  selectRow(rowIndex: number): void {
    if (rowIndex < 0 || rowIndex >= this.getRowsNumber())
      return;

    this.selectedRows.selectOrUpdate(this.getRowId(rowIndex), rowIndex)
  }


  deselectRow(rowIndex: number): void {
    if (rowIndex < 0 || rowIndex >= this.getRowsNumber())
      return;

    this.selectedRows.deselect(this.getRowId(rowIndex));
  }


  selectColumn(columnIndex: number): void {
    if (columnIndex < 0 || columnIndex >= this.getColumnsNumber())
      return;

    this.selectedColumns.selectOrUpdate(this.getHeaderColumnId(columnIndex), columnIndex)
  }


  deselectColumn(columnIndex: number): void {
    if (columnIndex < 0 || columnIndex >= this.getColumnsNumber())
      return;

    this.selectedColumns.deselect(this.getHeaderColumnId(columnIndex));
  }


  isColumnSelected(columnIndex: number): boolean {
    if (columnIndex < 0 || columnIndex >= this.getColumnsNumber())
      return false;

    return this.selectedColumns.isSelected(this.getHeaderColumnId(columnIndex));
  }


  getSelectedColumnNumber(): number {
    return this.selectedColumns.getSelectionNumber();
  }


  isRowSelected(rowIndex: number): boolean {
    if (rowIndex < 0 || rowIndex >= this.getRowsNumber())
      return false;

    return this.selectedRows.isSelected(this.getRowId(rowIndex));
  }


  getSelectedRowNumber(): number {
    return this.selectedRows.getSelectionNumber();
  }


  hasRowsSelected(): boolean {
    return this.selectedRows.getSelectionNumber() !== 0;
  }


  hasColumnsSelected(): boolean {
    return this.selectedColumns.getSelectionNumber() !== 0;
  }


  doForEachRowSelected(fn: (rowId: number) => void): void {
    this.selectedRows.doForEachIndexSelected(fn);
  }


  doForEachColumnSelected(fn: (columnId: number) => void): void {
    this.selectedColumns.doForEachIndexSelected(fn);
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


  // duplica la riga e la inserisce a sotto di rowIndex
  duplicateRow(rowIndex: number): void {
    // if (rowIndex < 0 || rowIndex >= this.getRowsNumber())
    //   return;
    //
    // const clonedRow: Row = new Row();
    //
    // for (let j: number = 0; j < this.getColumnsNumber(); ++j)
    //   clonedRow.appendNewCell(this.getColumnDataType(j).getNewDataType(), this.table[rowIndex].getCellValue(j));
    //
    // this.table.splice(rowIndex + 1, 0, clonedRow);
  }


  // duplica la colonna e la inserisce a destra di columnIndex
  duplicateColumn(columnIndex: number): void {
    // if (columnIndex < 0 || columnIndex >= this.getColumnsNumber())
    //   return;
    //
    // const duplicateHeaderCell: HeaderCell = new HeaderCell(
    //   this.getHeaderCell(columnIndex).cellDataType.getNewDataType(),
    //   this.getHeaderCell(columnIndex).value,
    //   this.getHeaderCell(columnIndex).columnDataType.getNewDataType()
    // )
    //
    // this.header.splice(
    //   columnIndex + 1,
    //   0,
    //   new Column(duplicateHeaderCell)
    // );
    //
    // for (let i: number = 0; i < this.getRowsNumber(); ++i)
    //   this.table[i].insertNewCellAt(
    //     columnIndex + 1, this.getColumnDataType(columnIndex).getNewDataType(), this.table[i].getCellValue(columnIndex)
    //   )
  }


  /**
   * Changes the data-type of an existing column at the specified index.
   *
   * <p>This method updates the local table representation by:
   * 1. Verifying the index is within bounds.<br>
   * 2. Skipping if the new data-type is identical to the current one.<br>
   * 3. Replacing the header cell for that column with a new {@link HeaderCell}
   *    using the new data-type.<br>
   * 4. Iterating through all existing rows and replacing each cell in that column
   *    with an empty cell of the new data-type.</p>
   *
   * After updating the local model, it sends a PATCH request to the backend to
   * persist the change via {@link tableAPI.changeColumnDataType}.
   *
   * @param columnIndex  Zero-based index of the column whose data-type should be changed.
   * @param dataType     The new data-type to apply to the column.
   */
  changeColumnDataType(columnIndex: number, dataType: IDataType): void {
    if (columnIndex < 0 || columnIndex >= this.getColumnsNumber())
      return;

    const currentDataType: IDataType = this.getColumnDataType(columnIndex);

    if (currentDataType instanceof dataType.constructor)
      return;

    const headerColumn: HeaderColumn = this.header[columnIndex];

    this.tableAPI.changeColumnDataType(headerColumn.id, dataType.getDataTypeId()).subscribe(
      (): void => {
        this.header[columnIndex] = new HeaderColumn(
          headerColumn.id, new HeaderCell(headerColumn.getColumnName(), dataType.getNewDataType())
        );

        for (let i: number = 0; i < this.getRowsNumber(); ++i) {
          this.table[i].replaceCell(columnIndex, new Cell(dataType.getNewDataType(), null));
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

    if (!cord.isHeaderCell && cord.i < 0 || cord.i >= this.getRowsNumber())
      return null;

    return cord.isHeaderCell ?
      this.getHeaderCell(cord.j) :
      this.getCell(cord.i, cord.j);
  }


  /**
   * Sets the value of one or more cells based on the current selection state.
   *
   * Behavior:
   * - If the clicked cell is not part of any active selection, only that cell is updated.
   * - If the clicked cell belongs to a selected row or column, all selected cells
   *   that match the clicked cell's data-type (for rows) or any cell (for columns)
   *   will be updated.
   *
   * Every change is persisted via the `TableAPI`, and backend responses are used
   * to update the local cell values.
   *
   * @param cord   Coordinates of the clicked cell (`i` = row index, `j` = column index).
   * @param value  The new value to assign. If `null`, the operation is skipped.
   */
  setCellValue(cord: CellCord, value: any): void {
    if (value == null)
      return;

    const clickedCell: Cell | null = this.getCellFromCoords(cord);

    if (!clickedCell)
      return;

    if (!this.isRowSelected(cord.i) && !this.isColumnSelected(cord.j)) {
      this.updateSingleCell(cord.i, cord.j, value);
    } else {
      this.updateSelectedRows(clickedCell.cellDataType.constructor, value);
      this.updateSelectedColumns(value);
    }
  }


  /**
   * Updates a single cell both locally and on the backend.
   *
   * Sends the update via the `TableAPI`, and upon response,
   * updates the in-memory representation of the cell.
   *
   * @param rowIndex     The row index of the cell.
   * @param columnIndex  The column index of the cell.
   * @param value        The new value to assign.
   */
  private updateSingleCell(rowIndex: number, columnIndex: number, value: any): void {
    this.tableAPI.updateCellValue(rowIndex, columnIndex, value).subscribe(
      (cellPatched: CellPatchedDTO): void => {
        const cell: Cell = this.getCellFromCoords(new CellCord(cellPatched.rowIndex, cellPatched.columnIndex))!;
        cell.value = cellPatched.value;
      }
    );
  }


  /**
   * Updates all cells in selected rows that match the same data-type
   * as the originally clicked cell.
   *
   * For each selected row, only cells with a matching data-type constructor
   * are updated.
   *
   * @param typeConstructor  The constructor function of the reference data-type.
   * @param value            The new value to assign.
   */
  private updateSelectedRows(typeConstructor: Function, value: any): void {
    this.doForEachRowSelected((i: number): void => {
      this.getRowCells(i).forEach((cell: Cell, j: number): void => {
        if (cell.cellDataType.constructor === typeConstructor) {
          this.updateSingleCell(i, j, value);
        }
      });
    });
  }


  /**
   * Updates all cells in the selected columns.
   *
   * Unlike row updates, this method applies the value to every cell in selected
   * columns without checking for data-type compatibility. This is because along
   * a column there is the same data-type.
   *
   * @param value  The new value to assign to each affected cell.
   */
  private updateSelectedColumns(value: any): void {
    this.doForEachColumnSelected((j: number): void => {
      this.getColumnCells(j).forEach((_cell: Cell, i: number): void => {
        this.updateSingleCell(i, j, value);
      });
    });
  }


  /**
   * Populates the local table model from a TableDTO received from the backend.
   *
   * This method initializes the component’s `header` and `table` arrays.
   * If column name is missing uses `this.HEADER_CELL_DEFAULT_NAME` as default name.
   * If column data-type is missing uses `1` (Textual data-type) as default data-type.
   *
   * @param tableDTO  The DTO containing header (header's columns) and content (rows) to load.
   */
  private loadFromTableDTO(tableDTO: TableDTO): void {
    for (let columnDTO of tableDTO.header) {
      const headerCell: HeaderCell = new HeaderCell(
        columnDTO.columnName || this.HEADER_CELL_DEFAULT_NAME,
        this.dataTypeService.convertIntoIDataType(columnDTO.dataType || 1)
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
        next: tableDTO => { this.loadFromTableDTO(tableDTO); this.isLoaded = true; }
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
