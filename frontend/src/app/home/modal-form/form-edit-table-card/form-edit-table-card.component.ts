import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {ModalForm} from '../modal-form';
import {FormsModule} from '@angular/forms';

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
  titleField: string = '';
  descriptionField: string = '';


  ngAfterViewInit(): void {
    super.init(this.formRef, this.modalRef);
  }

  protected doOnModalHide(): void {
    this.titleField = '';
    this.descriptionField = '';
  }

  protected doOnSubmit(): void {
  }
}
