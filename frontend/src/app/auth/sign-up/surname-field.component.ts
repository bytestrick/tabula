import {Component} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'tbl-surname-field',
  imports: [ReactiveFormsModule],
  template: `
    <div class="row mb-3 position-relative">
      <label for="surname" class="form-label p-0">Surname</label>
      <div class="input-group p-0 has-validation">
        <input id="surname" class="form-control" placeholder="Doe" type="text" [formControl]="surname"
               [class.is-valid]="surname.touched && surname.valid"
               [class.is-invalid]="surname.touched && surname.invalid">
        <div class="invalid-tooltip">
          @if (surname.touched && surname.invalid) {
            @if (surname.errors?.['required']) {
              Surname required
            } @else if (surname.errors?.['minlength']) {
              Surname must be at least 2 characters long
            } @else if (surname.errors?.['maxlength']) {
              Surname can't be longer than 100 characters
            }
          }
        </div>
      </div>
    </div>
  `
})
export class SurnameFieldComponent {
  readonly surname = new FormControl('', [
    Validators.required,
    Validators.minLength(2),
    Validators.maxLength(100)
  ]);
}
