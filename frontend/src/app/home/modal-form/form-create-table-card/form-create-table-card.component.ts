import {AfterViewInit, Component, ElementRef, signal, Signal, ViewChild, viewChild} from '@angular/core';
import {ModalForm} from '../modal-form';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-form-create-table-card',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './form-create-table-card.component.html',
  styleUrl: './form-create-table-card.component.css'
})
export class FormCreateTableCardComponent extends ModalForm implements AfterViewInit {

  @ViewChild('form') private formRef!: ElementRef;
  @ViewChild('modal') private modalRef!: ElementRef;
  titleField: string = '';
  descriptionField: string = '';


  ngAfterViewInit(): void {
    super.init(this.formRef, this.modalRef);
  }

  protected doOnSubmit(): void {
    // this.createTableCard(this.titleField, this.descriptionField);
  }

  protected doOnModalHide(): void {
    this.titleField = '';
    this.descriptionField = '';
  }
}
