/**
 * Payload for moving rows or columns within a table.
 *
 * @property idsToMove
 *   UUIDs of rows or columns to move.
 * @property fromIndex
 *   Starting zero-based index from which to move.
 * @property toIndex
 *   Target zero-based index to which items should be moved.
 */
export interface MoveRowOrColumnDto {
  idsToMove: string[],
  fromIndex: number
  toIndex: number
}


/**
 * Response returned after moving rows or columns, indicating which indexes were moved and by what offset.
 *
 * @property indexes
 *   Zero-based indexes of items that were moved.
 * @property delta
 *   Offset (delta) by which each moved item shifted.
 */
export interface MovedRowsOrColumnsDTO {
  indexes: number[],
  delta: number
}
