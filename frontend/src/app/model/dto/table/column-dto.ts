/**
 * Represents a header’s column within a table.
 *
 * @property id
 *   UUID of the column.
 * @property tableId
 *   UUID of the table to which this column belongs.
 * @property dataType
 *   Numeric code identifying the column’s data type (e.g., 0 = Textual, 1 = Numeric).
 * @property columnName
 *   The name of the column.
 * @property columnIndex
 *   Zero-based position of the column within the table.
 */
export interface ColumnDTO {
  id: string,
  tableId: string,
  dataType: number,
  columnName: string,
  columnIndex: number
}


export interface UpdateColumnIndexDTO {
  tableId: string,
  currentColumnIndex: number,
  newColumnIndex: number
}


export interface ColumnPatchDTO {
  columnName?: string,
  columnIndex?: number,
  dataTypeId?: number
}


/**
 * Payload sent from the frontend to request creation of a new column.
 *
 * @property dataTypeId
 *   Numeric code identifying the column’s data type; must be ≥ 0.
 * @property columnIndex
 *   Zero-based position at which to insert the new column.
 *   Set to `null` to append the column at the end of the table.
 */
export interface ColumnCreateDTO {
  dataTypeId: number,
  columnIndex: number | null
}


/**
 * Response returned by the backend after successfully creating a column.
 *
 * @property id
 *   UUID of the newly created column.
 * @property tableId
 *   UUID of the table to which the new column belongs.
 * @property dataTypeId
 *   Numeric code identifying the column’s data type; same as requested.
 * @property columnIndex
 *   Zero-based position where the new column was inserted.
 */
export interface ColumnCreatedDTO {
  id: string,
  tableId: string,
  dataTypeId: number,
  columnIndex: number
}


/**
 * Payload sent from the frontend to delete columns on the backend.
 *
 * @property ids - Array of row UUIDs identifying which columns to delete.
 */
export interface ColumnsDeleteDTO {
  ids: string[]
}


/**
 * Response returned by the backend containing the indexes of columns deleted.
 *
 * @property indexes - Array of numeric positions corresponding to deleted columns.
 */
export interface ColumnsDeletedDTO {
  indexes: number[]
}
