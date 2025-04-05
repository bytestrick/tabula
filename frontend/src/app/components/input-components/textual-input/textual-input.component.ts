import {Component, ElementRef, ViewChild} from '@angular/core';
import {BaseInputComponent} from '../base-input-component';

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [],
  templateUrl: './textual-input.component.html',
})
export class TextualInputComponent extends BaseInputComponent {

  @ViewChild('input') input!: ElementRef<HTMLInputElement>;

  private text: string = '';


  protected override beforeShowUp(): void {
    this.input.nativeElement.value = this.startingValue;
    this.text = this.startingValue;
  }


  onKeyPressed(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.confirmInput(this.text);
    }
    else if (event.key === 'Delete') {
      this.abortInput();
    }
  }


  onInsertion(event: Event): void {
    this.text = (event.target as HTMLInputElement).value;
  }


  override grabFocus(): void {
    this.input.nativeElement.focus();
  }


  protected override onHiddenWithLeftClick(): void {
    this.confirmInput(this.text);
  }


  protected override onHiddenWithRightClick(): void {
    this.abortInput();
  }
}
