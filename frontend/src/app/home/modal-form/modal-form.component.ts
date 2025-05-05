import {Modal} from 'bootstrap';
import {ElementRef} from '@angular/core';

export abstract class ModalFormComponent {
  protected modal!: Modal;
  protected form!: HTMLFormElement;
  private isInit: boolean = false;

  protected abstract doOnSubmit(): void;

  protected abstract doOnModalHide(): void;

  protected init(form: ElementRef, modal: ElementRef): void {
    if (this.isInit) return;
    this.isInit = true;

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
      this.hide();
    } else {
      this.form.classList.add('was-validated');
    }
  }

  show(): void {
    this.modal?.show();
  }

  hide(): void {
    this.modal.hide();
  }
}
