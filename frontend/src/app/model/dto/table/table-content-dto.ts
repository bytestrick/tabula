import {ColumnDTO} from './column-dto';
import {RowDTO} from './row-dto';

/**
 * Represents a full table fetched from the backend, including its columns and rows.
 *
 * @property id
 *   UUID of the table.
 * @property header
 *   Array of {@link ColumnDTO} describing each header column.
 * @property content
 *   Array of {@link RowDTO} containing the table rows and their cell values.
 */
export interface TableContentDTO {
  id: string,
  header: ColumnDTO[],
  content: RowDTO[]
}
