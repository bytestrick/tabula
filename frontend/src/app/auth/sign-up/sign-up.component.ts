import {Component, ElementRef, inject, viewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {NgForOf} from '@angular/common';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {enableTooltips} from '../../../main';
import {AuthService} from '../auth.service';
import {ToastService} from '../../toast/toast.service';
import {Reason} from '../otp/otp.component';
import {PasswordInputComponent} from '../password-input/password-input.component';

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
  selector: 'app-sign-up',
  standalone: true,
  imports: [FormsModule, RouterLink, NgForOf, PasswordInputComponent],
  templateUrl: './sign-up.component.html',
})
export class SignUpComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private emailInput = viewChild.required<ElementRef<HTMLInputElement>>('emailInput');
  private emailFeedback = viewChild.required<ElementRef<HTMLElement>>('emailFeedback');
  private countryInput = viewChild.required<ElementRef<HTMLSelectElement>>('countryInput');
  protected countryIndex = 0;
  protected countries: Country[] = [];
  protected form: SignUpRequest = {} as SignUpRequest;

  ngOnInit() {
    if (this.auth.isAuthenticated) {
      this.router.navigate(['/']).finally(() => console.log('Already authenticated.'));
      return;
    }

    enableTooltips();

    this.http.get<Country[]>('countries.json').subscribe({
      next: data => this.countries = data,
      error: console.error,
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
    if (parseInt(select.value) > -1) {
      select.setCustomValidity('');
    }
  }

  protected onEmailInput() {
    const [emailInput, emailFeedback] = [this.emailInput().nativeElement, this.emailFeedback().nativeElement];
    if (emailInput.validity.valueMissing) {
      emailFeedback.textContent = 'Email is required';
    } else if (emailInput.validity.typeMismatch) {
      emailFeedback.textContent = 'Invalid email address';
    } else {
      emailInput.setCustomValidity('');
    }
  }

  private isFormValid(event: Event) {
    const form = event.target as HTMLFormElement;
    form.classList.add('was-validated');
    event.preventDefault();
    event.stopPropagation();

    const country = this.countryInput().nativeElement;
    if (country.value === '-1') {
      country.setCustomValidity('Country required');
    }

    return form.checkValidity();
  }

  protected onSubmit(event: Event) {
    if (this.isFormValid(event)) {
      this.http.post('/auth/sign-up', this.form).subscribe({
        next: () => {
          localStorage.setItem('otpData', JSON.stringify({email: this.form.email, reason: Reason.VerifyEmail}));
          this.router.navigate(['/otp']).then();
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400 && error.error?.messsage.startsWith('Email already registered')) {
            this.emailInput().nativeElement.setCustomValidity('already-registered');
            this.emailFeedback().nativeElement.textContent = error.error?.message;
          } else {
            this.toast.serverError(error.error?.message);
          }
        }
      });
    }
  }
}
