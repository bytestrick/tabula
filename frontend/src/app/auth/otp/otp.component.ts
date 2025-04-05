import {Component, ElementRef, inject, OnInit, viewChild} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {ToastService} from '../../toast/toast.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PasswordInputComponent} from '../password-input/password-input.component';

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
  imports: [ReactiveFormsModule, PasswordInputComponent, FormsModule],
  templateUrl: './otp.component.html',
})
export class OtpComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toast = inject(ToastService);
  private otpFeedback = viewChild<ElementRef<HTMLElement>>('otpFeedback');
  private otpInput = viewChild<ElementRef<HTMLInputElement>>('otpInput');
  protected reason?: Reason;
  protected email?: string | null;
  protected otp = '';
  protected newPassword = '';
  protected showOtpInput = true;

  ngOnInit() {
    const stringData = localStorage.getItem('otpData');
    if (stringData) {
      const data = JSON.parse(stringData);
      this.email = data.email;
      this.reason = data.reason;
    } else {
      console.error('Invalid navigation to /otp');
      this.router.navigate(['/sign-in']).then();
    }
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
          this.toast.serverError(error.error?.message);
        }
      }
    })
  }

  protected onCodeInput() {
    const [otpInput, otpFeedback] = [this.otpInput()!.nativeElement, this.otpFeedback()!.nativeElement];
    if (otpInput.validity.tooShort) {
      otpFeedback.textContent = 'Must be 6 digits long';
    } else if (otpInput.validity.valueMissing) {
      otpFeedback.textContent = 'Please insert the code';
    } else if (!/^\d{6}$/.test(this.otp)) {
      otpFeedback.textContent = 'Only digits are accepted';
      otpInput.setCustomValidity('only-digits');
    } else {
      otpInput.setCustomValidity('');
    }
  }

  private verifyEmail() {
    this.http.post('/auth/verify-email-otp', {email: this.email, otp: this.otp}).subscribe({
      next: () => {
        this.toast.show({
          title: 'Sign up successful',
          body: 'You can sign in into your new account',
          icon: 'check-circle-fill',
          background: 'success',
        });
        this.afterVerification();
      },
      error: (error: HttpErrorResponse) => this.handleVerifyOtpError(error)
    });
  }

  private resetPassword() {
    this.http.post('/auth/reset-password', {
      email: this.email,
      newPassword: this.newPassword,
      otp: this.otp
    }).subscribe({
      next: () => {
        this.toast.show({body: 'Password reset successfully', background: 'success'});
        this.afterVerification();
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.handleUserNotFound();
        } else {
          this.toast.serverError(error.error?.message)
        }
      },
    });
  }

  private verifyResetPasswordOtp(form: HTMLFormElement) {
    this.http.post('/auth/verify-reset-password-otp', {
      email: this.email,
      otp: this.otp
    }).subscribe({
      next: () => {
        form.classList.remove('was-validated');
        this.showOtpInput = false
      },
      error: (error: HttpErrorResponse) => this.handleVerifyOtpError(error)
    });
  }

  protected onSubmit(event: Event) {
    const form = event.target as HTMLFormElement;
    if (this.isFormValid(event, form)) {
      switch (this.reason) {
        case Reason.VerifyEmail:
          this.verifyEmail();
          break;
        case Reason.ResetPassword:
          if (this.showOtpInput) {
            this.verifyResetPasswordOtp(form);
          } else {
            this.resetPassword();
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

  private handleUserNotFound() {
    this.toast.show({
      title: 'User not found',
      body: 'There is not user registered with that email',
      icon: 'person-x',
      background: 'danger',
    });
  }

  private handleVerifyOtpError(error: HttpErrorResponse) {
    if (error.status === 404) {
      this.handleUserNotFound();
    } else switch (error.error?.message) {
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
        this.otpFeedback()!.nativeElement.textContent = 'Incorrect code';
        this.otpInput()!.nativeElement.setCustomValidity('incorrect');
        break;
      default:
        this.toast.serverError(error.error?.message);
    }
  }
}
