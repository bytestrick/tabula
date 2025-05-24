import {ComponentRef} from '@angular/core';
import {IDataType} from '../data-types/i-data-type';
import {BaseCellComponent} from '../../table-components/table/cells/base-cell-component';

/**
 * Represents a generic cell in the table, holding a value and a reference
 * to its rendered component instance.
 */
export class Cell {
  /** Reference to the Angular component that renders this cell (if any). */
  protected _cellRef: ComponentRef<BaseCellComponent> | null = null;
  /** The data type logic that drives validation, formatting, and editing UI. */
  protected _cellDataType: IDataType;
  /** The current string value of the cell; `null` represents a blank cell. */
  protected _value: string = '';

  /**
   * Constructs a new Cell instance.
   *
   * @param cellDataType  The IDataType instance defining how this cell’s data is handled.
   * @param value         The initial value for the cell; may be any type, but stored as string.
   */
  constructor(cellDataType: IDataType, value: string = '') {
    this._cellDataType = cellDataType;
    this.value = value;
  }

  /**
   * Gets the Angular component reference for this cell.
   *
   * @returns The ComponentRef of the cell’s BaseCellComponent, or `null` if not rendered.
   */
  get cellRef(): ComponentRef<BaseCellComponent> | null {
    return this._cellRef;
  }

  /**
   * Sets the Angular component reference for this cell.
   *
   * @param value  The ComponentRef<BaseCellComponent> to associate, or `null` to clear.
   */
  set cellRef(value: ComponentRef<BaseCellComponent> | null) {
    this._cellRef = value;
  }

  /**
   * Gets the data type logic for this cell.
   *
   * @returns The IDataType instance used for formatting and validation.
   */
  get cellDataType(): IDataType {
    return this._cellDataType;
  }

  /**
   * Changes the data type logic for this cell.
   *
   * @param value  The new IDataType instance to apply.
   */
  set cellDataType(value: IDataType) {
    this._cellDataType = value;
  }

  /**
   * Gets the current value of the cell.
   *
   * @returns The cell’s string value, or `''` if blank.
   */
  get value(): string {
    return this._value;
  }

  /**
   * Updates the cell’s value and notifies its component (if mounted).
   *
   * @param value  The new value to set; `''` clears the cell.
   */
  set value(value: string) {
    this._value = value;
    // If the cell component is rendered, update its displayed value
    this.cellRef?.instance.setValue(value);
  }
}
