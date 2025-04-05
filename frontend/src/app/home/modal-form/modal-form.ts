import { Modal } from 'bootstrap';
import { ElementRef } from '@angular/core';

export abstract class ModalForm {

  protected modal!: Modal;
  protected form!: HTMLFormElement;


  protected abstract doOnSubmit(): void;
  protected abstract doOnModalHide(): void;

  protected init(form: ElementRef, modal: ElementRef): void {
    this.modal = new Modal(modal.nativeElement);
    this.form = form.nativeElement;

    modal.nativeElement.addEventListener('hidden.bs.modal', (): void => {
      this.form.classList.remove('was-validated');
      this.doOnModalHide();
    });
  }

  protected onSubmit(): void {
    if (this.form.checkValidity()) {
      this.doOnSubmit();
      this.modal.hide();
    }
    else {
      this.form.classList.add('was-validated');
    }
  }
}
