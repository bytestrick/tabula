import {inject, Injectable} from '@angular/core';
import {Cell} from '../model/table/cell';
import {HeaderCell} from '../model/table/header-cell';
import {IDataType} from '../model/data-types/i-data-type';
import {TextualDataType} from '../model/data-types/concrete-data-type/textual-data-type';
import {moveItemInArray} from '@angular/cdk/drag-drop';
import {CellCord} from '../model/table/cell-cord';
import {TableApiService, TableDTO} from './table-api.service';
import {DataTypeRegistryService} from './data-type-registry.service';
import {Pair} from '../model/pair';


@Injectable()
export class TableService {

  private dataTypeService: DataTypeRegistryService = inject(DataTypeRegistryService);
  private tableAPI: TableApiService = inject(TableApiService);

  private table: Cell[][] = [];
  private headerCells: HeaderCell[] = [];

  private selectedRows: Set<number> = new Set<number>;
  private selectedColumns: Set<number> = new Set<number>;

  private _isLoaded: boolean = false;

  private readonly HEADER_CELL_DEFAULT_NAME: string = 'New Column';

  readonly INVALID_CELL_INDEX: number = -2; // deve essere un numero negativo


  addNewHeader(dataType: IDataType): void {
    this.headerCells.push(new HeaderCell(new TextualDataType(), this.HEADER_CELL_DEFAULT_NAME, dataType));

    for (let i: number = 0; i < this.getRowsNumber(); ++i) {
      while (this.table[i].length < this.getHeadersCellsAmount()) {
        const currentDataType: IDataType = this.getColumnDataType(this.table[i].length);
        this.table[i].push(new Cell(currentDataType.getNewDataType(), null));
      }
    }

    this.tableAPI.appendNewColumn(dataType.getDataTypeId());
  }


  addNewRow(): void {
    this.table.push([]);
    const lastRowI: number = this.getRowsNumber() - 1;

    for (let i: number = 0; i < this.getHeadersCellsAmount(); ++i) {
      this.table[lastRowI].push(new Cell(this.headerCells[i].columnDataType.getNewDataType(), null));
    }

    this.tableAPI.appendNewRow();
  }


  getRowsNumber(): number {
    return this.table.length;
  }


  getHeadersCellsAmount(): number {
    return this.headerCells.length;
  }


  getHeadersCells(): HeaderCell[] {
    return this.headerCells;
  }


  insertNewRowAt(rowIndex: number): void {
    if (rowIndex >= 0 && rowIndex < this.getRowsNumber()) {
      this.table.splice(rowIndex, 0, []);

      for (let i: number = 0; i < this.getHeadersCellsAmount(); ++i)
        this.table[rowIndex].push(new Cell(this.headerCells[i].columnDataType.getNewDataType(), null));

      // è necessario perché quando si inserisce una riga le righe al di sotto scendono di 1
      const indexesToUpdate: number[] = [];
      this.selectedRows.forEach(index => {
        if (index >= rowIndex) {
          indexesToUpdate.push(index);
        }
      });

      indexesToUpdate.forEach(index => {
        this.selectedRows.delete(index);
        this.selectedRows.add(index + 1);
      });
    }
  }


  insertNewDataTypeAt(columnIndex: number, dataType: IDataType): void {
    if (columnIndex >= 0 && columnIndex < this.getHeadersCellsAmount()) {
      this.headerCells.splice(columnIndex, 0, new HeaderCell(new TextualDataType(), this.HEADER_CELL_DEFAULT_NAME, dataType));

      for (let i: number = 0; i < this.getRowsNumber(); ++i) {
        this.table[i].splice(columnIndex, 0, new Cell(this.getColumnDataType(columnIndex).getNewDataType(), null));
      }

      // è necessario perché quando si inserisce una colonna le colonne a destra si spostano a destra di 1
      const indexesToUpdate: number[] = [];
      this.selectedColumns.forEach(index => {
        if (index >= columnIndex) {
          indexesToUpdate.push(index);
        }
      });

      indexesToUpdate.forEach(index => {
        this.selectedColumns.delete(index);
        this.selectedColumns.add(index + 1);
      });
    }
  }


  getRows(): Cell[][] {
    return this.table;
  }


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


  moveRow(fromIndex: number, toIndex: number): void {
    this._moveRow(fromIndex, toIndex);
    this.tableAPI.updateRowsIndexes(this.getMovedIndexes(fromIndex, toIndex));
  }


  private getSortedSelectedIndexToMove(rawDelta: number, selectedIndexes: number[]): number[] {
    if (selectedIndexes.length == 0)
      return [];

    let rowsToMove: number[] = [];

    if (rawDelta < 0) {
      // ordina le righe selezionate in modo crescente
      return selectedIndexes.sort((a, b) => a - b);
    }
    else if (rawDelta > 0) {
      // ordina le righe selezionate in modo decrescente
      return selectedIndexes.sort((a, b) => b - a);
    }

    return [];
  }


