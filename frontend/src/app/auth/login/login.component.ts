import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../auth.service';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {PasswordVisibilityDirective} from '../password-visibility.directive';
import {enableTooltips} from '../../../main';
import {HttpErrorResponse} from '@angular/common/http';

export interface LoginRequest {
  email: string,
  password: string,
  rememberMe: boolean
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, PasswordVisibilityDirective],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  protected form = {} as LoginRequest;
  private returnUrl = '/';
  private emailInput?: HTMLInputElement;
  private emailFeedback?: HTMLElement;
  private passInput?: HTMLInputElement;
  private passFeedback?: HTMLElement;

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    if (this.auth.isLoggedIn) {
      this.router.navigate([this.returnUrl])
        .finally(() => console.log(`Already logged in, redirecting to ${this.returnUrl} from /login`));
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
    } else {
      this.passInput!.setCustomValidity('');
    }
  }

  /**
   * Basic login with credentials.
   */
  login(event: Event) {
    if (this.isFormValid(event)) {
      this.auth.login(this.form).subscribe({
        next: () => {
          this.router.navigate([this.returnUrl])
            .finally(() => console.log(`Login successful, redirecting to ${this.returnUrl}`));
        },
        error: (error: HttpErrorResponse) => {
          if (error.error instanceof ErrorEvent || error.error instanceof ProgressEvent) {
            //`Can't reach the server, it might be our fault. Please check your connection.`;
          } else if (error.status === 400 && error.error.startsWith('There is no user registered')) {
            this.emailInput?.setCustomValidity('already-registered');
            this.emailFeedback!.textContent = error.error;
          } else if (error.status === 400 && error.error.startsWith('Incorrect')) {
            this.passInput?.setCustomValidity('incorrect');
            this.passFeedback!.textContent = error.error;
          }
        }
      });
    }
  }
}
