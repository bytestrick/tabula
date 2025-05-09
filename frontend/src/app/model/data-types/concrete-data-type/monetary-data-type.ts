import { Type } from '@angular/core';
import { BaseInputComponent } from '../../../table-components/input-components/base-input-component';
import { BaseCellComponent } from '../../../table-components/table/cells/base-cell-component';
import {IDataType} from '../i-data-type';
import {MonetaryInputComponent} from '../../../table-components/input-components/monetary-input/monetary-input.component';
import {TextualCellComponent} from '../../../table-components/table/cells/textual-cell/textual-cell.component';
import {DataTypeRegistryService} from '../../../services/data-type-registry.service';


export class MonetaryDataType implements IDataType {

  getDataTypeId(): number {
    return DataTypeRegistryService.MONETARY_ID;
  }

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
