import {Component, inject, OnInit} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import {passwordRegExp} from '../../constants';
import {enableTooltips} from '../../tooltips';
import {PasswordVisibilityDirective} from '../password-visibility.directive';

/**
 * A reusable component to be included in `<form>` tags that represents
 * two password input fields with appropriate validation.
 */
@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [PasswordVisibilityDirective, ReactiveFormsModule],
  templateUrl: './password-input.component.html',
})
export class PasswordInputComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private readonly validators = [
    Validators.required,
    Validators.minLength(10),
    Validators.maxLength(512),
    Validators.pattern(passwordRegExp),
  ];

  readonly form = this.formBuilder.group(
    {password: ['', this.validators], confirm: ['', this.validators],},
    {validators: this.passwordsMatch}
  );

  ngOnInit() {
    enableTooltips();
  }

  private passwordsMatch(control: AbstractControl): ValidationErrors | null {
    const form = control as FormGroup;
    const [password, confirm] = [form.controls['password'], form.controls['confirm']];
    if (password.valid && confirm.valid && password?.value !== confirm?.value) {
      const error: ValidationErrors = {passwordMismatch: true};
      password.setErrors(error);
      confirm.setErrors(error);
      return error;
    }
    password.updateValueAndValidity({onlySelf: true});
    confirm.updateValueAndValidity({onlySelf: true});
    return null;
  }
}
