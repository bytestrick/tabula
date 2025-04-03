import {Component} from '@angular/core';
import {PasswordVisibilityDirective} from '../password-visibility.directive';
import {ReactiveFormsModule} from '@angular/forms';
import {passRegExp} from '../../app.config';
import {enableTooltips} from '../../../main';

/**
 * A reusable component to be included in `<form>` tags that represents
 * two password input fields with appropriate validation.
 */
@Component({
  selector: 'app-double-pass-input',
  standalone: true,
  imports: [PasswordVisibilityDirective, ReactiveFormsModule],
  templateUrl: './double-pass-input.component.html',
})
export class DoublePassInputComponent {
  passInput?: HTMLInputElement;
  private passFeedback?: HTMLElement;
  private passRepFeedback?: HTMLElement;
  private passRepInput?: HTMLInputElement;

  ngOnInit() {
    this.passInput = document.querySelector('#pass-input') as HTMLInputElement;
    this.passFeedback = document.querySelector('#pass-feedback') as HTMLElement;
    this.passRepFeedback = document.querySelector('#pass-repeat-feedback') as HTMLElement;
    this.passRepInput = document.querySelector('#pass-repeat-input') as HTMLInputElement;
    enableTooltips();
  }

  protected onPasswordInput() {
    if (this.passInput?.validity.valueMissing) {
      this.passFeedback!.textContent = 'Password is required';
    } else if (this.passInput?.validity.tooShort) {
      this.passFeedback!.textContent = `Must be at least ${this.passInput!.minLength} characters long`;
    } else if (!passRegExp.test(this.passInput!.value)) {
      this.passFeedback!.textContent = 'Password must respect the criteria below';
      this.passInput!.setCustomValidity('invalid');
    } else {
      this.passInput!.setCustomValidity('');
    }

    if (this.passInput?.validity.valid) {
      if (this.passInput?.value === this.passRepInput?.value) {
        this.passInput!.setCustomValidity('');
        this.passRepInput!.setCustomValidity('');
      } else {
        this.passFeedback!.textContent = 'Passwords do not match';
        this.passRepFeedback!.textContent = 'Passwords do not match';
        this.passInput!.setCustomValidity('no-match');
        this.passRepInput!.setCustomValidity('no-match');
      }
    } else {
      this.passRepFeedback!.textContent = 'Invalid password';
      this.passRepInput!.setCustomValidity('invalid');
    }
  }
}
