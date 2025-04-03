import {Directive, Input} from '@angular/core';


@Directive()
export abstract class BaseCellComponent {

  @Input() protected value: string | null = null;


  setValue(value: string | null): void {
    this.value = value
  }


  getValue(): string | null {
    return this.value;
  }
}
