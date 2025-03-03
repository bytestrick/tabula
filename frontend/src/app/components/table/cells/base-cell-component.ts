import {Directive} from '@angular/core';


@Directive()
export abstract class BaseCellComponent {
  protected value: any;

  setValue(value: any): void {
    this.value = value
  }

  getValue(): any {
    return this.value;
  }
}
