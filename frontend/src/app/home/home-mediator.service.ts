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

  public editTableCard(tableCard: TableCardComponent): void {
    this.modalEditTableCard.editTableCard(tableCard);
  }

  public showModalEditTableCard(): void {
    this.modalEditTableCard.show();
  }

  // ---

  public setTableCardContainerRef(tableCardContainerRef: ViewContainerRef): void {
    this.tableContainerRef = tableCardContainerRef;
  }

  public createTableCard(): TableCardComponent {
    return TableCardComponent.create(this.tableContainerRef);
  }

  // ---

  public setModalCreateTableCard(modalCreateTableCard: ModalCreateTableCardComponent): void {
    this.modalCreateTableCard = modalCreateTableCard;
  }

  public showModalCreateTableCard(): void {
    this.modalCreateTableCard.show();
  }
}
