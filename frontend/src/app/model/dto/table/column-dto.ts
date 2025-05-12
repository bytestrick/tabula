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

/**
 * Payload sent from the frontend to update column properties.
 *
 * Only provide fields that need to be modified.
 *
 * @property columnName
 *   New name for the column. If omitted, the name remains unchanged.
 * @property columnIndex
 *   New zero-based index for the column. If omitted, index remains unchanged.
 * @property dataTypeId
 *   New data type code for the column. If omitted, type remains unchanged.
 */
export interface ColumnPatchDTO {
  columnName?: string,
  columnIndex?: number,
  dataTypeId?: number
}

/**
 * Response returned by the backend after a successful column update.
 *
 * @property id
 *   UUID of the updated column.
 * @property columnIndex
 *   Updated zero-based index of the column.
 * @property columnName
 *   Updated name of the column, if changed.
 * @property dataTypeId
 *   Updated data type code of the column, if changed.
 */
export interface ColumnPatchedDTO {
  id: string,
  columnIndex: number,
  columnName?: string
  dataTypeId?: number
}

/**
 * Payload sent from the frontend to request creation of a new column.
 *
 * @property dataTypeId
 *   Data type code for the new column; must be ≥ 0.
 * @property columnIndex
 *   Zero-based position to insert or duplicate the new column.
 *   Set to `null` to append at the end.
 * @property duplicateFlag
 *   When `true` and `columnIndex` is non-null, the new column
 *   will be a duplicate of the existing column at that index.
 *   Otherwise, an empty column is inserted there.
 */
export interface ColumnCreateDTO {
  dataTypeId: number,
  columnIndex: number | null,
  duplicateFlag: boolean
}

/**
 * Response returned by the backend after successfully creating a column.
 *
 * @property id
 *   UUID of the newly created column.
 * @property tableId
 *   UUID of the table to which the new column belongs.
 * @property dataTypeId
 *   Data-type id of the new column.
 * @property columnIndex
 *   Zero-based position where the new column was inserted.
 * @property columnName
 *   The name of the column.
 * @property cellsValues
 *   List of cells' values for this column; empty if the column was created empty.
 */
export interface ColumnCreatedDTO {
  id: string,
  tableId: string,
  dataTypeId: number,
  columnIndex: number,
  columnName: string,
  cellsValues: string[]
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
