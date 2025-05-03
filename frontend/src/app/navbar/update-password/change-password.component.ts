import {AfterViewInit, Component, ElementRef, inject, Signal, viewChild} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {ToastService} from '../../toast/toast.service';
import {PasswordFieldComponent} from '../../auth/single-password-field/password-field.component';
import {PasswordInputComponent} from '../../auth/password-input/password-input.component';
import {enableTooltips} from '../../tooltips';
import {Modal} from 'bootstrap';
import {AuthService} from '../../auth/auth.service';

@Component({
  selector: 'tbl-change-password',
  imports: [
    PasswordFieldComponent,
    PasswordInputComponent
  ],
  templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent implements AfterViewInit {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private auth = inject(AuthService);
  private oldPassword = viewChild.required(PasswordFieldComponent);
  private newPassword = viewChild.required(PasswordInputComponent);
  private dialog: Signal<ElementRef> = viewChild.required('changePasswordDialog');
  private modal?: Modal;

  ngAfterViewInit() {
    enableTooltips();
    const el = this.dialog().nativeElement as HTMLDivElement;
    el.remove();
    document.body.appendChild(el);
    this.modal = new Modal(el);
    el.addEventListener('hidden.bs.modal', () => {
      this.oldPassword().password.markAsUntouched();
      this.oldPassword().password.setValue('');
      this.newPassword().form.markAsUntouched();
      this.newPassword().form.setValue({password: '', confirm: ''});
    });
  }

  onChangePassword() {
    this.modal!.show();
  }

  onConfirmChangePassword() {
    this.oldPassword().password.markAllAsTouched();
    this.newPassword().form.markAllAsTouched();
    if (this.oldPassword().password.valid && this.newPassword().form.valid) {
      this.http.patch('/user/password', {
        oldPassword: this.oldPassword().password.value,
        newPassword: this.newPassword().form.controls.password.value
      }, {params: {email: this.auth.authentication!.email}}).subscribe({
        next: () => {
          this.modal?.hide();
          this.toast.show({body: 'Password changed successfully.', background: 'success'});
        },
        error: (err: HttpErrorResponse) => {
          if (err.error?.message?.startsWith('Incorrect password')) {
            this.oldPassword().password.setErrors({incorrect: true});
          } else {
            this.toast.serverError(err.error?.message);
          }
        }
      })
    }
  }
}
