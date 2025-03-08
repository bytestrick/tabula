import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {PasswordVisibilityDirective} from '../password-visibility.directive';
import {NgForOf} from '@angular/common';
import {HttpClient} from '@angular/common/http';

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
    this.http.get<Country[]>('countries.json').subscribe({
      next: data => this.countries = data,
      error: err => console.error('Error getting countries data: ' + err),
    });
  }

  register(event: Event) {
  }
}
