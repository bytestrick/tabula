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
import {Pair} from '../../model/pair';
import {BaseInputComponent} from '../input-components/base-input-component';

@Component({
  selector: 'app-input-component-pop-up',
  standalone: true,
  imports: [],
  templateUrl: './input-component-pop-up.component.html',
  styleUrl: './input-component-pop-up.component.css'
})
export class InputComponentPopUp implements AfterViewInit {

  @ViewChild('popUpContainer') popUpContainer!: ElementRef;
  @ViewChild('inputMethodContainer', { read: ViewContainerRef }) inputMethodContainer!: ViewContainerRef;

  @Output() close: EventEmitter<void> = new EventEmitter<void>();
  @Input() position: Pair<number, number> = { first: 0, second: 0 };

  @Input() inputComponent: Type<BaseInputComponent> | null = null;
  @Input() inputStartingValue: any;
  @Input() doAfterInputConfirmation: ((value: any) => void) | undefined;

  constructor(private renderer: Renderer2) {}


  ngAfterViewInit(): void {
    this.addInputMethod(this.inputComponent, this.inputStartingValue);
    this.setPopUpPosition(this.position);
  }


  setPopUpPosition(position: Pair<number, number>): void {
    const viewportWidth: number = window.innerWidth;
    const viewportHeight: number = window.innerHeight;
    const popUpWidth: number = this.popUpContainer.nativeElement.offsetWidth;
    const popUpHeight: number = this.popUpContainer.nativeElement.offsetHeight;
    const offScreenAmountX: number = (position.first + popUpWidth) - viewportWidth;
    const offScreenAmountY: number = (position.second + popUpHeight) - viewportHeight;

    if (offScreenAmountX > 0)
      position.first -= offScreenAmountX;

    if (offScreenAmountY > 0)
      position.second -= offScreenAmountY;

    this.renderer.setStyle(
      this.popUpContainer.nativeElement,
      'transform',
      `translate(${position.first}px, ${position.second}px)`
    );
  }


  onClosePopUp(): void {
    this.close.emit();
  }


  onInputConfirmed(value: any): void {
    if (this.doAfterInputConfirmation)
      this.doAfterInputConfirmation(value);

    this.close.emit();
  }


  onInputAborted(): void {
    this.close.emit();
  }


  addInputMethod(inputMethod: Type<BaseInputComponent> | null, startingValue: any): void {
    if (inputMethod === null)
      return;

    this.inputMethodContainer?.clear();
    const inputMethodRef: ComponentRef<BaseInputComponent> = this.inputMethodContainer?.createComponent(inputMethod);
    inputMethodRef.instance.setInitialValue(startingValue);

    inputMethodRef.instance.inputConfirmed?.subscribe(
      (value: any): void => this.onInputConfirmed(value)
    );

    inputMethodRef.instance.inputAborted?.subscribe(
      (): void => this.onInputAborted()
    );
  }
}
