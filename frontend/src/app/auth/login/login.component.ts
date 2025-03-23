import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../auth.service';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {PasswordVisibilityDirective} from '../password-visibility.directive';
import {enableTooltips} from '../../../main';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, PasswordVisibilityDirective],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  auth = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  // Form fields
  email = '';
  password = '';
  rememberMe = true;

  returnUrl = '/';

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    if (this.auth.currentUserValue) {
      this.router.navigate([this.returnUrl])
        .finally(() => console.log(`Already logged in, redirecting to ${this.returnUrl} from /login`));
      return;
    }
    enableTooltips();
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

  showAlert(message: string, type: 'success' | 'danger') {
    const container = document.querySelector('#alert-container') as HTMLDivElement;
    const icon = type === 'success' ? 'check-circle' : 'exclamation-triangle';
    container.innerHTML = `
      <div class="alert alert-${type} alert-dismissible d-flex fade show align-items-center" role="alert">
        <i class="bi bi-${icon}-fill me-3 flex-shrink-0"></i>
        <div>${message}</div>
        <button aria-label="Close" class="btn-close" data-bs-dismiss="alert" type="button"></button>
      </div>
    `;
    setTimeout(() => container.innerHTML = '', 4000);
  }

  /**
   * Basic login with credentials, it's a proxy for the injected {@link AuthService}
   */
  login(event: Event) {
    if (LoginComponent.credentialsAreValid(event)) {
      this.auth.login(this.email, this.password, this.rememberMe).subscribe({
        next: () => {
          this.router.navigate([this.returnUrl])
            .finally(() => console.log(`Login successful, redirecting to ${this.returnUrl}`));
        },
        error: (error: HttpErrorResponse) => {
          let message = 'An error occurred while logging in. Please try again later.';
          if (error.error instanceof ErrorEvent) {
            message = 'Network error occurred. Please check your connection.';
          } else switch (error.status) {
            case 400:
              message = 'Incorrect password';
              break;
            case 404:
              message = 'There is no user registered with this email, please register first.';
              break;
          }
          this.showAlert(message, 'danger');
        }
      });
    }
  }
}
