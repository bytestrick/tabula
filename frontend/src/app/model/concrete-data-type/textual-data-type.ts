import {IDataType} from '../data-type.interface';
import { BaseInputComponent } from '../../components/input-components/base-input-component';
import {Renderer2, Type} from '@angular/core';
import {TextInputComponent} from '../../components/input-components/text-input/text-input.component';
import {BaseCellComponent} from '../../components/table/cells/base-cell-component';
import {TextualCellComponent} from '../../components/table/cells/textual-cell/textual-cell.component';
import {DataTypeCellComponent} from '../../components/table/cells/data-type-cell/data-type-cell.component';

export class TextualDataType implements IDataType {

  constructor(private renderer: Renderer2) {}


  getInputComponent(): Type<BaseInputComponent> {
    return TextInputComponent;
  }


  getNewDataType(): IDataType {
    throw new Error('Method not implemented.');
  }


  getDataTypeIcon(): Type<BaseCellComponent> {
    return DataTypeCellComponent;
  }


  getCellComponent(): Type<BaseCellComponent> {
    return TextualCellComponent;
  }
}
