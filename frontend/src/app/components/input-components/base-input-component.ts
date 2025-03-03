import {AfterViewInit, Directive, EventEmitter, Output} from '@angular/core';


@Directive()
export abstract class BaseInputComponent implements AfterViewInit {

  @Output() inputAborted?: EventEmitter<void>;
  @Output() inputConfirmed?: EventEmitter<any>;

  protected value: any = null;

  ngAfterViewInit(): void {
    this.grabFocus();
  }

  abstract grabFocus(): void;
}
