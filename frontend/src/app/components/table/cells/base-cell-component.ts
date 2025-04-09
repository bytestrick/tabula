import {Directive, Input} from '@angular/core';
import {CellCord} from '../../../model/table/cell-cord';


@Directive()
export abstract class BaseCellComponent {

  @Input() protected value: string | null = null;
  @Input() protected cord!: CellCord;


  setValue(value: string | null): void {
    this.value = value
  }


  getValue(): string | null {
    return this.value;
  }
}
