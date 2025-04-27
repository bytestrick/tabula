import {Component, ElementRef, inject, OnDestroy, OnInit, Signal, viewChild} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {Modal} from 'bootstrap';
import {Subscription} from 'rxjs';
import {ConfirmDeletionDialogService} from './confirm-deletion-dialog.service';

export interface ConfirmDialogOption {
  title: string;
  description: string;
}

@Component({
  selector: 'tbl-confirm-deletion-dialog',
  imports: [
    ReactiveFormsModule,
  ],
  templateUrl: './confirm-deletion-dialog.component.html',
  styleUrl: './confirm-deletion-dialog.component.css'
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {

  protected title: string = '';
  protected description: string = '';

  private modalRef: Signal<ElementRef<HTMLElement>> = viewChild.required('modal');
  private modal!: Modal;
  private service: ConfirmDeletionDialogService = inject(ConfirmDeletionDialogService);
  private subscription?: Subscription;
  private response: boolean = false;


  ngOnInit(): void {
    this.modal = new Modal(this.modalRef().nativeElement);
    this.modalRef().nativeElement.addEventListener('hide.bs.modal', (): void => {
      this.service.onConfirm.next(this.response);
      this.response = false;
    });
    this.subscription = this.service.subject.subscribe((data: ConfirmDialogOption): void => this.show(data));
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private show(data: ConfirmDialogOption): void {
    this.title = data.title;
    this.description = data.description;

    this.modal.show();
  }

  protected onConfirm(): void {
    this.response = true;
    this.modal.hide();
  }

  protected onCancel(): void {
    this.response = false;
    this.modal.hide();
  }
}
