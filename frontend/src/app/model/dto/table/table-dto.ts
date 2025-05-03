import {ColumnDTO} from './column-dto';
import {RowDTO} from './row-dto';

/**
 * Represents a full table fetched from the backend, including its columns and rows.
 *
 * @property id
 *   UUID of the table.
 * @property header
 *   Array of {@link ColumnDTO} describing each header's column (id, name, type, index).
 * @property content
 *   Array of {@link RowDTO} containing the rows of the table and their cell values.
 */
export interface TableDTO {
  id: string,
  header: ColumnDTO[],
  content: RowDTO[]
}
