import {AfterViewInit, Component, ElementRef, inject, output, Signal, viewChild} from '@angular/core';
import {AuthService} from '../../auth/auth.service';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {ToastService} from '../../toast/toast.service';
import {Modal} from 'bootstrap';
import {NameFieldComponent} from '../../auth/sign-up/name-field.component';
import {SurnameFieldComponent} from '../../auth/sign-up/surname-field.component';
import {CountrySelectComponent} from '../../auth/sign-up/country-select.component';
import {EmailFieldComponent} from '../../auth/sign-up/email-field.component';
import {UserDetails} from '../navbar.service';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'tbl-update-account-details',
  imports: [NameFieldComponent, SurnameFieldComponent, CountrySelectComponent, EmailFieldComponent, ReactiveFormsModule],
  templateUrl: './update-account-details.component.html',
  styles: `
    tbl-name-field, tbl-surname-field, tbl-country-select, tbl-email-field {
      display: block !important;
      padding: 0 0.8rem !important;
    }
    tbl-otp {
      display: block !important;
      padding: 0 2rem !important;
    }
  `
})
export class UpdateAccountDetailsComponent implements AfterViewInit {
  protected auth = inject(AuthService);
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private formBuilder = inject(FormBuilder);
  private modal?: Modal;
  private verifyNewEmailModal?: Modal;
  private dialog: Signal<ElementRef> = viewChild.required('accountDetailsDialog');
  private verifyNewEmailDialog: Signal<ElementRef> = viewChild.required('verifyNewEmailDialog');
  private name = viewChild.required(NameFieldComponent);
  private surname = viewChild.required(SurnameFieldComponent);
  private email = viewChild.required(EmailFieldComponent);
  private country = viewChild.required(CountrySelectComponent);
  protected detailsUpdated = output<UserDetails>();
  protected form = this.formBuilder.group({
    name: [''],
    surname: [''],
    country: [-1],
    email: [''],
  });
  protected otp = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
    Validators.maxLength(6),
    Validators.pattern(/^\d{6}$/)
  ]);

  ngAfterViewInit() {
    const el = this.dialog().nativeElement as HTMLDivElement;
    el.remove();
    document.body.appendChild(el);
    this.modal = new Modal(el);
    el.addEventListener('hidden.bs.modal', () => {
      this.form.markAsUntouched();
    });

    const verifyEmailModalEl = this.verifyNewEmailDialog().nativeElement as HTMLDivElement;
    verifyEmailModalEl.remove();
    document.body.appendChild(verifyEmailModalEl);
    this.verifyNewEmailModal = new Modal(verifyEmailModalEl);
    verifyEmailModalEl.addEventListener('hidden.bs.modal', () => {
      this.otp.markAsUntouched();
    });
    this.form.setControl('name', this.name().name);
    this.form.setControl('surname', this.surname().surname);
    this.form.setControl('country', this.country().country);
    this.form.setControl('email', this.email().email);
    this.fetchDetails();
  }

  protected onDismiss() {
    if (this.form.dirty) {
      this.fetchDetails();
    }
  }

  private fetchDetails() {
    this.http.get<UserDetails>('/user', {params: {email: this.auth.authentication!.email}}).subscribe({
      next: userDetails => this.form.setValue({
        ...userDetails,
        country: this.country().countries.findIndex(country => country.code === userDetails.country!.code)
      }),
      error: () => this.toast.show({ // quite unlikely
        body: 'There was an error while fetching user details',
        background: 'warning-subtle'
      })
    });
  }

  protected onUpdateAccountDetails() {
    this.modal!.show();
  }

  protected onConfirm() {
    if (this.form.dirty) {
      this.form.markAllAsTouched();
      if (this.form.valid) {
        if (this.form.controls.email.value !== this.auth.authentication!.email) {
          this.modal?.hide();
          this.sendOtp();
          this.verifyNewEmailModal?.show();
        } else {
          this.sendUpdateRequest('');
        }
      }
    }
  }

  protected sendOtp() {
    this.http.post('/auth/send-otp', {
      email: this.auth.authentication!.email,
      receiver: this.form.controls.email.value,
      reason: 'verify your new email address'
    }).subscribe({
      next: () => this.toast.show({
        body: 'A verification code was sent to your email address',
        background: 'info-subtle',
      }),
      error: () => this.toast.show({
        body: 'Error sending the verification code.',
        background: 'warning-subtle'
      })
    });
  }

  protected onOtpConfirm() {
    if (this.otp.valid) {
      this.sendUpdateRequest(this.otp.value!);
    }
  }

  protected onGoBack() {
    this.verifyNewEmailModal?.hide();
    this.modal?.show()
  }

  private sendUpdateRequest(otp: string) {
    this.http.patch<{token: string}>('/user', {
      userDetails: {
        ...this.form.value,
        country: this.country().countries[this.form.controls.country.value!],
      },
      otp
    }, {params: {email: this.auth.authentication!.email}}).subscribe({
      next: (response) => {
        this.toast.show({
          body: 'Account details updated successfully.',
          background: 'success',
        });
        // handle case in which the email has changed
        if (this.form.controls.email.value && response.token !== "") {
          this.auth.authentication = {
            email: this.form.controls.email.value,
            token: response.token
          };
        }
        this.detailsUpdated.emit(this.form.value as UserDetails);
        this.otp.reset();
        this.modal?.hide();
        this.verifyNewEmailModal?.hide();
      },
      error: (error: HttpErrorResponse) => {
        if (error.error?.message === 'Incorrect') {
          this.otp.setErrors({incorrect: true});
        } else if (error.error?.message === 'Expired') {
          this.otp.setErrors({expired: true});
        } else {
          this.toast.show({
            body: 'Error updating account details.',
            background: 'warning-subtle'
          });
        }
      }
    });
  }
}
