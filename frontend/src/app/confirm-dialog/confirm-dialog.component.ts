import {Component, ElementRef, inject, OnDestroy, OnInit, Signal, viewChild} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {Modal} from 'bootstrap';
import {Subscription} from 'rxjs';
import {ConfirmDialogService} from './confirm-dialog.service';
import {NgClass} from '@angular/common';

interface DialogButton {
  text: string;
  background: string;
}

export interface ConfirmDialogOption {
  title: string;
  description: string;
  cancelButton?: DialogButton;
  confirmButton?: DialogButton;
}

@Component({
  selector: 'tbl-confirm-dialog',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
  private service = inject(ConfirmDialogService);
  private modalRef: Signal<ElementRef<HTMLElement>> = viewChild.required('modal');
  private modal!: Modal;
  private subscription?: Subscription;
  private response = false;
  protected title = '';
  protected description = '';
  protected cancelButton: DialogButton = {text: 'Confirm', background: 'btn-primary'};
  protected confirmButton: DialogButton = {text: 'Cancel', background: 'btn-secondary'};

  ngOnInit() {
    this.modal = new Modal(this.modalRef().nativeElement);
    this.modalRef().nativeElement.addEventListener('hide.bs.modal', () => {
      this.service.onConfirm.next(this.response);
      this.response = false;
    });
    this.subscription = this.service.subject.subscribe((data: ConfirmDialogOption) => this.show(data));
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  private show(data: ConfirmDialogOption) {
    this.title = data.title;
    this.description = data.description;
    this.cancelButton = data.cancelButton || {text: 'Cancel', background: 'btn-secondary'};
    this.confirmButton = data.confirmButton || {text: 'Confirm', background: 'btn-primary'};
    this.modal.show();
  }

  protected onConfirm() {
    this.response = true;
    this.modal.hide();
  }

  protected onCancel() {
    this.response = false;
    this.modal.hide();
  }
}
