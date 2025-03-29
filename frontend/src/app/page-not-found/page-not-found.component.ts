import {Component, ElementRef, inject} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="container text-center">
      <h1 class="mb-5">Page Not Found</h1>

      <h5 class="mb-5"><span class="font-monospace">{{ currentPage }}</span> doesn't exist</h5>

      <div class="d-flex justify-content-center">
        <button id="go-back" (click)="onGoBack()" class="btn btn-primary">Go back</button>
        <button id="go-home" routerLink="/" class="btn btn-secondary">Go Home</button>
      </div>
    </main>
  `
})
export class PageNotFoundComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private self = inject(ElementRef).nativeElement as HTMLElement;

  returnUrl = this.route.snapshot.queryParams['returnUrl'];

  currentPage = this.router.url;

  ngOnInit() {
    if (!this.returnUrl) {
      this.self.querySelector("#go-back")!.classList.add("d-none");
    }
  }

  onGoBack() {
    this.router.navigate(this.returnUrl).finally(console.log);
  }
}
