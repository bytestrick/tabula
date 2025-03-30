import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {PasswordVisibilityDirective} from '../password-visibility.directive';
import {NgForOf} from '@angular/common';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {enableTooltips} from '../../../main';
import {AuthService} from '../auth.service';
import {ToastService} from '../../toasts/toast.service';
import {passRegExp} from '../../app.config';

interface Country {
  name: string,
  flag: string,
  code: string,
  dialCode: number
}

interface RegisterRequest {
  email: string,
  name: string,
  surname: string,
  password: string,
  rememberMe: boolean,
  country: Country
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, PasswordVisibilityDirective, NgForOf],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  protected countryIndex = 0;
  protected countries: Country[] = [];
  protected form: RegisterRequest = {} as RegisterRequest;
  protected repeatPassword = '';

  ngOnInit() {
    if (this.auth.isLoggedIn) {
      this.router.navigate(['/'])
        .finally(() => console.log('Already logged in, redirecting to / from /register'));
      return;
    }

    enableTooltips();

    this.passInput = document.querySelector('#pass-input') as HTMLInputElement;
    this.passFeedback = document.querySelector('#pass-feedback') as HTMLElement;
    this.passRepFeedback = document.querySelector('#pass-repeat-feedback') as HTMLElement;
    this.passRepInput = document.querySelector('#pass-repeat-input') as HTMLInputElement;
    this.emailInput = document.querySelector('#email-input') as HTMLInputElement;
    this.emailFeedback = document.querySelector('#email-feedback') as HTMLElement;

    this.http.get<Country[]>('countries.json').subscribe({
      next: data => this.countries = data,
      error: err => console.error('Error getting countries data: ' + err),
    });
  }

  protected onNameInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const feedback = input.nextSibling!;
    if (input.validity.valueMissing) {
      feedback.textContent = `${input.name.charAt(0).toUpperCase() + input.name.slice(1)} is required`;
    } else if (input.validity.tooShort) {
      feedback.textContent = `Must be at least ${input.minLength} characters long`;
    }
  }

  protected passInput?: HTMLInputElement;
  private passFeedback?: HTMLElement;
  private passRepFeedback?: HTMLElement;
  private passRepInput?: HTMLInputElement;

  protected onPasswordInput() {
    if (this.passInput?.validity.valueMissing) {
      this.passFeedback!.textContent = 'Password is required';
    } else if (this.passInput?.validity.tooShort) {
      this.passFeedback!.textContent = `Must be at least ${this.passInput!.minLength} characters long`;
    } else if (!passRegExp.test(this.passInput!.value)) {
      this.passFeedback!.textContent = 'Password must respect the criteria below';
      this.passInput!.setCustomValidity('invalid');
    } else {
      this.passInput!.setCustomValidity('');
    }

    if (this.passInput?.validity.valid) {
      if (this.passInput?.value === this.passRepInput?.value) {
        this.passInput!.setCustomValidity('');
        this.passRepInput!.setCustomValidity('');
      } else {
        this.passFeedback!.textContent = 'Passwords do not match';
        this.passRepFeedback!.textContent = 'Passwords do not match';
        this.passInput!.setCustomValidity('no-match');
        this.passRepInput!.setCustomValidity('no-match');
      }
    } else {
      this.passRepFeedback!.textContent = 'Invalid password';
      this.passRepInput!.setCustomValidity('invalid');
    }
  }

  protected onCountrySelect(event: Event) {
    this.form.country = this.countries[this.countryIndex];
    const select = event.target as HTMLSelectElement;
    if (select.value !== '0') {
      select.setCustomValidity('');
    }
  }

  protected onEmailInput() {
    if (this.emailInput?.validity.valueMissing) {
      this.emailFeedback!.textContent = 'Email is required';
    } else if (this.emailInput?.validity.typeMismatch) {
      this.emailFeedback!.textContent = 'Invalid email address';
    } else {
      this.emailInput!.setCustomValidity('');
    }
  }

  private isFormValid(event: Event) {
    const form = event.target as HTMLFormElement;
    form.classList.add('was-validated');
    event.preventDefault();
    event.stopPropagation();

    const country = form.querySelector('#country-input') as HTMLSelectElement;
    if (country.value === '0') {
      country.setCustomValidity('Country is required')
    }

    return form.checkValidity();
  }

  private emailInput?: HTMLInputElement;
  private emailFeedback?: HTMLElement;

  protected onSubmit(event: Event) {
    if (this.isFormValid(event)) {
      this.http.post('/auth/register', this.form).subscribe({
        next: () => {
          const timeoutMs = 1500;
          this.toast.show({
            title: 'Sign up successful',
            body: 'You are being redirected',
            icon: 'check-circle-fill',
            background: 'success',
            delay: timeoutMs
          });
          setTimeout(() => this.router.navigate(['/login'])
              .finally(() => console.log('Registered successfully, redirecting to /login from /register')),
            timeoutMs);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400 && error.error.startsWith('Email already registered')) {
            this.emailInput?.setCustomValidity('already-registered');
            this.emailFeedback!.textContent = error.error;
          } else {
            this.toast.serverError(error.error);
          }
        }
      });
    }
  }
}
