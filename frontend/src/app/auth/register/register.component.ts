import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {PasswordVisibilityDirective} from '../password-visibility.directive';
import {NgForOf} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {enableTooltips} from '../../../main';
import {AuthService} from '../auth.service';

interface Country {
  name: string,
  flag: string,
  code: string,
  dialCode: string
}

interface RegisterRequest {
  email: string,
  name: string,
  surname: string,
  password: string,
  rememberMe: boolean,
  country: Country
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, PasswordVisibilityDirective, NgForOf],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  http = inject(HttpClient);
  auth = inject(AuthService);
  router = inject(Router);
  countryIndex = 0;
  countries: Country[] = [];

  protected user = {} as RegisterRequest;

  ngOnInit() {
    if (this.auth.isLoggedIn) {
      this.router.navigate(['/'])
        .finally(() => console.log('Already logged in, redirecting to / from /register'));
      return;
    }

    enableTooltips();

    this.http.get<Country[]>('countries.json').subscribe({
      next: data => this.countries = data,
      error: err => console.error('Error getting countries data: ' + err),
    });
  }

  onCountryChange() {
    this.user.country = this.countries[this.countryIndex];
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
      this.http.post('/auth/register', this.user).subscribe({
        next: () => window.location.href = 'login',
        error: err => console.error('Error registering user: ' + err.toString()),
      });
    }
  }
}
