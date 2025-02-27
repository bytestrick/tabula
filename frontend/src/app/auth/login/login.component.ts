import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  auth = inject(AuthService);
  router = inject(Router);

  email = '';
  password = '';

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
        error: (err) => console.error(`Error logging in: ${err}`),
      });
    }
  }
}