  private getAdjustDeltaToBounds(rawDelta: number, sortedIndexesToMove: number[], minBounds: number, maxBounds: number): number {
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


  public getSelectedRows(): number[] {
    return Array.from(this.selectedRows);
  }


  private reconstructIndexesToUpdate(indexesToUpdate: Pair<number, number>[], currentMovedIndexes: Pair<number, number>[]): void {
    const newIndexesDiscovered: Pair<number, number>[] = [];
    const indexesSnapshot: Pair<number, number>[] = [];

    for (let p of indexesToUpdate)
      indexesSnapshot.push(new Pair(p.first, p.second));

    for (let p of currentMovedIndexes) {
      let hasValueI: number = -1;

      for (let k: number = 0; k < indexesSnapshot.length; ++k) {
        if (indexesSnapshot[k].second === p.first) {
          hasValueI = k;
          break;
        }
      }

      if (hasValueI >= 0) {
        indexesToUpdate[hasValueI].second = p.second;
      }
      else
        newIndexesDiscovered.push(p);
    }

    for (let p of newIndexesDiscovered)
      indexesToUpdate.push(p);
  }


  moveSelectedRows(fromIndex: number, toIndex: number): void {
    const rawDelta: number = toIndex - fromIndex;

    const rowsToMove: number[] = this.getSortedSelectedIndexToMove(rawDelta, this.getSelectedRows());
    const adjustedDelta: number = this.getAdjustDeltaToBounds(rawDelta, rowsToMove, 0, this.getRowsNumber());

    const indexesToUpdate: Pair<number, number>[] = [];

    for (let i of rowsToMove) {
      this._moveRow(i, i + adjustedDelta);

      const currentMovedIndexes: Pair<number, number>[] = this.getMovedIndexes(i, i + adjustedDelta);
      this.reconstructIndexesToUpdate(indexesToUpdate, currentMovedIndexes);
    }

    this.tableAPI.updateRowsIndexes(indexesToUpdate);
  }


  private _moveColumn(fromIndex: number, toIndex: number): void {
    if (fromIndex < 0 || fromIndex >= this.getHeadersCellsAmount())
      return;

    if (toIndex < 0 || toIndex >= this.getHeadersCellsAmount())
      return;

    if (fromIndex === toIndex)
      return;

    for (let row of this.table)
      moveItemInArray(row, fromIndex, toIndex);

    moveItemInArray(this.headerCells, fromIndex, toIndex);

    if (this.isColumnSelected(fromIndex) && !this.isColumnSelected(toIndex)) {
      this.deselectColumn(fromIndex);
      this.selectColumn(toIndex);
    }
    else if (!this.isColumnSelected(fromIndex) && this.isColumnSelected(toIndex)) {
      this.deselectColumn(toIndex);
      this.selectColumn(fromIndex);
    }
  }


  moveColumn(fromIndex: number, toIndex: number): void {
    this._moveColumn(fromIndex, toIndex);
    this.tableAPI.updateColumnsIndexes(this.getMovedIndexes(fromIndex, toIndex));
  }


  public getSelectedColumns(): number[] {
    return Array.from(this.selectedColumns);
  }


  moveSelectedColumns(fromIndex: number, toIndex: number): void {
    const rawDelta: number = toIndex - fromIndex;

    const columnsToMove: number[] = this.getSortedSelectedIndexToMove(rawDelta, this.getSelectedColumns());
    const adjustedDelta: number = this.getAdjustDeltaToBounds(rawDelta, columnsToMove, 0, this.getHeadersCellsAmount());

    const indexesToUpdate: Pair<number, number>[] = [];

    for (let j of columnsToMove) {
      this._moveColumn(j, j + adjustedDelta);

      const currentMovedIndexes: Pair<number, number>[] = this.getMovedIndexes(j, j + adjustedDelta);
      this.reconstructIndexesToUpdate(indexesToUpdate, currentMovedIndexes);
    }

    this.tableAPI.updateColumnsIndexes(indexesToUpdate);
  }


  getColumn(columnIndex: number, limit: number = this.getRowsNumber()): Cell[] {
    if (limit <= 0 || columnIndex < 0 || columnIndex >= this.getHeadersCellsAmount())
      return [];

    const column: Cell[] = [];

    for (let i: number = 0; i < Math.min(this.getRowsNumber(), limit); ++i)
      column.push(this.table[i][columnIndex]);

    return column;
  }


  getRow(rowIndex: number, limit: number = this.getHeadersCellsAmount()): Cell[] {
    if (limit <= 0 || rowIndex < 0 || rowIndex >= this.getRowsNumber())
      return [];

    return this.table[rowIndex].slice(0, Math.min(this.getHeadersCellsAmount(), limit));
  }


  getColumnDataType(columnIndex: number): IDataType {
    return this.headerCells[columnIndex].columnDataType;
  }


  selectRow(rowIndex: number): void {
    this.selectedRows.add(rowIndex);
  }


  deselectRow(rowIndex: number): void {
    this.selectedRows.delete(rowIndex);
  }


  selectColumn(columnIndex: number): void {
    this.selectedColumns.add(columnIndex);
  }


  deselectColumn(columnIndex: number): void {
    this.selectedColumns.delete(columnIndex);
  }


  isColumnSelected(columnIndex: number): boolean {
    return this.selectedColumns.has(columnIndex);
  }


  getSelectedColumnNumber(): number {
    return this.selectedColumns.size;
  }


  isRowSelected(rowIndex: number): boolean {
    return this.selectedRows.has(rowIndex);
  }


  getSelectedRowNumber(): number {
    return this.selectedRows.size;
  }


  hasRowsSelected(): boolean {
    return this.selectedRows.size !== 0;
  }


  hasColumnsSelected(): boolean {
    return this.selectedColumns.size !== 0;
  }


  doForEachRowSelected(fn: (rowIndex: number) => void): void {
    this.selectedRows.forEach(fn);
  }


  doForEachColumnSelected(fn: (columnIndex: number) => void): void {
    this.selectedColumns.forEach(fn);
  }


  private getCell(rowIndex: number, columnIndex: number): Cell {
    return this.table[rowIndex][columnIndex];
  }


  private getHeaderCell(columnIndex: number): HeaderCell {
    return this.headerCells[columnIndex];
  }


  private _deleteRow(rowIndex: number): void {
      if (rowIndex < 0 || rowIndex >= this.getRowsNumber())
    return;

    this.table.splice(rowIndex, 1);

    if (this.isRowSelected(rowIndex))
      this.deselectRow(rowIndex);

    // è necessario perché quando si cancella una riga le righe al di sotto salgano di 1
    const indexesToUpdate: number[] = [];
    this.selectedRows.forEach(index => {
      if (index > rowIndex) {
        indexesToUpdate.push(index);
      }
    });

    indexesToUpdate.forEach(index => {
      this.selectedRows.delete(index);
      this.selectedRows.add(index - 1);
    });
  }


  deleteRow(rowIndex: number): void {
    this._deleteRow(rowIndex);
    this.tableAPI.deleteRows([rowIndex]);
  }


  deleteSelectedRow(): void {
    const rowsToDelete: number[] = Array.from(this.selectedRows).sort((a, b) => b - a);

    for (const rowIndex of rowsToDelete) {
      this._deleteRow(rowIndex);
    }

    this.tableAPI.deleteRows(rowsToDelete);
  }


  deleteColumn(columnIndex: number): void {
    this._deleteColumn(columnIndex);
    this.tableAPI.deleteColumns([columnIndex]);
  }


  private _deleteColumn(columnIndex: number): void {
    if (columnIndex < 0 || columnIndex >= this.getHeadersCellsAmount())
      return;

    this.headerCells.splice(columnIndex, 1);

    for (const row of this.table) {
      row.splice(columnIndex, 1);
    }

    if (this.isColumnSelected(columnIndex))
      this.deselectColumn(columnIndex);

    // è necessario perché quando si cancella una colonna le colonne a destra si spostano a sinistra di 1
    const indexesToUpdate: number[] = [];
    this.selectedColumns.forEach(index => {
      if (index > columnIndex) {
        indexesToUpdate.push(index);
      }
    });

    indexesToUpdate.forEach(index => {
      this.selectedColumns.delete(index);
      this.selectedColumns.add(index - 1);
    });
  }


  deleteSelectedColumn(): void {
    const columnsToDelete: number[] = Array.from(this.selectedColumns).sort((a, b) => b - a);

    for (const columnIndex of columnsToDelete) {
      this._deleteColumn(columnIndex);
    }

    this.tableAPI.deleteColumns(columnsToDelete);
  }


  // duplica la riga e la inserisce a sotto di rowIndex
  duplicateRow(rowIndex: number): void {
    if (rowIndex < 0 || rowIndex >= this.getRowsNumber())
      return;

    const clonedRow: Cell[] = [];

    for (let j: number = 0; j < this.getHeadersCellsAmount(); ++j)
      clonedRow.push(new Cell(this.getColumnDataType(j).getNewDataType(), this.table[rowIndex][j].value));

    this.table.splice(rowIndex + 1, 0, clonedRow);

    // è necessario perché quando si duplica una riga le righe al di sotto scendono di 1
    const indexesToUpdate: number[] = [];
    this.selectedRows.forEach(index => {
      if (index > rowIndex) {
        indexesToUpdate.push(index);
      }
    });

    indexesToUpdate.forEach(index => {
      this.selectedRows.delete(index);
      this.selectedRows.add(index + 1);
    });
  }


  // duplica la colonna e la inserisce a destra di columnIndex
  duplicateColumn(columnIndex: number): void {
    if (columnIndex < 0 || columnIndex >= this.getHeadersCellsAmount())
      return;

    this.headerCells.splice(
      columnIndex + 1,
      0,
      new HeaderCell(
        this.getHeaderCell(columnIndex).cellDataType.getNewDataType(),
        this.getHeaderCell(columnIndex).value,
        this.getHeaderCell(columnIndex).columnDataType.getNewDataType()
      )
    );

    for (let i: number = 0; i < this.getRowsNumber(); ++i)
      this.table[i].splice(columnIndex + 1, 0, new Cell(this.getColumnDataType(columnIndex).getNewDataType(), this.table[i][columnIndex].value));

    // è necessario perché quando si duplica una colonna le colonne a destra si spostano a destra di 1
    const indexesToUpdate: number[] = [];
    this.selectedColumns.forEach(index => {
      if (index > columnIndex) {
        indexesToUpdate.push(index);
      }
    });

    indexesToUpdate.forEach(index => {
      this.selectedColumns.delete(index);
      this.selectedColumns.add(index + 1);
    });
  }


  changeColumnDataType(columnIndex: number, newDataType: IDataType): void {
    if (columnIndex < 0 || columnIndex >= this.getHeadersCellsAmount())
      return;

    const currentDataType: IDataType = this.getColumnDataType(columnIndex);

    if (currentDataType instanceof newDataType.constructor)
      return;

    this.headerCells[columnIndex] = new HeaderCell(
      new TextualDataType(), this.HEADER_CELL_DEFAULT_NAME, newDataType.getNewDataType()
    );

    for (let i: number = 0; i < this.getRowsNumber(); ++i) {
      this.table[i][columnIndex] = new Cell(newDataType.getNewDataType(), null);
    }

    this.tableAPI.changeColumnDataType(columnIndex, newDataType.getDataTypeId());
  }


  getCellFromCoords(cord: CellCord): Cell | null {
    if (cord.j < 0 || cord.j >= this.getHeadersCellsAmount())
      return null;

    if (!cord.isHeaderCell && cord.i < 0 || cord.i >= this.getRowsNumber())
      return null;

    return cord.isHeaderCell ?
      this.getHeaderCell(cord.j) :
      this.getCell(cord.i, cord.j);
  }


  setCellValue(cord: CellCord, value: any): void {
    if (value !== null) {
      const clickedCell: Cell | null = this.getCellFromCoords(cord);

      if (clickedCell === null)
        return;

      let updatedCells: Pair<CellCord, any>[] = [];

      if (!this.isRowSelected(cord.i) && !this.isColumnSelected(cord.j)) {
        clickedCell.value = value;
        updatedCells.push(new Pair(cord, value));
      }
      else {
        this.doForEachRowSelected((i: number): void => {
          const row: Cell[] = this.getRow(i);

          for (let j: number = 0; j < row.length; ++j) {
            if (clickedCell.cellDataType.constructor === row[j].cellDataType.constructor) {
              row[j].value = value;
              updatedCells.push(new Pair(new CellCord(i, j), value));
            }
          }
        });

        this.doForEachColumnSelected((j: number): void => {
          const column: Cell[] = this.getColumn(j);

          for (let i: number = 0; i < column.length; ++i) {
            // per settare i valori delle colonne che hanno lo stesso tipo di dato della cella selezionata
            if (clickedCell.cellDataType.constructor !== column[i].cellDataType.constructor)
              break;

            column[i].value = value;
            updatedCells.push(new Pair(new CellCord(i, j), value));
          }
        });
      }

      for (let updatedCell of updatedCells) {
        this.tableAPI.updateCellValue(updatedCell.first.i, updatedCell.first.j, updatedCell.second);
      }
    }
  }


  loadFromTableDTO(tableDTO: TableDTO): void {
    for (let columnDTO of tableDTO.header) {
      this.headerCells.push(
        new HeaderCell(
          new TextualDataType(),
          columnDTO.columnName || this.HEADER_CELL_DEFAULT_NAME,
          this.dataTypeService.convertIntoIDataType(columnDTO.dataType || 1)
        )
      )
    }

    for (let row of tableDTO.content) {
      this.table.push([])

      for (let j: number = 0; j < row.length; ++j) {
        this.table[this.getRowsNumber() - 1].push(new Cell(this.headerCells[j].columnDataType.getNewDataType(), row[j]));
      }
    }
  }


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
