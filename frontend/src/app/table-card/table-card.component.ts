import {Component, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-table-card',
  standalone: true,
  imports: [],
  templateUrl: './table-card.component.html',
  styleUrl: './table-card.component.css'
})
export class TableCardComponent {
  protected title: String = "Title";
  protected description: String = "Description";

  @Output() editTableCardEvent: EventEmitter<TableCardComponent> = new EventEmitter();
  @Output() deleteTableCardEvent: EventEmitter<void> = new EventEmitter();

  delete(): void {
    this.deleteTableCardEvent.emit();
  }

  edit(): void {
    this.editTableCardEvent.emit(this);
  }

  setTitle(title: String): void {
    this.title = title;
  }

  getTitle(): String {
    return this.title;
  }

  setDescription(description: String): void {
    this.description = description;
  }

  getDescription(): String {
    return this.description;
  }
}
