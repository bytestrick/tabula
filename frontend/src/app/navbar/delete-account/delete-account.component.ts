import {AfterViewInit, Component, ElementRef, inject, Signal, viewChild} from '@angular/core';
import {Modal} from 'bootstrap';
import {PasswordFieldComponent} from '../../auth/single-password-field/password-field.component';
import {enableTooltips} from '../../tooltips';
import {AuthService} from '../../auth/auth.service';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {ToastService} from '../../toast/toast.service';

/**
 * User account deletion. Consists of a button that triggers a modal dialog.
 * This component is meant to manage the lifecycle of that modal dialog.
 */
@Component({
  selector: 'tbl-delete-account',
  imports: [PasswordFieldComponent],
  templateUrl: './delete-account.component.html',
})
export class DeleteAccountComponent implements AfterViewInit {
  private auth = inject(AuthService);
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private password = viewChild.required(PasswordFieldComponent);
  private dialog: Signal<ElementRef> = viewChild.required('deleteAccountDialog');
  private modal?: Modal;

  ngAfterViewInit() {
    enableTooltips();
    const el = this.dialog().nativeElement as HTMLDivElement;
    // https://stackoverflow.com/questions/10636667/bootstrap-modal-appearing-under-background
    el.remove();
    document.body.appendChild(el);

    this.modal = new Modal(el);
    el.addEventListener('hidden.bs.modal', () => {
      this.password().password.markAsUntouched();
      this.password().password.setValue('');
    });
  }

  protected onDeleteAccount() {
    this.modal!.show();
  }

  protected onConfirmDeleteAccount() {
    this.password().password.markAllAsTouched();
    if (this.password().password.valid) {
      this.http.delete('/user', {
        body: {password: this.password().password.value},
        params: {email: this.auth.authentication!.email}
      }).subscribe({
        next: () => {
          this.auth.clientSignOut();
          this.toast.show({body: 'Account deleted successfully.', background: 'info'});
          this.modal?.hide();
        },
        error: (err: HttpErrorResponse) => {
          if (err.error?.message?.startsWith('Incorrect password')) {
            this.password().password.setErrors({incorrect: true});
          } else {
            this.toast.serverError(err.error?.message);
          }
        }
      });
    }
  }
}
