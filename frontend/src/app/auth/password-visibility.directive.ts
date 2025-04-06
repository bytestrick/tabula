import {Directive, ElementRef, HostListener, inject} from '@angular/core';
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
  private button: HTMLButtonElement = inject(ElementRef).nativeElement;

  @HostListener('click') onClick() {
    const input = this.button.previousElementSibling as HTMLInputElement;
    const icon = this.button.firstElementChild as HTMLElement;
    if (input.type === 'password') {
      input.type = 'text';
      this.button.classList.add('active');
      icon.classList.add('bi-eye-slash');
      icon.classList.remove('bi-eye');
      Tooltip.getInstance(this.button)?.setContent({'.tooltip-inner': 'Hide password'});
    } else {
      input.type = 'password';
      this.button.classList.remove('active');
      icon.classList.add('bi-eye');
      icon.classList.remove('bi-eye-slash');
      Tooltip.getInstance(this.button)?.setContent({'.tooltip-inner': 'Show password'});
    }
  }
}
