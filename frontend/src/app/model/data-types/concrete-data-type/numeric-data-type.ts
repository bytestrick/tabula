import { Type } from '@angular/core';
import { BaseInputComponent } from '../../../components/input-components/base-input-component';
import { BaseCellComponent } from '../../../components/table/cells/base-cell-component';
import {IDataType} from '../i-data-type';
import {TextualCellComponent} from '../../../components/table/cells/textual-cell/textual-cell.component';
import {TextualInputComponent} from '../../../components/input-components/textual-input/textual-input.component';

export class NumericDataType implements IDataType {

  getInputComponent(): Type<BaseInputComponent> {
    return TextualInputComponent;
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
