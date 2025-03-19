import {DataType} from './data-type';
import {TextualDataType} from './concrete-data-type/textual-data-type';
import {moveItemInArray} from '@angular/cdk/drag-drop';
import {HeaderCell} from './header-cell';
import {Cell} from './cell';

export class Table {

  private table: Cell[][] = [];
  private headerCells: HeaderCell[] = [];


  addNewHeader(dataType: DataType): void {
    this.headerCells.push(new HeaderCell(new TextualDataType(), null, dataType));

    for (let i: number = 0; i < this.getRowsNumber(); ++i) {
      while (this.table[i].length < this.getHeadersCellsAmount()) {
        const currentDataType: DataType = this.headerCells[this.table[i].length].columnDataType;
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


  insertNewDataTypeAt(colIndex: number, dataType: DataType): void {
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
    for (let row of this.table) {
      moveItemInArray(row, fromIndex, toIndex);
    }

    moveItemInArray(this.headerCells, fromIndex, toIndex);
  }


  swapRow(fromIndex: number, toIndex: number): void {
    moveItemInArray(this.table, fromIndex, toIndex);
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


  getColDataType(colIndex: number): DataType {
    return this.headerCells[colIndex].columnDataType;
  }
}
