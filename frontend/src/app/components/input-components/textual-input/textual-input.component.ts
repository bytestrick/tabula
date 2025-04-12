import {Component, ElementRef, ViewChild} from '@angular/core';
import {BaseInputComponent} from '../base-input-component';
import {InfoComponent} from '../info-component/info.component';

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [
    InfoComponent
  ],
  templateUrl: './textual-input.component.html',
})
export class TextualInputComponent extends BaseInputComponent {

  @ViewChild('input') input!: ElementRef<HTMLInputElement>;

  private text: string = '';


  protected override beforeShowUp(): void {
    this.grabFocus();

    this.input.nativeElement.value = this.startingValue || '';
    this.text = this.startingValue || '';
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


  protected grabFocus(): void {
    this.input.nativeElement.focus();
  }


  protected override onHiddenWithLeftClick(): void {
    this.confirmInput(this.text);
  }


  protected override onHiddenWithRightClick(): void {
    this.abortInput();
  }
}
