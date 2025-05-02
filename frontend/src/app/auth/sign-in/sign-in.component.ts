import {AfterViewInit, Component, inject, OnInit, viewChild} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService, SignInRequest} from '../auth.service';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {enableTooltips} from '../../tooltips';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {ToastService} from '../../toast/toast.service';
import {Reason} from '../otp/otp.component';
import {PasswordFieldComponent} from '../single-password-field/password-field.component';

@Component({
  selector: 'tbl-sign-in',
  imports: [RouterLink, ReactiveFormsModule, PasswordFieldComponent],
  templateUrl: './sign-in.component.html'
})
export class SignInComponent implements OnInit, AfterViewInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private http = inject(HttpClient);
  private formBuilder = inject(FormBuilder);
  private returnUrl = '/';
  private password = viewChild.required(PasswordFieldComponent);

  protected form = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    rememberMe: [false],
  });

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    if (this.auth.isAuthenticated) {
      this.router.navigate([this.returnUrl]).finally(() => console.log('Already authenticated'));
      return;
    }
    enableTooltips();
  }

  ngAfterViewInit() {
    this.form.setControl('password', this.password().password)
  }

  protected onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      this.auth.signIn(this.form.value as SignInRequest).subscribe({
        next: () => {
          this.toast.show({
            title: 'Sign in successful',
            body: 'Welcome back!',
            background: 'success',
            icon: 'check-circle-fill',
            delay: 4000
          });
          this.router.navigate([this.returnUrl]).then();
        },
        error: (error: HttpErrorResponse) => {
          if (error.error?.message?.startsWith('No user found')) {
            this.form.controls.email.setErrors({unknownUser: true});
          } else if (error.error?.message?.startsWith('Incorrect')) {
            this.form.controls.password.setErrors({incorrect: true});
          } else if (error.error?.message?.startsWith('Not enabled')) {
            const otpRequest = {email: this.form.controls.email.value, reason: Reason.VerifyEmail};
            this.http.post('/auth/send-otp', otpRequest).subscribe({
              next: () => {
                localStorage.setItem('otpData', JSON.stringify(otpRequest));
                this.toast.show({
                  title: 'Unverified account',
                  body: 'You signed-up but you didn\'t verify your email yet.'
                    + 'You must verify your email to finish the sign-up process.',
                  icon: 'person-fill-exclamation',
                  background: 'warning',
                  delay: 30_000
                });
                this.router.navigate(['/otp']).then();
              },
              error: (error: HttpErrorResponse) => this.toast.serverError(error.error?.message)
            })
          } else {
            this.toast.serverError(error.error?.message);
          }
        }
      });
    }
  }

  protected onForgotPassword() {
    this.form.controls.password.markAsUntouched();
    this.form.controls.email.markAsTouched();
    if (this.form.controls.email.valid) {
      this.http.post('/auth/send-otp', {
        email: this.form.controls.email.value,
        reason: Reason.ResetPassword.toLowerCase()
      }).subscribe({
        next: () => {
          localStorage.setItem('otpData', JSON.stringify({
            email: this.form.controls.email.value,
            reason: Reason.ResetPassword
          }));
          this.router.navigate(['/otp']).then();
        },
        error: (error: HttpErrorResponse) => {
          if (error.error?.message?.startsWith('No user found')) {
            this.form.controls.email.setErrors({unknownUser: true});
          } else {
            this.toast.serverError(error.error?.message);
          }
        }
      });
    }
  }
}
