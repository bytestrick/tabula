import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {ModalForm} from '../modal-form';
import {FormsModule} from '@angular/forms';
import {TableCardComponent} from "../../table-card/table-card.component";
import {HomeService} from "../../home.service";
import {TableCard} from "../../table-card/table-card.interface";

@Component({
  selector: 'app-form-edit-table-card',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './form-edit-table-card.component.html',
  styleUrl: './form-edit-table-card.component.css'
})
export class FormEditTableCardComponent extends ModalForm implements AfterViewInit {

  @ViewChild('form') private formRef!: ElementRef;
  @ViewChild('modal') private modalRef!: ElementRef;
  private tableCardComponentToEdit: TableCardComponent | undefined;
  titleField: string = '';
  descriptionField: string = '';


  constructor(private homeService: HomeService) {
    super();
  }


  ngAfterViewInit(): void {
    this.init(this.formRef, this.modalRef);
  }

  setTableCardComponentToEdit(tableCardComponent: TableCardComponent): void {
    this.tableCardComponentToEdit = tableCardComponent;
    this.titleField = tableCardComponent.getTitle();
    this.descriptionField = tableCardComponent.getDescription();
  }

  protected doOnModalHide(): void {
    this.titleField = '';
    this.descriptionField = '';
    this.tableCardComponentToEdit = undefined;
  }

  protected doOnSubmit(): void {
    let tableCard: TableCard = {
      id: this.tableCardComponentToEdit?.getId(),
      title: this.titleField,
      description: this.descriptionField
    }
    const toEdit: TableCardComponent | undefined = this.tableCardComponentToEdit;
    this.homeService.editTableCard(tableCard).subscribe({
      next: (data: string): void => {
        console.log(data);
        toEdit?.edit(tableCard);
      },
      error: (err: any): void => console.error(err)
    })
  }
}
