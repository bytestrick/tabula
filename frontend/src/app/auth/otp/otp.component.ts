import {Component, inject, OnInit, viewChild} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {ToastService} from '../../toast/toast.service';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {PasswordInputComponent} from '../password-input/password-input.component';

/**
 * One Time Passwords are used to verify the email at sign
 * up and to reset the password if the user forgets it.
 */
export enum Reason {
  VerifyEmail = 'Verify your email',
  ResetPassword = 'Reset your password'
}

enum View {
  InputCode,
  InputResetPassword
}

@Component({
  selector: 'tbl-otp',
  standalone: true,
  imports: [ReactiveFormsModule, PasswordInputComponent],
  templateUrl: './otp.component.html',
})
export class OtpComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toast = inject(ToastService);
  protected reason?: Reason;
  protected email?: string | null;
  private passwordComponent = viewChild(PasswordInputComponent);
  protected otp = new FormControl('', [
    Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern(/^\d{6}$/)
  ]);
  protected readonly View: typeof View = View; // needed to use View in the template
  protected view = View.InputCode;

  ngOnInit() {
    const stringData = localStorage.getItem('otpData');
    if (stringData) {
      ({email: this.email, reason: this.reason} = JSON.parse(stringData));
    } else {
      console.error('Invalid navigation to /otp');
      this.router.navigate(['/sign-in']).then();
    }
  }

  protected onResend() {
    this.otp.reset();
    this.http.post('/auth/send-otp', {email: this.email, reason: this.reason}).subscribe({
      next: () => this.toast.show({
        title: 'Code resent',
        body: 'Another code was sent to your email address',
        icon: 'send-check-fill',
        background: 'info',
      }),
      error: (error: HttpErrorResponse) => this.toast.serverError(error.error?.message)
    })
  }

  protected onSubmit(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    if (this.reason === Reason.VerifyEmail) {
      this.otp.markAsTouched();
      if (this.otp.valid) {
        this.http.post('/auth/verify-email-otp', {email: this.email, otp: this.otp.value}).subscribe({
          next: () => {
            this.toast.show({
              title: 'Account verified',
              body: 'Now you can sign into your account',
              icon: 'person-fill-check',
              background: 'success',
            });
            this.finalize();
          },
          error: (error: HttpErrorResponse) => this.handleVerifyOtpError(error)
        });
      }
    } else if (this.reason === Reason.ResetPassword) {
      if (this.view === View.InputCode) {
        this.otp.markAsTouched();
        if (this.otp.valid) {
          this.http.post('/auth/verify-reset-password-otp', {email: this.email, otp: this.otp.value}).subscribe({
            next: () => this.view = View.InputResetPassword, // next step
            error: (error: HttpErrorResponse) => this.handleVerifyOtpError(error)
          });
        }
      } else if (this.view === View.InputResetPassword) {
        this.passwordComponent()?.form.markAllAsTouched();
        if (this.passwordComponent()?.form.valid) {
          this.http.patch('/auth/reset-password', {
            email: this.email,
            newPassword: this.passwordComponent()?.form.controls.password.value,
            otp: this.otp.value
          }).subscribe({
            next: () => {
              this.toast.show({
                title: 'Password reset successfully',
                body: 'You can now sign in with your updated credentials',
                icon: 'person-fill-gear',
                background: 'success',
              });
              this.finalize();
            },
            error: (error: HttpErrorResponse) => this.toast.serverError(error.error?.message)
          });
        }
      } else {
        throw new Error(`Invalid view: ${this.view}`);
      }
    } else {
      throw new Error(`Invalid reason: ${this.reason}`);
    }
  }

  private finalize() {
    this.router.navigate(['/sign-in']).then();
    localStorage.removeItem('otpData');
  }

  private handleNoOtpFoundForUser() {
    this.toast.show({
      title: 'There are no outstanding codes for that email',
      body: 'Request another code and try again',
      icon: 'exclamation-triangle-fill',
      background: 'warning'
    });
  }

  private handleVerifyOtpError(error: HttpErrorResponse) {
    switch (error.error?.message) {
      case 'Expired':
        this.toast.show({
          title: 'Code expired',
          body: 'Request another code and try again',
          icon: 'hourglass-bottom',
          background: 'danger'
        });
        this.otp.setErrors({expired: true});
        break;
      case 'Not found':
        this.handleNoOtpFoundForUser();
        break;
      case 'Incorrect':
        this.otp.setErrors({incorrect: true});
        break;
      default:
        this.toast.serverError(error.error?.message);
    }
  }
}
