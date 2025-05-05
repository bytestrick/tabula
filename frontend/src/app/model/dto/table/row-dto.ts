import {CellDTO} from './cell-dto';


export interface RowDTO {
  id: string,
  tableId: string,
  cells: CellDTO[]
}


/**
 * Payload sent from the frontend to request creation of a new row in a table.
 *
 * @property rowIndex
 *   Zero-based position at which to insert the new row.
 *   Set to `null` to append the row at the end of the table.
 */
export interface RowCreateDTO {
  rowIndex: number | null;
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
 */
export interface RowCreatedDTO {
  id: string;
  tableId: string;
  rowIndex: number;
}


/**
 * Payload sent from the frontend to delete rows on the backend.
 *
 * @property ids - Array of row UUIDs identifying which rows to delete.
 */
export interface RowsDeleteDTO {
  ids: string[]
}


/**
 * Response returned by the backend containing the indexes of rows deleted.
 *
 * @property indexes - Array of numeric positions corresponding to deleted rows.
 */
export interface RowsDeletedDTO {
  indexes: number[]
}
