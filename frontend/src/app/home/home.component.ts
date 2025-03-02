import {Component, ViewChild, ViewContainerRef, ComponentRef, AfterViewInit, ElementRef} from '@angular/core';
import { TableCardComponent } from '../table-card/table-card.component'
import { CreateTableCardComponent } from '../create-table-card/create-table-card.component';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-table-cards-container',
  standalone: true,
  imports: [
    CreateTableCardComponent,
    FormsModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private tableCardInEdit: TableCardComponent | null = null;
  protected modalTitlePlaceholder: String = "";
  protected modalDescriptionPlaceholder: String = "";
  protected createFormTitle: String = "";
  protected createFormDescription: String = "";
  protected editFormTitle: String = "";
  protected editFormDescription: String = "";

  @ViewChild('tableCardContainer', { read: ViewContainerRef }) tableCardContainer !: ViewContainerRef;

  @ViewChild('createCardTableForm') createCardTableForm !: ElementRef;
  @ViewChild('createTableCardModal') createTableCardModal!: ElementRef;

  @ViewChild('editCardTableForm') editCardTableForm !: ElementRef;
  @ViewChild('editTableCardModal') editTableCardModal!: ElementRef;


  ngAfterViewInit(): void {
    this.addListenerCreateTableModal();
    this.addListenerEditTableModal();
  }

  addListenerCreateTableModal(): void {
    this.createTableCardModal.nativeElement.addEventListener('hidden.bs.modal', (): void => {
      this.createCardTableForm.nativeElement.classList.remove('was-validated');
      this.createFormTitle = "";
      this.createFormDescription = "";
    });
  }

  addListenerEditTableModal(): void {
    this.editTableCardModal.nativeElement.addEventListener('hidden.bs.modal', (): void => {
      this.editCardTableForm.nativeElement.classList.remove('was-validated');
      this.editFormTitle = "";
      this.editFormDescription = "";
    });
  }

  editTableCard($event: TableCardComponent): void {
    this.modalTitlePlaceholder = $event.getTitle();
    this.modalDescriptionPlaceholder = $event.getDescription();
    this.tableCardInEdit = $event;
  }

  deleteTableCard(refTableCard: ComponentRef<TableCardComponent>): void {
    refTableCard.destroy();
  }

  onSubmitCreateTableCardForm(): void {
    const form: HTMLFormElement = this.createCardTableForm.nativeElement;

    if (form.checkValidity()) {
      // create new table card
      let newTableCard: ComponentRef<TableCardComponent> = this.tableCardContainer.createComponent(TableCardComponent);
      newTableCard.instance.setTitle(this.createFormTitle);
      newTableCard.instance.setDescription(this.createFormDescription);

      newTableCard.instance.editTableCardEvent.subscribe(($event: TableCardComponent): void => {
        this.editTableCard($event);
      });
      newTableCard.instance.deleteTableCardEvent.subscribe((): void => {
        this.deleteTableCard(newTableCard);
      });
    }
    else {
      form.classList.add('was-validated');
    }
  }

  onSubmitEditTableCardForm() {
    const form: HTMLFormElement = this.editCardTableForm.nativeElement;

    if (form.checkValidity() && this.tableCardInEdit) {
      // edit table card
      this.tableCardInEdit.setTitle(this.editFormTitle);
      this.tableCardInEdit.setDescription(this.editFormDescription);
    }
    else {
      form.classList.add('was-validated');
    }
  }
}
