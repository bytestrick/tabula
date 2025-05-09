import {Pair} from '../pair';

/**
 * Represents the coordinates of a cell in the table, which can be either
 * a header cell or a body cell.
 */
export class CellCord {
  private readonly _cord: Pair<number, number>;
  private readonly _isHeaderCell: boolean;

  /**
   * Constructs a new CellCord.
   *
   * @param i              Zero-based row index for body cells. Ignored for header cells.
   * @param j              Zero-based column index.
   * @param isHeaderCell   If true, this represents a header cell and `i` is ignored.
   */
  constructor(i: number, j: number, isHeaderCell: boolean = false) {
    this._isHeaderCell = isHeaderCell;

    if (isHeaderCell) {
      // For header cells, we use -1 for the row index
      this._cord = new Pair(-1, j);
    }
    else {
      this._cord = new Pair(i, j);
    }
  }

  /**
   * Gets the row index of the cell.
   * For header cells, this will be -1.
   */
  get i(): number {
    if (this.isHeaderCell)
      throw new Error('\'isHeaderCell\' is true but you are accessing the row index.');

    return this._cord.first;
  }

  /**
   * Gets the column index of the cell.
   */
  get j(): number {
    return this._cord.second;
  }

  /**
   * Gets the underlying Pair representing [rowIndex, columnIndex].
   */
  get cord(): Pair<number, number> {
    return this._cord;
  }

  /**
   * Indicates whether this coordinate refers to a header cell.
   */
  get isHeaderCell(): boolean {
    return this._isHeaderCell;
  }
}
