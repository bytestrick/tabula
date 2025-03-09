import {DataType} from '../data-type';
import { BaseInputComponent } from '../../components/input-components/base-input-component';
import {Type} from '@angular/core';
import {TextInputComponent} from '../../components/input-components/text-input/text-input.component';
import {BaseCellComponent} from '../../components/table/cells/base-cell-component';
import {TextualCellComponent} from '../../components/table/cells/textual-cell/textual-cell.component';

export class TextualDataType extends DataType {

  override getInputComponent(): Type<BaseInputComponent> {
    return TextInputComponent;
  }


  override getNewDataType(): DataType {
    return new TextualDataType();
  }


  override getCellComponent(): Type<BaseCellComponent> {
    return TextualCellComponent;
  }


  override getIconName(): string {
    return 'bi-fonts';
  }
}
