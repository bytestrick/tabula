import {Cell} from './cell';
import {IDataType} from '../data-types/i-data-type';
import {TextualDataType} from '../data-types/concrete-data-type/textual-data-type';

/**
 * Represents a header cell in the table, extending the base `Cell` class.
 * A header cell has its own column-wide data type (`columnDataType`),
 * as well as the standard cell-level data type (`cellDataType`) and value.
 */
export class HeaderCell extends Cell {
  /** The data-type that applies to the entire column. */
  private readonly _columnDataType: IDataType;

  /**
   * Constructs a new HeaderCell.
   *
   * @param columnName      The display name of the column (also used as the cell’s value).
   * @param columnDataType  The data type to be used for all cells in this column.
   * @param cellDataType    (Optional) The data-type of the header cell itself.
   *                        Defaults to textual if not provided.
   */
  constructor(
    columnName: string,
    columnDataType: IDataType,
    cellDataType: IDataType = new TextualDataType()
  ) {
    super(cellDataType, columnName);
    this._columnDataType = columnDataType;
  }

  /**
   * Gets the data type assigned to this column.
   *
   * @returns The column’s data type (`IDataType`).
   */
  get columnDataType(): IDataType {
    return this._columnDataType;
  }
}
