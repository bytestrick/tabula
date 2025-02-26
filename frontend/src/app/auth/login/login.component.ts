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

  username = '';
  password = '';

  /**
   * Basic login with credentials, is a proxy for the injected {@link AuthService}
   */
  login() {
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.router.navigate(["/"]);
        console.info(`Logged in as ${this.username}`);
      },
      error: (err) => console.error(err),
    });
  }
}
