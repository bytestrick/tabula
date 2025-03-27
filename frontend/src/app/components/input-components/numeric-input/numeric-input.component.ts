import {Component, ElementRef, ViewChild} from '@angular/core';
import {BaseInputComponent} from '../base-input-component';

@Component({
  selector: 'app-numeric-input',
  standalone: true,
  imports: [],
  templateUrl: './numeric-input.component.html',
  styleUrl: './numeric-input.component.css'
})
export class NumericInputComponent extends BaseInputComponent {

  @ViewChild('input') input!: ElementRef<HTMLInputElement>;

  private value: string = '';


  protected override beforeShowUp(): void {
    this.input.nativeElement.value = this.getInitialValue();
  }


  onKeyPressed(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      if (!isNaN(Number(this.value)))
        this.confirmInput(this.value);
      else
        this.confirmInput('');
    }
    else if (event.key === 'Delete') {
      this.abortInput();
    }
  }


  onInsertion(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
  }


  override grabFocus(): void {
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
}
