import { Type } from '@angular/core';
import { BaseInputComponent } from '../../components/input-components/base-input-component';
import { BaseCellComponent } from '../../components/table/cells/base-cell-component';
import {DataType} from '../data-type';

export class NumericDataType extends DataType {

  override getInputComponent(): Type<BaseInputComponent> {
    throw new Error('Method not implemented.');
  }


  override getNewDataType(): DataType {
    return new NumericDataType();
  }


  override getCellComponent(): Type<BaseCellComponent> {
    throw new Error('Method not implemented.');
  }


  override getIconName(): string {
    return 'bi-123';
  }
}
