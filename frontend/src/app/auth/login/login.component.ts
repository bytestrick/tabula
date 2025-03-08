import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../auth.service';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  auth = inject(AuthService);
  router = inject(Router);

  email = '';
  password = '';

  togglePasswordVisibility() {
    const input = document.querySelector('#pass-input') as HTMLInputElement;
    const show = document.querySelector('#eye-icon') as HTMLElement;
    const button = document.querySelector('#pass-visible') as HTMLElement;
    if (input.type === 'password') {
      input.type = 'text';
      button.classList.add('active');
      button.title = 'Hide password';
      show.classList.add('bi-eye-slash');
      show.classList.remove('bi-eye');
    } else {
      input.type = 'password';
      button.classList.remove('active');
      button.title = 'Show password';
      show.classList.add('bi-eye');
      show.classList.remove('bi-eye-slash');
    }
  }

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
   * Basic login with credentials, is a proxy for the injected {@link AuthService}
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
