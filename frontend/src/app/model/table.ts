import {DataType} from './data-type';
import {Pair} from './pair';
import {TextualDataType} from './concrete-data-type/textual-data-type';
import {moveItemInArray} from '@angular/cdk/drag-drop';

export class Table {

  private table: DataType[][] = [];

  // first: il tipo di dato scelto per la cella.
  // second: il tipo di dato scelto per la colonna corrispondente.
  private dataTypes: Pair<DataType, DataType>[] = [];


  addNewDataType(dataType: DataType): void {
    this.dataTypes.push(new Pair(new TextualDataType(), dataType));

    for (let i: number = 0; i < this.getRowsNumber(); ++i) {
      while (this.table[i].length < this.getDataTypesAmount()) {
        const currentDataType: DataType = this.dataTypes[this.table[i].length].second;
        this.table[i].push(currentDataType.getNewDataType())
      }
    }
  }


  addNewRow(): void {
    this.table.push([]);
    const lastRowI: number = this.getRowsNumber() - 1;

    for (let i: number = 0; i < this.getDataTypesAmount(); ++i) {
      this.table[lastRowI].push(this.dataTypes[i].second.getNewDataType());
    }
  }


  getRowsNumber(): number {
    return this.table.length;
  }


  getDataTypesAmount(): number {
    return this.dataTypes.length;
  }


  getDataTypes(): Pair<DataType, DataType>[] {
    return this.dataTypes;
  }


  insertNewRowAt(rowIndex: number): void {
    if (rowIndex >= 0 && rowIndex < this.getRowsNumber()) {
      this.table.splice(rowIndex, 0, []);

      for (let i: number = 0; i < this.getDataTypesAmount(); ++i)
        this.table[rowIndex].push(this.dataTypes[i].second.getNewDataType());
    }
  }


  insertNewDataTypeAt(colIndex: number, dataType: DataType): void {
    if (colIndex >= 0 && colIndex < this.getDataTypesAmount()) {
      this.dataTypes.splice(colIndex, 0, new Pair(new TextualDataType(), dataType));

      for (let i: number = 0; i < this.getRowsNumber(); ++i) {
        this.table[i].splice(colIndex, 0, this.dataTypes[colIndex].second.getNewDataType());
      }
    }
  }


  getRows(): DataType[][] {
    return this.table;
  }


  swapCol(fromIndex: number, toIndex: number): void {
    for (let row of this.table) {
      moveItemInArray(row, fromIndex, toIndex);
    }

    moveItemInArray(this.dataTypes, fromIndex, toIndex);
  }


  swapRow(fromIndex: number, toIndex: number): void {
    moveItemInArray(this.table, fromIndex, toIndex);
    console.log(fromIndex, ' ', toIndex);
  }


  getCol(colIndex: number, limit: number): DataType[] {
    if (limit <= 0 || colIndex < 0 || colIndex >= this.getDataTypesAmount())
      return [];

    const col: DataType[] = [];

    for (let i: number = 0; i < Math.min(this.getRowsNumber(), limit); ++i)
      col.push(this.table[i][colIndex]);

    return col;
  }


  getRow(rowIndex: number, limit: number): DataType[] {
    if (limit <= 0 || rowIndex < 0 || rowIndex >= this.getRowsNumber())
      return [];

    return this.table[rowIndex].slice(0, Math.min(this.getDataTypesAmount(), limit));
  }


  getDataType(colIndex: number): DataType {
    return this.dataTypes[colIndex].second;
  }
}
