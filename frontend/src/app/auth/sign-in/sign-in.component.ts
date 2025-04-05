import {Component, ElementRef, inject, OnInit, viewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../auth.service';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {PasswordVisibilityDirective} from '../password-visibility.directive';
import {enableTooltips} from '../../tooltips';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {ToastService} from '../../toast/toast.service';
import {passwordRegExp} from '../../constants';
import {Reason} from '../otp/otp.component';

export interface SignInRequest {
  email: string,
  password: string,
  rememberMe: boolean
}

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [FormsModule, RouterLink, PasswordVisibilityDirective],
  templateUrl: './sign-in.component.html',
})
export class SignInComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private http = inject(HttpClient)
  protected form = {} as SignInRequest;
  private returnUrl = '/';
  private emailInput = viewChild.required<ElementRef<HTMLInputElement>>('emailInput');
  private emailFeedback = viewChild.required<ElementRef<HTMLElement>>('emailFeedback');
  private passwordInput = viewChild.required<ElementRef<HTMLInputElement>>('passwordInput');
  private passwordFeedback = viewChild.required<ElementRef<HTMLElement>>('passwordFeedback');

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    if (this.auth.isAuthenticated) {
      this.router.navigate([this.returnUrl]).finally(() => console.log('Already authenticated'));
      return;
    }
    enableTooltips();
  }

  private isFormValid(event: Event): boolean {
    const form = event.target as HTMLFormElement;
    this.emailFeedback().nativeElement.textContent = 'Email required';
    form.classList.add('was-validated');
    event.preventDefault();
    event.stopPropagation();
    return form.checkValidity();
  }

  protected onEmailInput() {
    const [input, feedback] = [this.emailInput().nativeElement, this.emailFeedback().nativeElement];
    if (input.validity.valueMissing) {
      feedback.textContent = 'Email required';
    } else if (input.validity.typeMismatch) {
      feedback.textContent = 'Invalid email';
    } else {
      input.setCustomValidity('');
    }
  }

  protected onPasswordInput() {
    const [input, feedback] = [this.passwordInput().nativeElement, this.passwordFeedback().nativeElement];
    if (input.validity.valueMissing) {
      feedback.textContent = 'Password required';
    } else if (input!.validity.tooShort) {
      feedback.textContent = `Must be at least ${input.minLength} characters long`;
    } else if (!passwordRegExp.test(input.value)) {
      feedback.textContent = `Password doesn't respect the validity criteria`;
      input.setCustomValidity('invalid');
    } else {
      input.setCustomValidity('');
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
          if (error.status === 400 && error.error?.message.startsWith('There is no user registered')) {
            this.emailInput().nativeElement.setCustomValidity('already-registered');
            this.emailFeedback().nativeElement.textContent = error.error?.message;
          } else if (error.status === 400 && error.error?.message.startsWith('Incorrect')) {
            this.passwordInput().nativeElement.setCustomValidity('incorrect');
            this.passwordFeedback().nativeElement.textContent = error.error?.message;
          } else {
            this.toast.serverError(error.error?.message);
          }
        }
      });
    }
  }

  protected onForgotPassword() {
    const emailInput = this.emailInput().nativeElement;
    if (emailInput.checkValidity()) {
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
            this.toast.serverError(error.error?.message);
          }
        }
      })
    } else {
      this.emailFeedback().nativeElement.textContent = 'To reset your password, please enter your email';
      emailInput.parentElement!.classList.add('was-validated'); // only validate the email input
      document.querySelector('form')!.classList.remove('was-validated');
    }
  }
}
