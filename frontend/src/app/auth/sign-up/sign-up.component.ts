import {AfterViewInit, Component, inject, OnInit, viewChild} from '@angular/core';
import {AbstractControl, FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {NgForOf} from '@angular/common';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {enableTooltips} from '../../tooltips';
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

@Component({
  selector: 'tbl-sign-up',
  standalone: true,
  imports: [RouterLink, NgForOf, PasswordInputComponent, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
})
export class SignUpComponent implements OnInit, AfterViewInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private formBuilder = inject(FormBuilder);
  private passwordComponent = viewChild.required(PasswordInputComponent);
  protected countries: Country[] = [];

  protected form = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    surname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    password: this.formBuilder.group({password: '', confirm: ''}),
    rememberMe: [false],
    country: [-1, [(select: AbstractControl) => select.value === -1 ? {required: true} : null]]
  });

  ngOnInit() {
    if (this.auth.isAuthenticated) {
      this.router.navigate(['/']).finally(() => console.log('Already authenticated'));
      return;
    }

    enableTooltips();

    this.http.get<Country[]>('countries.json').subscribe({
      next: data => this.countries = data,
      error: console.error,
    });
  }

  ngAfterViewInit() {
    this.form.setControl('password', this.passwordComponent().form);
  }

  protected onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      const data = {
        ...this.form.value,
        password: this.form.controls.password.controls.password.value,
        country: this.countries[this.form.controls.country.value!],
      };

      console.log(data);
      this.http.post('/auth/sign-up', data).subscribe({
        next: () => {
          localStorage.setItem('otpData', JSON.stringify({
            email: this.form.controls.email.value,
            reason: Reason.VerifyEmail
          }));
          this.router.navigate(['/otp']).then();
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400 && error.error?.messsage?.startsWith('Email already registered')) {
            this.form.controls.email.setErrors({alreadyRegistered: true});
          } else {
            this.toast.serverError(error.error?.message);
          }
        }
      });
    }
  }
}
