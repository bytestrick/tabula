import {Pair} from '../pair';

export class CellCord {

  private readonly _cord: Pair<number, number>;
  private readonly _isHeaderCell: boolean;


  constructor(i: number, j: number, isHeaderCell: boolean = false) {
    this._isHeaderCell = isHeaderCell;

    if (isHeaderCell)
      this._cord = new Pair(-1, j);
    else
      this._cord = new Pair(i, j);
  }


  get i(): number {
    return this._cord.first;
  }


  get j(): number {
    return this._cord.second;
  }


  get cord(): Pair<number, number> {
    return this._cord;
  }


  get isHeaderCell(): boolean {
    return this._isHeaderCell;
  }
}
