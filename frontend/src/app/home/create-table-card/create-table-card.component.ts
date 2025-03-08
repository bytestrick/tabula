import {Component, ComponentRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {ModalCreateTableCardComponent} from '../modal/modal-create-table-card/modal-create-table-card.component';

@Component({
  selector: 'app-create-table-card',
  standalone: true,
  imports: [
    ModalCreateTableCardComponent
  ],
  templateUrl: './create-table-card.component.html',
  styleUrl: './create-table-card.component.css'
})
export class CreateTableCardComponent {
  @ViewChild('modalCreateTableCard') private modal!: ModalCreateTableCardComponent;
  @Output() protected createTableCardEvent: EventEmitter<void> = new EventEmitter();

  protected create(): void {
    this.createTableCardEvent.emit();
  }
}
