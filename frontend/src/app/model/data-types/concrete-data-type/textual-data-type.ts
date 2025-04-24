import {IDataType} from '../i-data-type';
import { BaseInputComponent } from '../../../table-components/input-components/base-input-component';
import {Type} from '@angular/core';
import {TextualInputComponent} from '../../../table-components/input-components/textual-input/textual-input.component';
import {BaseCellComponent} from '../../../table-components/table/cells/base-cell-component';
import {TextualCellComponent} from '../../../table-components/table/cells/textual-cell/textual-cell.component';

export class TextualDataType implements IDataType {

  getDataTypeId(): number {
    return 1;
  }


  getInputComponent(): Type<BaseInputComponent> {
    return TextualInputComponent;
  }


  getNewDataType(): IDataType {
    return new TextualDataType();
  }


  getCellComponent(): Type<BaseCellComponent> {
    return TextualCellComponent;
  }


  getIconName(): string {
    return 'bi-fonts';
  }


  getDataTypeName(): string {
    return 'Textual';
  }
}
