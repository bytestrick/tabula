import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  Renderer2,
  Type,
  ViewChild
} from '@angular/core';
import {Pair} from '../../types/pair';
import {NgComponentOutlet} from '@angular/common';
import {IInputComponent} from '../../model/input-component.interface';

@Component({
  selector: 'app-pop-up',
  standalone: true,
  imports: [
    NgComponentOutlet
  ],
  templateUrl: './pop-up.component.html',
  styleUrl: './pop-up.component.css'
})
export class PopUpComponent implements AfterViewInit {

  @ViewChild('popUpContainer') popUpContainer!: ElementRef;

  @Output() close: EventEmitter<void> = new EventEmitter<void>();
  @Input() position: Pair<number, number> = { first: 0, second: 0 };

  @Input() inputComponent: Type<IInputComponent> | null = null;


  constructor(private renderer: Renderer2) {
  }

  ngAfterViewInit(): void {
    this.renderer.setStyle(
      this.popUpContainer.nativeElement,
      'transform',
      `translate(${this.position.first}px, ${this.position.second}px)`
    );
  }

  closePopup() {
    this.close.emit();
  }
}
