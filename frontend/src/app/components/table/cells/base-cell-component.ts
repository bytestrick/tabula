import {Directive} from '@angular/core';


@Directive()
export abstract class BaseCellComponent {
  protected value: any = null;

  setValue(value: any): void {
    this.value = value
  }

  getValue(): any {
    return this.value;
  }
}
