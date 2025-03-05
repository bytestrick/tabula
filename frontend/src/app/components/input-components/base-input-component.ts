import {AfterViewInit, Directive, EventEmitter, Output} from '@angular/core';


@Directive()
export abstract class BaseInputComponent implements AfterViewInit {

  @Output() inputAborted?: EventEmitter<void>;
  @Output() inputConfirmed?: EventEmitter<any>;

  protected initialValue: any = null;
  protected value: any = null;

  ngAfterViewInit(): void {
    this.beforeShowUp();
    this.grabFocus();
  }

  setInitialValue(inputComponentInitialValue: any): void {
    this.initialValue = inputComponentInitialValue;
  }

  protected abstract beforeShowUp(): void;
  abstract grabFocus(): void;
}
