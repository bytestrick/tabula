import {Component, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'tbl-page-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="container text-center">
      <h1 class="mb-5">Page Not Found</h1>

      <h5 class="mb-5"><span class="font-monospace">{{ currentPage }}</span> doesn't exist</h5>

      <div class="d-flex justify-content-center">
        <button id="go-home" routerLink="/" class="btn btn-primary">Go Home</button>
      </div>
    </main>
  `
})
export class PageNotFoundComponent {
  protected currentPage = inject(Router).url;
}
