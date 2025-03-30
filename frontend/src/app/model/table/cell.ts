import {ComponentRef} from '@angular/core';
import {IDataType} from '../data-types/i-data-type';
import {BaseCellComponent} from '../../components/table/cells/base-cell-component';

export class Cell {

  protected _cellRef: ComponentRef<BaseCellComponent> | null = null;
  protected _cellDataType: IDataType;
  protected _value: any = null;



  constructor(cellDataType: IDataType, value: any) {
    this._cellDataType = cellDataType;
    this._value = value;
  }



  get cellRef(): ComponentRef<BaseCellComponent> | null {
    return this._cellRef;
  }


  set cellRef(value: ComponentRef<BaseCellComponent> | null) {
    this._cellRef = value;
  }


  get cellDataType(): IDataType {
    return this._cellDataType;
  }


  set cellDataType(value: IDataType) {
    this._cellDataType = value;
  }


  get value(): any {
    return this._value === null ? this.cellRef?.instance.getValue() : this._value;
  }


  set value(value: any) {
    this._value = value;
    this.cellRef?.instance.setValue(value);
  }
}
