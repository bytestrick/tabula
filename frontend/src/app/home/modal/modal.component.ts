import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import { Modal } from 'bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export abstract class ModalComponent implements AfterViewInit {
  @ViewChild('modal') private modal!: ElementRef;
  private instance!: Modal;
  protected title: string = '';
  protected titleField: string = '';
  protected descriptionField: string = '';
  protected actionName: string = '';
  @ViewChild('form') private form !: ElementRef;

  public ngAfterViewInit(): void {
    const form: HTMLFormElement = this.form.nativeElement;
    this.instance = new Modal(this.modal.nativeElement);

    // Aggiungi il listener al modal
    this.modal.nativeElement.addEventListener('hidden.bs.modal', (): void => {
      form.classList.remove('was-validated');
      this.titleField = '';
      this.descriptionField = '';
    });
  }

  protected abstract doOnSubmit(): void;

  protected onSubmit(): void {
    const form: HTMLFormElement = this.form.nativeElement;

    if (form.checkValidity()) {
      this.doOnSubmit();
      this.instance.hide();
    }
    else {
      form.classList.add('was-validated');
    }
  }

  public show(): void {
    this.instance.show();
  }
}
