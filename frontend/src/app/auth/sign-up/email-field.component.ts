import {Component} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'tbl-email-field',
  imports: [
    ReactiveFormsModule
  ],
  template: `
    <div class="row mb-3">
      <label for="email" class="form-label p-0">Email address</label>
      <div class="input-group p-0 has-validation position-relative">
        <input id="email" class="form-control" type="email" [formControl]="email" placeholder="john.doe@example.com"
               autocomplete="username" [class.is-valid]="email.touched && email.valid"
               [class.is-invalid]="email.touched && email.invalid">
        <div class="invalid-tooltip">
          @if (email.touched && email.invalid) {
            @if (email.errors?.['required']) {
              Email required
            } @else if (email.errors?.['email']) {
              Invalid email
            } @else if (email.errors?.['alreadyRegistered']) {
              Email already registered
            }
          }
        </div>
      </div>
    </div>
  `
})
export class EmailFieldComponent {
  readonly email = new FormControl('', [Validators.required, Validators.email]);
}
