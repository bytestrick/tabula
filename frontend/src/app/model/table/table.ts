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


  addNewHeader(dataType: IDataType): void {
    this.headerCells.push(new HeaderCell(new TextualDataType(), null, dataType));

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
      this.headerCells.splice(colIndex, 0, new HeaderCell(new TextualDataType(), null, dataType));

      for (let i: number = 0; i < this.getRowsNumber(); ++i) {
        this.table[i].splice(colIndex, 0, new Cell(this.headerCells[colIndex].columnDataType.getNewDataType(), null));
      }
    }
  }


  getRows(): Cell[][] {
    return this.table;
  }


  swapCol(fromIndex: number, toIndex: number): void {
    if (fromIndex < 0 || fromIndex >= this.getHeadersCellsAmount())
      return;

    if (toIndex < 0 || toIndex >= this.getHeadersCellsAmount())
      return;

    for (let row of this.table) {
      moveItemInArray(row, fromIndex, toIndex);
    }

    moveItemInArray(this.headerCells, fromIndex, toIndex);

    if (this.isColumnSelected(fromIndex) && !this.isColumnSelected(toIndex)) {
      this.columnsSelected.delete(fromIndex);
      this.columnsSelected.add(toIndex);
    }
    else if (!this.isColumnSelected(fromIndex) && this.isColumnSelected(toIndex)) {
      this.columnsSelected.delete(toIndex);
      this.columnsSelected.add(fromIndex);
    }
  }


  swapRow(fromIndex: number, toIndex: number): void {
    if (fromIndex < 0 || fromIndex >= this.getRowsNumber())
      return;

    if (toIndex < 0 || toIndex >= this.getRowsNumber())
      return;

    moveItemInArray(this.table, fromIndex, toIndex);

    if (this.isRowSelected(fromIndex) && !this.isRowSelected(toIndex)) {
      this.rowsSelected.delete(fromIndex);
      this.rowsSelected.add(toIndex);
    }
    else if (!this.isRowSelected(fromIndex) && this.isRowSelected(toIndex)) {
      this.rowsSelected.delete(toIndex);
      this.rowsSelected.add(fromIndex);
    }
  }


  getCol(colIndex: number, limit: number = this.getRowsNumber()): Cell[] {
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


  selectRow(value: boolean, rowIndex: number): void {
    if (value)
      this.rowsSelected.add(rowIndex);
    else
      this.rowsSelected.delete(rowIndex);
  }


  selectColumn(value: boolean, columnIndex: number): void {
    if (value)
      this.columnsSelected.add(columnIndex);
    else
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
}
