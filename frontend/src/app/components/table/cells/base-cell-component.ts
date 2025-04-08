import {Directive, Input} from '@angular/core';
import {Pair} from '../../../model/pair';


@Directive()
export abstract class BaseCellComponent {

  @Input() protected value: string | null = null;
  @Input() protected cord: Pair<number, number> | null = null;


  setValue(value: string | null): void {
    this.value = value
  }


  getValue(): string | null {
    return this.value;
  }
}
