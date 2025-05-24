import {Directive, Input} from '@angular/core';
import {CellCord} from '../../../model/table/cell-cord';


@Directive()
export abstract class BaseCellComponent {

  private _value = '';

  @Input() protected cord!: CellCord;
  @Input()
    set value(value: string) {
      this.setValue(value);
    }
    get value(): string {
      return this.getValue();
    }


  setValue(value: string): void {
    this._value = value;
  }


  getValue(): string {
    return this._value;
  }
}
