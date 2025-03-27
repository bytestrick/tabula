import { Injectable } from '@angular/core';
import {IDataType} from '../model/data-types/i-data-type';
import {TextualDataType} from '../model/data-types/concrete-data-type/textual-data-type';
import {NumericDataType} from '../model/data-types/concrete-data-type/numeric-data-type';


@Injectable({
  providedIn: 'root'
})
export class DataTypeRegistryService {

  private dataTypes: IDataType[] = [
    new TextualDataType(),
    new NumericDataType(),
  ];


  constructor() {}


  getDataTypes(): IDataType[] {
    return this.dataTypes;
  }
}
