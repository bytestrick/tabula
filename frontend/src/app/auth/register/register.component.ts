import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {PasswordVisibilityDirective} from '../password-visibility.directive';
import {NgForOf} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {enableTooltips} from '../../../main';

interface Country {
  name: string,
  flag: string,
  code: string,
  dialCode: string
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, PasswordVisibilityDirective, NgForOf],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  http = inject(HttpClient);

  countries: Country[] = [];

  // Form fields
  name = '';
  surname = '';
  email = '';
  password = '';
  rememberLogin = true;
  country: Country | string = '';

  ngOnInit() {
    enableTooltips();

    this.http.get<Country[]>('countries.json').subscribe({
      next: data => this.countries = data,
      error: err => console.error('Error getting countries data: ' + err),
    });
  }

  private static formDataIsValid(event: Event) {
    const form = event.target as HTMLFormElement;
    form.classList.add('was-validated');
    if (!form.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    return true;

  }

  register(event: Event) {
    if (RegisterComponent.formDataIsValid(event)) {
    }
  }
}
