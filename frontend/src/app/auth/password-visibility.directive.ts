import {Directive, ElementRef, HostListener} from '@angular/core';

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
      this.button.title = 'Hide password';
      icon.classList.add('bi-eye-slash');
      icon.classList.remove('bi-eye');
    } else {
      input.type = 'password';
      this.button.classList.remove('active');
      this.button.title = 'Show password';
      icon.classList.add('bi-eye');
      icon.classList.remove('bi-eye-slash');
    }
  }
}
