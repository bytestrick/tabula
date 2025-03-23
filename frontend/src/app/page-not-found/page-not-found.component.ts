import {Component, inject} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './page-not-found.component.html',
})
export class PageNotFoundComponent {
  router = inject(Router);
  route = inject(ActivatedRoute);

  returnUrl = this.route.snapshot.queryParams['returnUrl'];

  currentPage = this.router.url;

  ngOnInit() {
    if (!this.returnUrl) {
      document.querySelector("#go-back")!.classList.add("d-none");
    }
  }

  onGoBack() {
    this.router.navigate(this.returnUrl).finally(console.log);
  }
}
