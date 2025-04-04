import {Component, ElementRef, viewChild} from '@angular/core';
import {PasswordVisibilityDirective} from '../password-visibility.directive';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {passwordRegExp} from '../../app.config';
import {enableTooltips} from '../../../main';

/**
 * A reusable component to be included in `<form>` tags that represents
 * two password input fields with appropriate validation.
 */
@Component({
  selector: 'app-double-pass-input',
  standalone: true,
  imports: [PasswordVisibilityDirective, ReactiveFormsModule, FormsModule],
  templateUrl: './password-input.component.html',
})
export class PasswordInputComponent {
  private passInput = viewChild.required<ElementRef<HTMLInputElement>>('passInput');
  private passFeedback = viewChild.required<ElementRef<HTMLElement>>('passFeedback');
  private passRepFeedback = viewChild.required<ElementRef<HTMLElement>>('passRepFeedback');
  private passRepInput = viewChild.required<ElementRef<HTMLInputElement>>('passRepInput');
  password = '';

  ngOnInit() {
    enableTooltips();
  }

  protected onPasswordInput() {
    const passInput = this.passInput().nativeElement;
    const passFeedback = this.passFeedback().nativeElement;
    const passRepInput = this.passRepInput().nativeElement;
    const passRepFeedback = this.passRepFeedback().nativeElement;

    if (passInput.validity.valueMissing) {
      passFeedback.textContent = 'Password is required';
    } else if (passInput.validity.tooShort) {
      passFeedback.textContent = `Must be at least ${passInput.minLength} characters long`;
    } else if (!passwordRegExp.test(this.password)) {
      passFeedback.textContent = 'Password must respect the criteria below';
      passInput.setCustomValidity('invalid');
    } else {
      passInput.setCustomValidity('');
    }

    if (passInput.validity.valid) {
      if (this.password === passRepInput.value) {
        passInput.setCustomValidity('');
        passRepInput.setCustomValidity('');
      } else {
        passFeedback.textContent = 'Passwords do not match';
        passRepFeedback.textContent = 'Passwords do not match';
        passInput.setCustomValidity('no-match');
        passRepInput.setCustomValidity('no-match');
      }
    } else {
      passRepFeedback.textContent = 'Invalid password';
      passRepInput.setCustomValidity('invalid');
    }
  }
}
