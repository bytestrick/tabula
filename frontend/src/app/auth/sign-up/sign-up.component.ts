import {Component, inject, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {NgForOf} from '@angular/common';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {enableTooltips} from '../../../main';
import {AuthService} from '../auth.service';
import {ToastService} from '../../toasts/toast.service';
import {Reason} from '../otp/otp.component';
import {DoublePassInputComponent} from '../double-pass-input/double-pass-input.component';

interface Country {
  name: string,
  flag: string,
  code: string,
  dialCode: number
}

interface SignUpRequest {
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
  imports: [FormsModule, RouterLink, NgForOf, DoublePassInputComponent],
  templateUrl: './sign-up.component.html',
})
export class SignUpComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  protected countryIndex = 0;
  protected countries: Country[] = [];
  protected form: SignUpRequest = {} as SignUpRequest;

  @ViewChild(DoublePassInputComponent) private pass!: DoublePassInputComponent;

  ngOnInit() {
    if (this.auth.isLoggedIn) {
      this.router.navigate(['/'])
        .finally(() => console.log('Already signed in in, redirecting to / from /register'));
      return;
    }

    enableTooltips();

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
    this.form.password = this.pass.passInput!.value;

    return form.checkValidity();
  }

  private emailInput?: HTMLInputElement;
  private emailFeedback?: HTMLElement;

  protected onSubmit(event: Event) {
    if (this.isFormValid(event)) {
      this.http.post('/auth/sign-up', this.form).subscribe({
        next: () => {
          localStorage.setItem('otpData', JSON.stringify({email: this.form.email, reason: Reason.VerifyEmail}));
          this.router.navigate(['/otp']).then();
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
