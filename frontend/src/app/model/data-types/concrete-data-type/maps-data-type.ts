import { Type } from '@angular/core';
import { BaseInputComponent } from '../../../table-components/input-components/base-input-component';
import { BaseCellComponent } from '../../../table-components/table/cells/base-cell-component';
import {IDataType} from '../i-data-type';
import {TextualCellComponent} from '../../../table-components/table/cells/textual-cell/textual-cell.component';
import {DataTypeRegistryService} from '../../../services/data-type-registry.service';
import {MapsInputComponent} from '../../../table-components/input-components/maps-input/maps-input.component';


export class MapsDataType implements IDataType {

  getDataTypeId(): number {
    return DataTypeRegistryService.MAPS_ID;
  }

  getInputComponent(): Type<BaseInputComponent> {
    return MapsInputComponent;
  }


  getNewDataType(): IDataType {
    return new MapsDataType();
  }


  getCellComponent(): Type<BaseCellComponent> {
    return TextualCellComponent;
  }


  getIconName(): string {
    return 'bi-geo-alt';
  }


  getDataTypeName(): string {
    return 'Maps';
  }
}
