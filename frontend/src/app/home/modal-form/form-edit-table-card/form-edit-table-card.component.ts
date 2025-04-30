import {AfterViewInit, Component, ElementRef, inject, ViewChild} from '@angular/core';
import {ModalFormComponent} from '../modal-form.component';
import {FormsModule} from '@angular/forms';
import {TableCardComponent} from "../../table-card/table-card.component";
import {HomeService} from "../../home.service";
import {TableCard} from "../../table-card/table-card.interface";
import {ToastService} from '../../../toast/toast.service';

@Component({
  selector: 'tbl-form-edit-table-card',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './form-edit-table-card.component.html',
  styleUrl: './form-edit-table-card.component.css'
})
export class FormEditTableCardComponent extends ModalFormComponent implements AfterViewInit {

  @ViewChild('form') private formRef!: ElementRef;
  @ViewChild('modal') private modalRef!: ElementRef;
  private tableCardCmpToEdit: TableCardComponent | undefined;
  titleField: string = '';
  descriptionField: string = '';
  private toast: ToastService = inject(ToastService);


  constructor(private homeService: HomeService) {
    super();
  }


  ngAfterViewInit(): void {
    this.init(this.formRef, this.modalRef);
  }

  setTableCardComponentToEdit(tableCardComponent: TableCardComponent): void {
    this.tableCardCmpToEdit = tableCardComponent;
    this.titleField = tableCardComponent.getTitle();
    this.descriptionField = tableCardComponent.getDescription();
  }

  protected doOnModalHide(): void {
    this.titleField = '';
    this.descriptionField = '';
    this.tableCardCmpToEdit = undefined;
  }

  protected doOnSubmit(): void {
    const tableCard: TableCard | undefined = this.tableCardCmpToEdit?.toTableCard();
    if (!tableCard) return;

    tableCard.title = this.titleField;
    tableCard.description = this.descriptionField;
    tableCard.lastEditDate = new Date();

    const toEdit: TableCardComponent | undefined = this.tableCardCmpToEdit;

    this.homeService.editTableCard(tableCard).subscribe({
      next: (data: string): void => {
        this.toast.show({
          title: 'Table Edited',
          body: `The table has been successfully edited.`,
          icon: 'bi bi-pencil-fill',
          background: 'success',
        });
        toEdit?.edit(tableCard);
      },
      error: (err: any): void => {
        this.toast.show({
          title: 'Table Not Edited',
          body: 'An error occurred the table was not edited.\nPlease try again later.',
          icon: 'x-circle-fill',
          background: 'danger',
        });
      }
    })
  }
}
