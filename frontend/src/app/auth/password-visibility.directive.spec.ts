import { PasswordVisibilityDirective } from './password-visibility.directive';
import {ElementRef} from '@angular/core';

describe('PasswordVisibilityDirective', () => {
  it('should create an instance', () => {
    const directive = new PasswordVisibilityDirective(new ElementRef(new HTMLButtonElement()));
    expect(directive).toBeTruthy();
  });
});
