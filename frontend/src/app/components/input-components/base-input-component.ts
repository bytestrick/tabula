import {AfterViewInit, Directive, EventEmitter, Output} from '@angular/core';


@Directive()
export abstract class BaseInputComponent implements AfterViewInit {

  @Output() inputAborted: EventEmitter<void> = new EventEmitter<void>;
  @Output() inputConfirmed: EventEmitter<any> = new EventEmitter<any>;

  private startingValue: any = null;


  ngAfterViewInit(): void {
    this.beforeShowUp();
    this.grabFocus();
  }


  setInitialValue(startingValue: any): void {
    this.startingValue = startingValue;
  }


  getInitialValue(): any {
    return this.startingValue;
  }


  protected abstract beforeShowUp(): void;
  abstract grabFocus(): void;


  protected confirmInput(value: any): void {
    this.inputConfirmed?.emit(value);
  }


  protected abortInput(): void {
    this.inputAborted?.emit();
  }
}
