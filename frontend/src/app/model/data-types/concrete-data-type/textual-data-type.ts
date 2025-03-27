import {IDataType} from '../i-data-type';
import { BaseInputComponent } from '../../../components/input-components/base-input-component';
import {Type} from '@angular/core';
import {TextualInputComponent} from '../../../components/input-components/textual-input/textual-input.component';
import {BaseCellComponent} from '../../../components/table/cells/base-cell-component';
import {TextualCellComponent} from '../../../components/table/cells/textual-cell/textual-cell.component';

export class TextualDataType implements IDataType {

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
