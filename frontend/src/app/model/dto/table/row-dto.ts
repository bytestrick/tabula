import {CellDTO} from './cell-dto';

/**
 * Represents a table row and its cells.
 *
 * @property id
 *   UUID of the row.
 * @property tableId
 *   UUID of the table to which this row belongs.
 * @property cells
 *   Array of cells contained in this row. {@link CellDTO}
 */
export interface RowDTO {
  id: string,
  tableId: string,
  cells: CellDTO[]
}

/**
 * Payload sent from the frontend to request creation of a new row.
 *
 * @property rowIndex
 *   Zero-based position at which to insert or duplicate the new row.
 *   Set to `null` to append at the end.
 * @property duplicateFlag
 *   When `true` and `rowIndex` is non-null, the new row
 *   will be a duplicate of the existing row at that index.
 *   Otherwise, an empty row is inserted there.
 */
export interface RowCreateDTO {
  rowIndex: number | null,
  duplicateFlag: boolean
}

/**
 * Response returned by the backend after successfully creating a new row.
 *
 * @property id
 *   UUID of the newly created row.
 * @property tableId
 *   UUID of the table to which the new row belongs.
 * @property rowIndex
 *   Zero-based position where the new row was inserted.
 * @property cellsValues
 *   List of cells' values for this row; empty if the row was created empty.
 */
export interface RowCreatedDTO {
  id: string,
  tableId: string,
  rowIndex: number,
  cellsValues: string[]
}

/**
 * Payload sent from the frontend to delete one or more rows.
 *
 * @property ids
 *   Array of row UUIDs identifying which rows to delete.
 */
export interface RowsDeleteDTO {
  ids: string[]
}

/**
 * Response returned by the backend containing the zero-based indexes of deleted rows.
 *
 * @property indexes
 *   Positions of the rows that were deleted.
 */
export interface RowsDeletedDTO {
  indexes: number[]
}
