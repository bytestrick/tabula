/**
 * Represents the value of a single cell within a table row.
 *
 * @property tableId
 *    UUID of the table containing this cell.
 * @property rowIndex
 *    Zero-based index of the row to which this cell belongs.
 * @property columnIndex
 *    Zero-based index of the column to which this cell belongs.
 * @property value
 *    The cell’s content as a string. May be empty if the cell has no value.
 */
export interface CellDTO {
  tableId: string;
  rowIndex: number;
  columnIndex: number;
  value: string;
}


/**
 * Payload sent from the frontend to update one or more cells’ values.
 *
 * If both `rowId` and `columnId` are provided, only the single matching cell is updated.
 * If only `rowId` is provided, all cells in that row are updated.
 * If only `columnId` is provided, all cells in that column are updated.
 *
 * @property rowId
 *   UUID of the target row. Optional: behavior depends on `columnId` when omitted.
 * @property columnId
 *   UUID of the target column. Optional: behavior depends on `rowId` when omitted.
 * @property dataTypeId
 *   Numeric code identifying the cell’s data type (e.g., 0 = Text, 1 = Numeric).
 * @property newValue
 *   The new content for the cell(s). An empty string represents a blank cell.
 */
export interface CellPatchDTO {
  rowId?: string
  columnId?: string
  dataTypeId: number
  newValue: string
}


/**
 * Returned by the backend to confirm a single cell update.
 *
 * @property rowIndex
 *   Zero-based row index of the updated cell.
 * @property columnIndex
 *   Zero-based column index of the updated cell.
 * @property value
 *   The new value of the updated cell.
 */
export interface CellPatchedDTO {
  rowIndex: number,
  columnIndex: number,
  value: string
}
