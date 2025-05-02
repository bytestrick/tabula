import {AfterViewInit, Component, ElementRef, EventEmitter, inject, Output, ViewChild} from '@angular/core';
import {ModalFormComponent} from '../modal-form.component';
import {FormsModule} from '@angular/forms';
import {HomeService} from "../../home.service";
import {TableCard} from "../../table-card/table-card.interface";
import {ToastService} from '../../../toast/toast.service';

@Component({
  selector: 'tbl-form-create-table-card',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './form-create-table-card.component.html',
})
export class FormCreateTableCardComponent extends ModalFormComponent implements AfterViewInit {

  @ViewChild('form') private formRef!: ElementRef;
  @ViewChild('modal') private modalRef!: ElementRef;
  titleField: string = '';
  descriptionField: string = '';
  @Output('addTableCard') addTableCard: EventEmitter<TableCard> = new EventEmitter;
  private toast: ToastService = inject(ToastService);


  constructor(private homeService: HomeService) {
    super();
  }


  ngAfterViewInit(): void {
    this.init(this.formRef, this.modalRef);
  }

  protected doOnSubmit(): void {
    const now: Date = new Date();
    const tableCard: TableCard = {
      title: this.titleField,
      description: this.descriptionField,
      creationDate: now,
      lastEditDate: now
    };
    this.homeService.createTableCard(tableCard).subscribe({
      next: (data: TableCard) => {
        this.toast.show({
          title: 'Table Created',
          body: `The table has been successfully created.`,
          icon: 'bi bi-table',
          background: 'success',
        });
        this.addTableCard.emit(data);
      },
      error: () => {
        this.toast.show({
          title: 'Table Not Created',
          body: 'An error occurred the table was not created.\nPlease try again later.',
          icon: 'x-circle-fill',
          background: 'danger',
        });
      }
    });
  }

  protected doOnModalHide(): void {
    this.titleField = '';
    this.descriptionField = '';
  }
}
