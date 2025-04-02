import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../auth.service';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {PasswordVisibilityDirective} from '../password-visibility.directive';
import {enableTooltips} from '../../../main';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {ToastService} from '../../toasts/toast.service';
import {passRegExp} from '../../app.config';
import {Reason} from '../otp/otp.component';

export interface SignInRequest {
  email: string,
  password: string,
  rememberMe: boolean
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, PasswordVisibilityDirective],
  templateUrl: './sign-in.component.html',
})
export class SignInComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private http = inject(HttpClient)
  protected form = {} as SignInRequest;
  private returnUrl = '/';

  private emailInput?: HTMLInputElement;
  private emailFeedback?: HTMLElement;
  private passInput?: HTMLInputElement;
  private passFeedback?: HTMLElement;

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    if (this.auth.isLoggedIn) {
      this.router.navigate([this.returnUrl])
        .finally(() => console.log(`Already logged in, redirecting to ${this.returnUrl} from /sign-in`));
      return;
    }
    enableTooltips();
    this.passInput = document.querySelector('#pass-input') as HTMLInputElement;
    this.passFeedback = document.querySelector('#pass-feedback') as HTMLElement;
    this.emailInput = document.querySelector('#email-input') as HTMLInputElement;
    this.emailFeedback = document.querySelector('#email-feedback') as HTMLElement;
  }

  private isFormValid(event: Event): boolean {
    const form = event.target as HTMLFormElement;
    form.classList.add('was-validated');
    event.preventDefault();
    event.stopPropagation();
    return form.checkValidity();
  }

  protected onEmailInput() {
    if (this.emailInput!.validity.valueMissing) {
      this.emailFeedback!.textContent = 'Email required';
    } else if (this.passInput!.validity.typeMismatch) {
      this.passFeedback!.textContent = 'Invalid email';
    } else {
      this.emailInput!.setCustomValidity('');
    }
  }

  protected onPasswordInput() {
    if (this.passInput!.validity.valueMissing) {
      this.passFeedback!.textContent = 'Password required';
    } else if (this.passInput!.validity.tooShort) {
      this.passFeedback!.textContent = `Must be at least ${this.passInput?.minLength} characters long`;
    } else if (!passRegExp.test(this.passInput!.value)) {
      this.passFeedback!.textContent = `Password doesn't respect the validity criteria`;
      this.passInput!.setCustomValidity('invalid');
    } else {
      this.passInput!.setCustomValidity('');
    }
  }

  protected onSubmit(event: Event) {
    if (this.isFormValid(event)) {
      this.auth.signIn(this.form).subscribe({
        next: () => {
          // FIXME: if the user is not enabled redirect to OtpComponent
          const timeoutMs = 1500;
          this.toast.show({
            title: 'Sign in successful',
            body: 'Welcome back!',
            background: 'success',
            icon: 'check-circle-fill',
            delay: timeoutMs
          });
          this.router.navigate([this.returnUrl]).then();
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400 && error.error.startsWith('There is no user registered')) {
            this.emailInput?.setCustomValidity('already-registered');
            this.emailFeedback!.textContent = error.error;
          } else if (error.status === 400 && error.error.startsWith('Incorrect')) {
            this.passInput?.setCustomValidity('incorrect');
            this.passFeedback!.textContent = error.error;
          } else {
            this.toast.serverError(error.error);
          }
        }
      });
    }
  }

  protected onForgotPassword() {
    if (this.emailInput!.checkValidity()) {
      this.http.post('/auth/send-otp', {email: this.form.email, reason: Reason.ResetPassword.toLowerCase()}).subscribe({
        next: () => {
          localStorage.setItem('otpData', JSON.stringify({email: this.form.email, reason: Reason.ResetPassword}));
          this.router.navigate(['/otp']).then()
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 404) {
            this.toast.show({
              title: `Couldn't send verification code`,
              body: 'No user is registered with that email',
              background: 'danger',
              icon: 'person-x'
            })
          } else {
            this.toast.serverError(error.error);
          }
        }
      })
    } else {
      document.querySelector('div:has(#email-input)')!.classList.add('was-validated');
    }
  }
}
