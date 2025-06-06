import {Cell} from './cell';
import {IDataType} from '../data-types/i-data-type';


export class Row {

  private readonly _id: string;
  private row: Cell[] = [];


  constructor(id: string) {
    this._id = id;
  }


  public appendNewCell(newDataType: IDataType, value: string = ''): void {
      this.row.push(new Cell(newDataType, value));
  }


  getLength(): number {
    return this.row.length;
  }


  insertNewCellAt(index: number, newDataType: IDataType, value: string = ''): void {
    this.row.splice(index, 0, new Cell(newDataType, value));
  }


  getCells(): Cell[] {
    return this.row;
  }


  getCell(index: number): Cell {
    return this.row[index];
  }


  getCellValue(index: number): any {
    return this.getCell(index).value
  }


  deleteCell(index: number): void {
    this.row.splice(index, 1);
  }


  replaceCell(index: number, cell: Cell): void {
    this.row[index] = cell;
  }


  get id(): string {
    return  this._id;
  }


  setCellValue(columnIndex: number, value: string): void {
    this.row[columnIndex].value = value;
  }
}
