import {Component} from '@angular/core';
import {PasswordVisibilityDirective} from "../password-visibility.directive";
import {FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {passwordRegExp} from '../../constants';

@Component({
  selector: 'tbl-password-field',
  imports: [PasswordVisibilityDirective, ReactiveFormsModule],
  templateUrl: './password-field.component.html',
})
export class PasswordFieldComponent {
  readonly password = new FormControl('', [
    Validators.required,
    Validators.minLength(10),
    Validators.maxLength(512),
    Validators.pattern(passwordRegExp)
  ]);
}
