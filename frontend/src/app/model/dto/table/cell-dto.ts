/**
 * Represents the value of a single cell within a table row.
 *
 * @property tableId
 *   UUID of the table containing this cell.
 * @property rowIndex
 *   Zero-based index of the row to which this cell belongs.
 * @property columnIndex
 *   Zero-based index of the column to which this cell belongs.
 * @property value
 *   The cell’s content as a string. May be empty if the cell has no value.
 */
export interface CellDTO {
  tableId: string,
  rowIndex: number,
  columnIndex: number,
  value: string
}

/**
 * Payload sent from the frontend to the backend to update a single cell’s value.
 *
 * Only the `value` field is required; the backend will apply this new value
 * to the targeted cell. Other cell attributes remain unchanged.
 *
 * @property value
 *   The new content for the cell. An empty string represents a blank cell.
 */
export interface CellPatchDTO {
  value: string
}


/**
 * Interface representing an updated cell.
 * Used to return information about the changed cell to the frontend.
 *
 * @property rowIndex
 *  The rowIndex of the updated cell.
 * @property columnIndex
 *  The columnIndex of the updated cell.
 * @property value
 *  The new value of the updated cell.
 */
export interface CellPatchedDTO {
  rowIndex: number,
  columnIndex: number,
  value: string
}
