import {Component, inject} from '@angular/core';
import {Toast} from 'bootstrap';
import {Subscription} from 'rxjs';
import {ToastService} from './toast.service';

export interface ToastOptions {
  /** Main content of the toast, can be HTML markup */
  body: string;
  /** Title of the toast that goes in the header */
  title?: string;
  /** An icon name from {@link https://icons.getbootstrap.com|Bootstrap icons}, without the `bi-` prefix.
   *
   * Goes in the header, left of the title. */
  icon?: string;
  /** Background color of the toast. It's one of the Bootstrap background color
   * {@link https://getbootstrap.com/docs/5.3/utilities/background/#background-color|classes}
   * without the `bg-` prefix*/
  background?: string;
  /** Toast duration in milliseconds, if omitted it defaults to 5000ms.
   *
   * If it's 0 the toast doesn't auto hide, but it must be manually dismissed. */
  delay?: number;
}

/**
 * The notification component that displays toast messages across the app.
 * It listens to the {@link ToastService} for incoming messages and displays them.
 *
 * Usage example
 * ```typescript
 * import {ToastsService} from './toasts.service';
 *
 * inject(ToastsService).show({title: 'Important!', body: 'A quick message'});
 * ```
 *
 * @see {@link ToastOptions} for the toast options
 * @see {@link https://getbootstrap.com/docs/5.3/components/toasts/|Bootstraps' toasts}
 */
@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [],
  template: `
    <div class="toast-container top-0 end-0 p-3 position-fixed"></div>
  `
})
export class ToastComponent {
  private service = inject(ToastService);
  private subscription?: Subscription;
  private container?: HTMLElement;

  ngOnInit() {
    this.subscription = this.service.subject.subscribe(this.show);
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  /**
   * Show a toast notification
   */
  private show(options: ToastOptions) {
    if (!this.container) {
      this.container = document.querySelector('.toast-container') as HTMLDivElement;
    }

    const el = document.createElement('div');
    el.classList.add('toast');
    el.classList.add('z-3');
    let iconColor = '';
    if (options.background) {
      el.classList.add(`bg-${options.background}`);
      el.style.setProperty('--bs-bg-opacity', '0.7');
      if (options.icon) {
        iconColor = options.background.endsWith('-subtle') ? options.background.slice(0, -7) : options.background;
      }
    }
    if (options.title) {
      // Toast with header and body
      el.innerHTML = `
        <div class="toast-header">
          ${options.icon ? `<i class="bi bi-${options.icon} ${iconColor ? `text-${iconColor}-emphasis` : ''} me-2"></i>` : ''}
          <strong class="me-auto">${options.title}</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">${options.body}</div>`
    } else {
      // Toast with only body
      el.classList.add('align-items-center');
      el.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${options.body}</div>
        <button aria-label="Close" class="btn-close me-2 m-auto" data-bs-dismiss="toast" type="button"></button>
      </div>`;
    }
    this.container?.appendChild(el);
    Toast.getOrCreateInstance(el, {autohide: options.delay !== 0, delay: options.delay || 5000}).show()
  }
}
