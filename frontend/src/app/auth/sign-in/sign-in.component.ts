import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService, SignInRequest} from '../auth.service';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {PasswordVisibilityDirective} from '../password-visibility.directive';
import {enableTooltips} from '../../tooltips';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {ToastService} from '../../toast/toast.service';
import {passwordRegExp} from '../../constants';
import {Reason} from '../otp/otp.component';

@Component({
  selector: 'tbl-sign-in',
  standalone: true,
  imports: [RouterLink, PasswordVisibilityDirective, ReactiveFormsModule],
  templateUrl: './sign-in.component.html',
})
export class SignInComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private http = inject(HttpClient);
  private formBuilder = inject(FormBuilder);
  private returnUrl = '/';

  protected form = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(512),
      Validators.pattern(passwordRegExp)
    ]],
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

  protected onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      this.auth.signIn(this.form.value as SignInRequest).subscribe({
        next: () => {
          // FIXME: if the user is not enabled redirect to OtpComponent
          this.toast.show({
            title: 'Sign in successful',
            body: 'Welcome back!',
            background: 'success',
            icon: 'check-circle-fill',
            delay: 2000
          });
          this.router.navigate([this.returnUrl]).then();
        },
        error: (error: HttpErrorResponse) => {
          if ( error.error?.message?.startsWith('No user found')) {
            this.form.controls.email.setErrors({unknownUser: true});
          } else if (error.error?.message?.startsWith('Incorrect')) {
            this.form.controls.password.setErrors({incorrect: true});
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
