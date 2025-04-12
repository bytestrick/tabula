import {Component, ElementRef, ViewChild} from '@angular/core';
import {BaseInputComponent} from '../base-input-component';
import {InfoComponent} from '../info-component/info.component';

@Component({
  selector: 'tbl-numeric-input',
  standalone: true,
  imports: [
    InfoComponent
  ],
  templateUrl: './numeric-input.component.html',
  styleUrl: './numeric-input.component.css'
})
export class NumericInputComponent extends BaseInputComponent {

  @ViewChild('input') input!: ElementRef<HTMLInputElement>;

  private value: string = '';


  protected override beforeShowUp(): void {
    this.grabFocus();

    this.input.nativeElement.value = this.startingValue || '';
    this.value = this.startingValue || '';
  }


  private setInput(value: string): void {
    if (!isNaN(Number(value)))
      this.confirmInput(value);
    else
      this.confirmInput(this.startingValue || '');
  }


  onKeyPressed(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.setInput(this.value);
    }
    else if (event.key === 'Delete') {
      this.abortInput();
    }
  }


  onInsertion(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
  }


  protected grabFocus(): void {
    this.input.nativeElement.focus();
  }


  onIncrease(): void {
    let num: number = Number(this.input.nativeElement.value);

    if (isNaN(num))
      return;

    this.input.nativeElement.value = (++num).toString();
    this.value = this.input.nativeElement.value;
    this.input.nativeElement.focus();
  }


  onDecrease(): void {
    let num: number = Number(this.input.nativeElement.value);

    if (isNaN(num))
      return;

    this.input.nativeElement.value = (--num).toString();
    this.value = this.input.nativeElement.value;
    this.input.nativeElement.focus();
  }


  protected override onHiddenWithLeftClick(): void {
    this.setInput(this.value);
  }


  protected override onHiddenWithRightClick(): void {
    this.abortInput();
  }
}
