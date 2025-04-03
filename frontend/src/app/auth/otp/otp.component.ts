import {Component, inject, ViewChild} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {ToastService} from '../../toast/toast.service';
import {Subscription} from 'rxjs';
import {ReactiveFormsModule} from '@angular/forms';
import {DoublePassInputComponent} from '../double-pass-input/double-pass-input.component';

/**
 * One Time Passwords are used to verify the email at sign
 * up and to reset the password if the user forgets it.
 */
export enum Reason {
  VerifyEmail = 'Verify your email',
  ResetPassword = 'Reset your password'
}

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [ReactiveFormsModule, DoublePassInputComponent],
  templateUrl: './otp.component.html',
})
export class OtpComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toast = inject(ToastService);
  private otpInputElement?: HTMLInputElement;
  private feedback?: HTMLElement;
  protected reason?: Reason;
  protected email?: string | null;
  private routerSubscription?: Subscription;
  protected showOtpInput = true;

  @ViewChild(DoublePassInputComponent) pass!: DoublePassInputComponent;

  ngOnInit() {
    const stringData = localStorage.getItem('otpData');
    if (stringData) {
      const data = JSON.parse(stringData);
      this.email = data.email;
      this.reason = data.reason;
    } else {
      console.error('Invalid navigation to /otp');
      this.router.navigate(['/sign-in']).then();
      return;
    }
  }

  // FIXME: HTML elements getters are always undefined
  get otpInput(): HTMLInputElement {
    if (!this.otpInputElement) {
      this.otpInputElement = document.querySelector('#otp')!
    }
    return this.otpInputElement;
  }

  get otpFeedback(): HTMLElement {
    if (!this.feedback) {
      this.feedback = document.querySelector('#otp-feedback')!;
    }
    return this.feedback;
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  private isFormValid(event: Event, form: HTMLFormElement): boolean {
    form.classList.add('was-validated');
    event.preventDefault();
    event.stopPropagation();
    return form.checkValidity();
  }

  protected onResend() {
    this.http.post('/auth/send-otp', {email: this.email, reason: this.reason}).subscribe({
      next: () => {
        this.toast.show({
          title: 'Code resent',
          body: 'Another code was resent to your email',
          icon: 'info-circle-fill',
          background: 'info',
        });
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.toast.show({
            title: 'Unknown email',
            body: 'No user waiting for verification was found with that email',
            icon: 'person-x',
            background: 'danger',
          });
        } else {
          this.toast.serverError(error.error);
        }
      }
    })
  }

  protected onCodeInput() {
    if (this.otpInput.validity.tooShort) {
      this.otpFeedback.textContent = 'Must be 6 digits long';
    } else if (this.otpInput.validity.valueMissing) {
      this.otpFeedback.textContent = 'Please insert the code';
    } else if (!/^\d{6}$/.test(this.otpInput.value)) {
      this.otpFeedback.textContent = 'Only digits are accepted';
      this.otpInput.setCustomValidity('only-digits');
    } else {
      this.otpInput.setCustomValidity('');
    }
  }

  protected onSubmit(event: Event) {
    const form = event.target as HTMLFormElement;
    if (this.isFormValid(event, form)) {
      switch (this.reason) {
        case Reason.VerifyEmail:
          this.http.post('/auth/verify-email-otp', {email: this.email, otp: this.otpInput.value}).subscribe({
            next: () => {
              this.toast.show({
                title: 'Sign up successful',
                body: 'You can sign in into your new account',
                icon: 'check-circle-fill',
                background: 'success',
              });
              this.afterVerification();
            },
            error: this.handleVerifyOtpError
          });
          break;
        case Reason.ResetPassword:
          console.log('case is verify reset password');
          if (this.showOtpInput) {
            console.log('verification of OTP')
            this.http.post('/auth/verify-reset-password-otp', {
              email: this.email,
              otp: this.otpInput.value
            }).subscribe({
              next: () => {
                form.classList.remove('was-validated');
                this.showOtpInput = false
              },
              error: this.handleVerifyOtpError
            });
            return;
          } else {
            console.log('resetting password');
            this.http.post('/auth/reset-password', {
              email: this.email,
              newPassword: this.pass.passInput!.value,
              otp: this.otpInput.value
            }).subscribe({
              next: () => {
                this.toast.show({body: 'Password reset successfully', background: 'success'});
                this.afterVerification();
              },
              error: (error: HttpErrorResponse) => {
                if (error.status === 404) {
                  this.userNotFound();
                } else {
                  this.toast.serverError(error.error)
                }
              },
            });
          }
          break;
        default:
          console.error('Invalid reason: ', this.reason)
      }
    }
  }

  private afterVerification(): void {
    this.router.navigate(['/sign-in']).then();
    localStorage.removeItem('otpData');
  }

  private userNotFound() {
    this.toast.show({
      title: 'User not found',
      body: 'There is not user registered with that email',
      icon: 'person-x',
      background: 'danger',
    });
  }

  private handleVerifyOtpError(error: HttpErrorResponse) {
    if (error.status === 404) {
      this.userNotFound();
    } else switch (error.error) {
      case 'Expired':
        // FIXME: OTPs don't seem to expire
        this.toast.show({
          title: 'Code expired',
          body: 'Request another code and try again.',
          icon: 'hourglass-bottom',
          background: 'danger'
        });
        break;
      case 'Not found':
        this.toast.show({
          title: 'No code registered for this user',
          body: 'Request another code and try again',
          icon: 'exclamation-triangle-fill',
          background: 'danger'
        });
        break;
      case 'Incorrect':
        //this.otpFeedback.textContent = 'This code is not correct';
        //this.otpInput.setCustomValidity('incorrect');

        const feedback = document.querySelector('#otp-feedback') as HTMLElement;
        feedback.textContent = 'Incorrect code';
        const input = document.querySelector('#otp') as HTMLInputElement;
        input.setCustomValidity('incorrect');
        break;
      default:
        this.toast.serverError(error.error);
    }
  }
}
