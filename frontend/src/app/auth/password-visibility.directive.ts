import {Directive, ElementRef, HostListener} from '@angular/core';
import {Tooltip} from 'bootstrap';

/**
 * An {@link https://angular.dev/guide/directives/attribute-directives attribute directive} to toggle the password
 * visibility on a form input
 */
@Directive({
  selector: '[appPasswordVisibility]',
  standalone: true
})
export class PasswordVisibilityDirective {
  private button: HTMLButtonElement;

  constructor(button: ElementRef) {
    this.button = button.nativeElement;
  }

  @HostListener('click') onClick() {
    const input = document.querySelector('#pass-input') as HTMLInputElement;
    const icon = document.querySelector('#pass-icon') as HTMLElement;
    if (input.type === 'password') {
      input.type = 'text';
      this.button.classList.add('active');
      Tooltip.getInstance(this.button)?.setContent({'.tooltip-inner': 'Hide password'});
      icon.classList.add('bi-eye-slash');
      icon.classList.remove('bi-eye');
    } else {
      input.type = 'password';
      this.button.classList.remove('active');
      Tooltip.getInstance(this.button)?.setContent({'.tooltip-inner': 'Show password'});
      icon.classList.add('bi-eye');
      icon.classList.remove('bi-eye-slash');
    }
  }
}
