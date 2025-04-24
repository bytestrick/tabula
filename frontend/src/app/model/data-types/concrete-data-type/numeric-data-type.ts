import { Type } from '@angular/core';
import { BaseInputComponent } from '../../../table-components/input-components/base-input-component';
import { BaseCellComponent } from '../../../table-components/table/cells/base-cell-component';
import {IDataType} from '../i-data-type';
import {TextualCellComponent} from '../../../table-components/table/cells/textual-cell/textual-cell.component';
import {NumericInputComponent} from '../../../table-components/input-components/numeric-input/numeric-input.component';

export class NumericDataType implements IDataType {

  getDataTypeId(): number {
    return 2;
  }


  getInputComponent(): Type<BaseInputComponent> {
    return NumericInputComponent;
  }


  getNewDataType(): IDataType {
    return new NumericDataType();
  }


  getCellComponent(): Type<BaseCellComponent> {
    return TextualCellComponent;
  }


  getIconName(): string {
    return 'bi-123';
  }


  getDataTypeName(): string {
    return 'Numeric';
  }
}
