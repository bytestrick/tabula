import {Cell} from './cell';
import {DataType} from './data-type';

export class HeaderCell extends Cell {

  // Tipo di dato lungo la collna della cella corrispondente.
  private _columnDataType: DataType;



  constructor(cellDataType: DataType, value: any, columnDataType: DataType) {
    super(cellDataType, value);
    this._columnDataType = columnDataType;
  }



  get columnDataType(): DataType {
    return this._columnDataType;
  }


  set columnDataType(value: DataType) {
    this._columnDataType = value;
  }
}
