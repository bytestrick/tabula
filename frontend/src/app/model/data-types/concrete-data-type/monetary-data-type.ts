import { Type } from '@angular/core';
import { BaseInputComponent } from '../../../components/input-components/base-input-component';
import { BaseCellComponent } from '../../../components/table/cells/base-cell-component';
import {IDataType} from '../i-data-type';
import {MonetaryInputComponent} from '../../../components/input-components/monetary-input/monetary-input.component';
import {TextualCellComponent} from '../../../components/table/cells/textual-cell/textual-cell.component';


export class MonetaryDataType implements IDataType {

  getInputComponent(): Type<BaseInputComponent> {
    return MonetaryInputComponent;
  }


  getNewDataType(): IDataType {
    return new MonetaryDataType();
  }


  getCellComponent(): Type<BaseCellComponent> {
    return TextualCellComponent;
  }


  getIconName(): string {
    return 'bi-cash';
  }


  getDataTypeName(): string {
    return 'Monetary';
  }
}
