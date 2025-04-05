import {Injectable, ViewContainerRef} from '@angular/core';
import {TableCardComponent} from './table-card/table-card.component';
import {HomeComponent} from './home.component';
import {TableCard} from './table-card/table-card.interface';

@Injectable({
  providedIn: 'root'
})
export class HomeMediatorService {
  private tableContainerRef!: ViewContainerRef;
  private home !: HomeComponent;


  public constructor() {}


  public setModalEditTableCard(modalEditTableCard: any): void {
    // this.modalEditTableCard = modalEditTableCard;
  }

  public setTableCardToEdit(tableCard: TableCardComponent): void {
    // this.modalEditTableCard.setTableCardToEdit(tableCard);
  }

  public showModalEditTableCard(): void {
    // this.modalEditTableCard.show();
  }

  // ---

  public setTableCardContainerRef(tableCardContainerRef: ViewContainerRef): void {
    this.tableContainerRef = tableCardContainerRef;
  }

  public createTableCard(id: string): TableCardComponent {
    return TableCardComponent.create(id, this.tableContainerRef);
  }

  // ---

  public setModalCreateTableCard(modalCreateTableCard:  any): void {
    // this.modalCreateTableCard = modalCreateTableCard;
  }

  public showModalCreateTableCard(): void {
    // this.modalCreateTableCard.show();
  }

  // ---

  public setHome(home: HomeComponent): void {
    this.home = home;
  }

  public addTableCards(tableCards: TableCard[]): void {
    this.home.addTableCards(tableCards);
  }

}
