import {
  AfterViewInit,
  Component, ComponentRef,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  Renderer2,
  Type,
  ViewChild, ViewContainerRef
} from '@angular/core';
import {Pair} from '../../types/pair';
import {BaseInputComponent} from '../input-components/base-input-component';

@Component({
  selector: 'app-pop-up',
  standalone: true,
  imports: [],
  templateUrl: './input-pop-up.component.html',
  styleUrl: './input-pop-up.component.css'
})
export class InputPopUpComponent implements AfterViewInit {

  @ViewChild('popUpContainer') popUpContainer!: ElementRef;
  @ViewChild('inputMethodContainer', { read: ViewContainerRef }) inputMethodContainer!: ViewContainerRef;

  @Output() close: EventEmitter<any> = new EventEmitter<any>();
  @Input() position: Pair<number, number> = { first: 0, second: 0 };

  @Input() inputComponent: Type<BaseInputComponent> | null = null;
  @Input() inputComponentInitialValue: any;

  constructor(private renderer: Renderer2) {}


  ngAfterViewInit(): void {
    this.addInputMethod(this.inputComponent, this.inputComponentInitialValue);

    this.renderer.setStyle(
      this.popUpContainer.nativeElement,
      'transform',
      `translate(${this.position.first}px, ${this.position.second}px)`
    );
  }


  onClosePopUp(): void {
    this.close.emit(null);
  }


  onInputConfirmed(value: any): void {
    this.close.emit(value);
  }


  onInputAborted(): void {
    this.close.emit(null);
  }


  addInputMethod(inputMethod: Type<BaseInputComponent> | null, defaultValue: any): void {
    if (inputMethod === null)
      return;

    this.inputMethodContainer?.clear();
    const inputMethodRef: ComponentRef<BaseInputComponent> = this.inputMethodContainer?.createComponent(inputMethod);
    inputMethodRef?.instance.setInitialValue(this.inputComponentInitialValue);
    inputMethodRef?.instance.inputConfirmed?.subscribe(
      (value: any): void => this.onInputConfirmed(value)
    );
    inputMethodRef?.instance.inputAborted?.subscribe(
      (): void => this.onInputAborted()
    );
  }
}
