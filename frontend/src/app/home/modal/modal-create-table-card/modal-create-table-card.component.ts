import {Component, ComponentRef, ViewContainerRef} from '@angular/core';
import { ModalComponent } from '../modal.component';
import {FormsModule} from '@angular/forms';
import {TableCardComponent} from '../../table-card/table-card.component';

@Component({
  selector: 'app-modal-create-table-card',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: '../modal.component.html',
  styleUrl: './modal-create-table-card.component.css'
})
export class ModalCreateTableCardComponent extends ModalComponent {
  protected override title: string = 'Create new table card';
  protected override actionName: string = 'Create';

  private tableCardContainerRef!: ViewContainerRef;

  protected override doOnSubmit(): void {
        // create new table card
        let newTableCard: ComponentRef<TableCardComponent> = this.tableCardContainerRef.createComponent(TableCardComponent);
        newTableCard.instance.setTitle(this.titleField);
        newTableCard.instance.setDescription(this.descriptionField);

  }

  public setTableCardContainerRef(ref: ViewContainerRef): void {
    this.tableCardContainerRef = ref;
  }
}
