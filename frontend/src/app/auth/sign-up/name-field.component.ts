import {Component} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'tbl-name-field',
  imports: [ReactiveFormsModule],
  template: `
    <div class="row mb-3">
      <label for="name" class="form-label p-0">Name</label>
      <div class="input-group p-0 has-validation">
        <input id="name" class="form-control" placeholder="John" type="text" autofocus
               [class.is-valid]="name.touched && name.valid"
               [class.is-invalid]="name.touched && name.invalid" [formControl]="name">
        <div class="invalid-tooltip">
          @if (name.touched && name.invalid) {
            @if (name.errors?.['required']) {
              Name required
            } @else if (name.errors?.['minlength']) {
              Name must be at least 2 characters long
            } @else if (name.errors?.['maxlength']) {
              Name can't be longer than 100 characters
            }
          }
        </div>
      </div>
    </div>
  `
})
export class NameFieldComponent {
  readonly name = new FormControl('', [
    Validators.required,
    Validators.minLength(2),
    Validators.maxLength(100)
  ]);
}
