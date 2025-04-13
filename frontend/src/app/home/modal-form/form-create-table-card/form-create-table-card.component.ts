import {AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {ModalFormComponent} from '../modal-form.component';
import {FormsModule} from '@angular/forms';
import {HomeService} from "../../home.service";
import {TableCard} from "../../table-card/table-card.interface";

@Component({
  selector: 'app-form-create-table-card',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './form-create-table-card.component.html',
  styleUrl: './form-create-table-card.component.css'
})
export class FormCreateTableCardComponent extends ModalFormComponent implements AfterViewInit {

  @ViewChild('form') private formRef!: ElementRef;
  @ViewChild('modal') private modalRef!: ElementRef;
  titleField: string = '';
  descriptionField: string = '';
  @Output('addTableCard') addTableCard: EventEmitter<TableCard> = new EventEmitter;


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
    }
    this.homeService.createTableCard(tableCard).subscribe({
      next: (data: TableCard): void => {
        this.addTableCard.emit(data);
      },
      error: (err: any): any => console.debug(err)
    });
  }

  protected doOnModalHide(): void {
    this.titleField = '';
    this.descriptionField = '';
  }
}
