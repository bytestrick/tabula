import {Component, ElementRef, EventEmitter, ViewChild} from '@angular/core';
import {BaseInputComponent} from '../base-input-component';

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [],
  templateUrl: './text-input.component.html',
  styleUrl: './text-input.component.css'
})
export class TextInputComponent extends BaseInputComponent {

  override inputAborted: EventEmitter<void> = new EventEmitter<void>();
  override inputConfirmed: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('input') input!: ElementRef<HTMLInputElement>;

  onKeyPressed(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.inputConfirmed.emit(this.value);
    }
    else if (event.key === 'Delete') {
      this.value = null;
      this.inputAborted.emit();
    }
  }


  onInsertion(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
  }


  override grabFocus(): void {
    this.input?.nativeElement.focus();
  }
}
