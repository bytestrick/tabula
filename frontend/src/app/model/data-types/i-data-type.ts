import {BaseInputComponent} from '../../table-components/input-components/base-input-component';
import {Type} from '@angular/core';
import {BaseCellComponent} from '../../table-components/table/cells/base-cell-component';

export interface IDataType {

  getInputComponent(): Type<BaseInputComponent>;
  getNewDataType(): IDataType;
  getCellComponent(): Type<BaseCellComponent>; // Ritorna il tipo di componente che andrà messo come cella nella tabella.
  getIconName(): string;
  getDataTypeName(): string;
  getDataTypeId(): number;
}
