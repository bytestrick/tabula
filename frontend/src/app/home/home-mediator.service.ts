import {Injectable, ViewContainerRef} from '@angular/core';
import {TableCardComponent} from './table-card/table-card.component';
import {ModalEditTableCardComponent} from './modal/modal-edit-table-card/modal-edit-table-card.component';
import {ModalCreateTableCardComponent} from './modal/modal-create-table-card/modal-create-table-card.component';

@Injectable({
  providedIn: 'root'
})
export class HomeMediatorService {
  private modalEditTableCard!: ModalEditTableCardComponent;
  private tableContainerRef!: ViewContainerRef;
  private modalCreateTableCard!: ModalCreateTableCardComponent;


  public constructor() {}


  public setModalEditTableCard(modalEditTableCard: ModalEditTableCardComponent): void {
    this.modalEditTableCard = modalEditTableCard;
  }

  public setTableCardToEdit(tableCard: TableCardComponent): void {
    this.modalEditTableCard.setTableCardToEdit(tableCard);
  }

  public showModalEditTableCard(): void {
    this.modalEditTableCard.show();
  }

  // ---

  public setTableCardContainerRef(tableCardContainerRef: ViewContainerRef): void {
    this.tableContainerRef = tableCardContainerRef;
  }

  public createTableCard(id: string): TableCardComponent {
    return TableCardComponent.create(id, this.tableContainerRef);
  }

  // ---

  public setModalCreateTableCard(modalCreateTableCard: ModalCreateTableCardComponent): void {
    this.modalCreateTableCard = modalCreateTableCard;
  }

  public showModalCreateTableCard(): void {
    this.modalCreateTableCard.show();
  }
}
