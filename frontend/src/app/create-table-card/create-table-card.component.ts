import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-create-table-card',
  standalone: true,
  imports: [],
  templateUrl: './create-table-card.component.html',
  styleUrl: './create-table-card.component.css'
})
export class CreateTableCardComponent {
  @Output() createTableCardEvent: EventEmitter<void> = new EventEmitter();

  create(): void {
    this.createTableCardEvent.emit();
  }
}
