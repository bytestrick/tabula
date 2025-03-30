import {Cell} from './cell';
import {IDataType} from '../data-types/i-data-type';

export class HeaderCell extends Cell {

  // Tipo di dato lungo la collna della cella corrispondente.
  private _columnDataType: IDataType;



  constructor(cellDataType: IDataType, value: any, columnDataType: IDataType) {
    super(cellDataType, value);
    this._columnDataType = columnDataType;
  }



  get columnDataType(): IDataType {
    return this._columnDataType;
  }


  set columnDataType(value: IDataType) {
    this._columnDataType = value;
  }
}
