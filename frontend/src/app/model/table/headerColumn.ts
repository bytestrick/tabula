import {HeaderCell} from './header-cell';
import {IDataType} from '../data-types/i-data-type';


export class HeaderColumn {

  private readonly _id: string;
  private cell: HeaderCell;


  constructor(id: string, headerCell: HeaderCell) {
    this.cell = headerCell;
    this._id = id;
  }


  getColumnDataType(): IDataType {
    return this.cell.columnDataType;
  }


  getHeaderCell(): HeaderCell {
    return this.cell;
  }


  getColumnName(): string {
    return this.cell.value || '';
  }


  get id(): string {
    return this._id;
  }
}
