import {BaseInputComponent} from '../components/input-components/base-input-component';
import {Type} from '@angular/core';
import {BaseCellComponent} from '../components/table/cells/base-cell-component';

export abstract class DataType {

  abstract getInputComponent(): Type<BaseInputComponent>;
  abstract getNewDataType(): DataType;
  abstract getCellComponent(): Type<BaseCellComponent>; // Ritorna il tipo di componente che andrà messo come cella nella tabella.
  abstract getIconName(): string;
}
