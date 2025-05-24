import {Type} from '@angular/core';
import {BaseInputComponent} from '../../../table-components/input-components/base-input-component';
import {BaseCellComponent} from '../../../table-components/table/cells/base-cell-component';
import {IDataType} from '../i-data-type';
import {DataTypeRegistryService} from '../../../services/data-type-registry.service';
import {MapInputComponent} from '../../../table-components/input-components/map-input/map-input.component';
import {MapCellComponent} from '../../../table-components/table/cells/map-cell/map-cell.component';


export class MapDataType implements IDataType {
  getDataTypeId(): number {
    return DataTypeRegistryService.MAP_ID;
  }

  getInputComponent(): Type<BaseInputComponent> {
    return MapInputComponent;
  }

  getNewDataType(): IDataType {
    return new MapDataType();
  }

  getCellComponent(): Type<BaseCellComponent> {
    return MapCellComponent;
  }

  getIconName(): string {
    return 'bi-geo-alt';
  }

  getDataTypeName(): string {
    return 'Map';
  }
}
