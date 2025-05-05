import {AfterViewInit, Component, inject, OnInit, viewChild} from '@angular/core';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {enableTooltips} from '../../tooltips';
import {AuthService} from '../auth.service';
import {ToastService} from '../../toast/toast.service';
import {Reason} from '../otp/otp.component';
import {PasswordInputComponent} from '../password-input/password-input.component';
import {NameFieldComponent} from './name-field.component';
import {SurnameFieldComponent} from './surname-field.component';
import {CountrySelectComponent} from './country-select.component';
import {EmailFieldComponent} from './email-field.component';

@Component({
  selector: 'tbl-sign-up',
  imports: [
    RouterLink,
    PasswordInputComponent,
    ReactiveFormsModule,
    NameFieldComponent,
    SurnameFieldComponent,
    CountrySelectComponent,
    EmailFieldComponent
  ],
  templateUrl: './sign-up.component.html'
})
export class SignUpComponent implements OnInit, AfterViewInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private formBuilder = inject(FormBuilder);
  private passwordComponent = viewChild.required(PasswordInputComponent);
  private nameFieldComponent = viewChild.required(NameFieldComponent);
  private surnameFieldComponent = viewChild.required(SurnameFieldComponent);
  private emailFieldComponent = viewChild.required(EmailFieldComponent);
  private countrySelectComponent = viewChild.required(CountrySelectComponent);

  protected form = this.formBuilder.group({
    email: ['',],
    name: [''],
    surname: [''],
    password: this.formBuilder.group({password: '', confirm: ''}),
    rememberMe: [false],
    country: [-1]
  });

  ngOnInit() {
    if (this.auth.isAuthenticated) {
      this.router.navigate(['/']).finally(() => console.log('Already authenticated'));
      return;
    }
    enableTooltips();
  }

  ngAfterViewInit() {
    this.form.setControl('password', this.passwordComponent().form);
    this.form.setControl('name', this.nameFieldComponent().name);
    this.form.setControl('surname', this.surnameFieldComponent().surname);
    this.form.setControl('country', this.countrySelectComponent().country);
    this.form.setControl('email', this.emailFieldComponent().email);
  }

  protected onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      this.http.post('/auth/sign-up', {
        ...this.form.value,
        password: this.form.controls.password.controls.password.value,
        country: this.countrySelectComponent().countries[this.form.controls.country.value!],
      }).subscribe({
        next: () => {
          localStorage.setItem('otpData', JSON.stringify({
            email: this.form.controls.email.value,
            reason: Reason.VerifyEmail
          }));
          this.router.navigate(['/otp']).then();
          this.toast.show({
            title: 'Sign up successful',
            body: 'Now you must verify your email to finish the sign-up process',
            icon: 'person-fill-add',
            background: 'info',
            delay: 15_000
          });
        },
        error: (error: HttpErrorResponse) => {
          if (error.error?.message?.startsWith('Email already registered')) {
            this.form.controls.email.setErrors({alreadyRegistered: true});
          } else {
            this.toast.serverError(error.error?.message);
          }
        }
      });
    }
  }
}
