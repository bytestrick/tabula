import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../auth.service';
import {Router, RouterLink} from '@angular/router';
import {PasswordVisibilityDirective} from '../password-visibility.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, PasswordVisibilityDirective],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  auth = inject(AuthService);
  router = inject(Router);

  // Form fields
  email = '';
  password = '';
  rememberLogin = true;

  private static credentialsAreValid(event: Event): boolean {
    const form = event.target as HTMLFormElement;
    form.classList.add('was-validated');
    if (!form.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    return true;
  }

  /**
   * Basic login with credentials, it's a proxy for the injected {@link AuthService}
   */
  login(event: Event) {
    if (LoginComponent.credentialsAreValid(event)) {
      this.auth.login(this.email, this.password).subscribe({
        next: (res) => {
          // TODO: begin an HTML session on successful login
          console.log(res);
          this.router.navigate(['/']);
          console.log(`Logged in as ${this.email}`);
        },
        // TODO: branch and show visual indicator on wrong credentials
        error: (err) => console.error(`Error logging in: ${err}`),
      });
    }
  }
}
