import {IDataType} from '../data-types/i-data-type';
import {TextualDataType} from '../data-types/concrete-data-type/textual-data-type';
import {moveItemInArray} from '@angular/cdk/drag-drop';
import {HeaderCell} from './header-cell';
import {Cell} from './cell';

export class Table {

  private table: Cell[][] = [];
  private headerCells: HeaderCell[] = [];

  private rowsSelected: Set<number> = new Set<number>;
  private columnsSelected: Set<number> = new Set<number>;

  private readonly HEADER_CELL_DEFAULT_NAME: string = 'New Column';


  addNewHeader(dataType: IDataType): void {
    this.headerCells.push(new HeaderCell(new TextualDataType(), this.HEADER_CELL_DEFAULT_NAME, dataType));

    for (let i: number = 0; i < this.getRowsNumber(); ++i) {
      while (this.table[i].length < this.getHeadersCellsAmount()) {
        const currentDataType: IDataType = this.headerCells[this.table[i].length].columnDataType;
        this.table[i].push(new Cell(currentDataType.getNewDataType(), null));
      }
    }
  }


  addNewRow(): void {
    this.table.push([]);
    const lastRowI: number = this.getRowsNumber() - 1;

    for (let i: number = 0; i < this.getHeadersCellsAmount(); ++i) {
      this.table[lastRowI].push(new Cell(this.headerCells[i].columnDataType.getNewDataType(), null));
    }
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
    }
  }


  insertNewDataTypeAt(colIndex: number, dataType: IDataType): void {
    if (colIndex >= 0 && colIndex < this.getHeadersCellsAmount()) {
      this.headerCells.splice(colIndex, 0, new HeaderCell(new TextualDataType(), this.HEADER_CELL_DEFAULT_NAME, dataType));

      for (let i: number = 0; i < this.getRowsNumber(); ++i) {
        this.table[i].splice(colIndex, 0, new Cell(this.headerCells[colIndex].columnDataType.getNewDataType(), null));
      }
    }
  }


  getRows(): Cell[][] {
    return this.table;
  }


  moveColumn(fromIndex: number, toIndex: number): void {
    if (fromIndex < 0 || fromIndex >= this.getHeadersCellsAmount())
      return;

    if (toIndex < 0 || toIndex >= this.getHeadersCellsAmount())
      return;

    if (fromIndex === toIndex)
      return;

    for (let row of this.table) {
      moveItemInArray(row, fromIndex, toIndex);
    }

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


  moveRow(fromIndex: number, toIndex: number): void {
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


  // TODO: Sposta in blocco le righe selezionate, inserendole a partire da toIndex.
  moveSelectedRows(toIndex: number): void {
  }

// TODO: Sposta in blocco le colonne selezionate, inserendole a partire da toIndex.
  moveSelectedColumns(toIndex: number): void {
  }


  getColumn(colIndex: number, limit: number = this.getRowsNumber()): Cell[] {
    if (limit <= 0 || colIndex < 0 || colIndex >= this.getHeadersCellsAmount())
      return [];

    const col: Cell[] = [];

    for (let i: number = 0; i < Math.min(this.getRowsNumber(), limit); ++i)
      col.push(this.table[i][colIndex]);

    return col;
  }


  getRow(rowIndex: number, limit: number = this.getHeadersCellsAmount()): Cell[] {
    if (limit <= 0 || rowIndex < 0 || rowIndex >= this.getRowsNumber())
      return [];

    return this.table[rowIndex].slice(0, Math.min(this.getHeadersCellsAmount(), limit));
  }


  getColDataType(colIndex: number): IDataType {
    return this.headerCells[colIndex].columnDataType;
  }


  selectRow(rowIndex: number): void {
    this.rowsSelected.add(rowIndex);
  }


  deselectRow(rowIndex: number): void {
    this.rowsSelected.delete(rowIndex);
  }


  selectColumn(columnIndex: number): void {
    this.columnsSelected.add(columnIndex);
  }


  deselectColumn(columnIndex: number): void {
    this.columnsSelected.delete(columnIndex);
  }


  isColumnSelected(columnIndex: number): boolean {
    return this.columnsSelected.has(columnIndex);
  }


  isRowSelected(rowIndex: number): boolean {
    return this.rowsSelected.has(rowIndex);
  }


  hasRowsSelected(): boolean {
    return this.rowsSelected.size !== 0;
  }


  hasColumnSelected(): boolean {
    return this.columnsSelected.size !== 0;
  }


  doForEachRowSelected(fn: (rowIndex: number) => void): void {
    this.rowsSelected.forEach(fn);
  }


  doForEachColumnSelected(fn: (columnIndex: number) => void): void {
    this.columnsSelected.forEach(fn);
  }


  getCell(rowIndex: number, columnIndex: number): Cell {
    return this.table[rowIndex][columnIndex];
  }


  getHeaderCell(columnIndex: number): HeaderCell {
    return this.headerCells[columnIndex];
  }


  deleteRow(rowIndex: number): void {
    if (rowIndex < 0 || rowIndex >= this.getRowsNumber())
      return;

    this.table.splice(rowIndex, 1);

    if (this.isRowSelected(rowIndex))
      this.deselectRow(rowIndex);
  }


  deleteSelectedRow(): void {
    const rowsToDelete = Array.from(this.rowsSelected).sort((a, b) => b - a);
    for (const rowIndex of rowsToDelete) {
      this.deleteRow(rowIndex);
    }

    this.rowsSelected.clear();
  }


  deleteColumn(columnIndex: number): void {
    if (columnIndex < 0 || columnIndex >= this.getHeadersCellsAmount())
      return;

    this.headerCells.splice(columnIndex, 1);

    for (const row of this.table) {
      row.splice(columnIndex, 1);
    }

    if (this.isColumnSelected(columnIndex))
      this.deselectColumn(columnIndex);
  }


  deleteSelectedColumn(): void {
    const colsToDelete = Array.from(this.columnsSelected).sort((a, b) => b - a);
    for (const colIndex of colsToDelete) {
      this.deleteColumn(colIndex);
    }

    this.columnsSelected.clear();
  }


  duplicateRow(rowIndex: number): void {
    if (rowIndex < 0 || rowIndex >= this.getRowsNumber())
      return;

    const clonedRow: Cell[] = [];

    for (let j: number = 0; j < this.getHeadersCellsAmount(); ++j)
      clonedRow.push(new Cell(this.getColDataType(j).getNewDataType(), this.table[rowIndex][j].value));

    this.table.splice(rowIndex, 0, clonedRow);
  }


  duplicateColumn(columnIndex: number): void {
    if (columnIndex < 0 || columnIndex >= this.getHeadersCellsAmount())
      return;

    this.headerCells.splice(
      columnIndex,
      0,
      new HeaderCell(
        this.getHeaderCell(columnIndex).cellDataType.getNewDataType(),
        this.getHeaderCell(columnIndex).value,
        this.getHeaderCell(columnIndex).columnDataType.getNewDataType()
      )
    );

    for (let i: number = 0; i < this.getRowsNumber(); ++i)
      this.table[i].splice(columnIndex, 0, new Cell(this.getColDataType(columnIndex).getNewDataType(), this.table[i][columnIndex].value));
  }
}
