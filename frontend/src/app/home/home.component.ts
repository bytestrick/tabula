import {Component, EnvironmentInjector, inject, ViewChild, ViewContainerRef,} from '@angular/core';
import {CreateTableCardComponent} from './create-table-card/create-table-card.component';
import {FormsModule} from '@angular/forms';
import {FormCreateTableCardComponent} from './modal-form/form-create-table-card/form-create-table-card.component';
import {FormEditTableCardComponent} from './modal-form/form-edit-table-card/form-edit-table-card.component';
import {TableCard} from './table-card/table-card.interface';
import {TableCardComponent} from './table-card/table-card.component';
import {
  TableCardInfiniteScrollComponent
} from '../infinite-scroll/providers/table-card-infinite-scroll/table-card-infinite-scroll.component';
import {NavbarComponent} from '../navbar/navbar.component';


@Component({
  selector: 'tbl-home',
  imports: [
    CreateTableCardComponent,
    FormsModule,
    FormCreateTableCardComponent,
    FormEditTableCardComponent,
    TableCardInfiniteScrollComponent,
    NavbarComponent,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private injector = inject(EnvironmentInjector);

  @ViewChild('formCreateTableCard') private formCreateTableCard!: FormCreateTableCardComponent;
  @ViewChild('formEditTableCard') private formEditTableCard!: FormEditTableCardComponent;
  @ViewChild('tableCardContainer', {read: ViewContainerRef}) private tableCardContainerView!: ViewContainerRef;
  @ViewChild('tableCardInfiniteScroll') private tableCardInfiniteScroll!: TableCardInfiniteScrollComponent;

  createTableCard(): void {
    this.formCreateTableCard.show();
  }

  addTableCard(tableCard: TableCard): void {
    const tableCardCmp: TableCardComponent = TableCardComponent.create(this.injector).instance;
    tableCardCmp.init(tableCard).insert(this.tableCardContainerView, 0);

    tableCardCmp.editTableCard.subscribe((tableCardCmp: TableCardComponent): void => {
      this.editTableCard(tableCardCmp);
    })
  }

  editTableCard(tableCardComponent: TableCardComponent): void {
    this.formEditTableCard.setTableCardComponentToEdit(tableCardComponent);
    this.formEditTableCard.show();
  }

  onSearchedTableCard(tableCards: TableCard[] | "noSearchContent"): void {
    this.tableCardInfiniteScroll.clearAll();

    if (tableCards === "noSearchContent") {
      this.tableCardInfiniteScroll.loadMoreElements();
      return;
    }

    this.tableCardInfiniteScroll.provideElements(
      this.tableCardInfiniteScroll.createComponentsFromData(tableCards), false);
  }
}
