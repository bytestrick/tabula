import {Component, ElementRef, inject, OnDestroy, OnInit, viewChild} from '@angular/core';
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
  /** Text color, it's one of {@link https://getbootstrap.com/docs/5.3/utilities/colors/#colors|these Bootstrap classes}
   * without the `text-` prefix */
  color?: string;
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
 * import {ToastService} from './toast.service';
 *
 * inject(ToastService).show({title: 'Important!', body: 'A quick message'});
 * ```
 *
 * @see {@link ToastOptions} for the toast options
 * @see {@link https://getbootstrap.com/docs/5.3/components/toasts/|Bootstraps' toasts}
 */
@Component({
  selector: 'tbl-toasts',
  standalone: true,
  template: `
    <div #container class="toast-container top-0 end-0 p-3 position-fixed"></div>
  `
})
export class ToastComponent implements OnInit, OnDestroy {
  private service = inject(ToastService);
  private subscription?: Subscription;
  private container = viewChild.required<ElementRef<HTMLDivElement>>('container');

  ngOnInit() {
    this.subscription = this.service.subject.subscribe(data => this.show(data));
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  /**
   * Show a toast notification
   */
  private show(options: ToastOptions) {
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
    if (options.color) {
      el.classList.add(`text-${options.color}`);
    }
    if (options.title) {
      // Toast with header and body
      el.innerHTML = `
        <div class="toast-header ${options.color ? `text-${options.color}` : ''}">
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
    this.container().nativeElement.appendChild(el);


    let delay = 5000;
    if (options.delay !== undefined) {
      delay = options.delay;
      if (options.delay > 0) { // endless growth is unsustainable
        setTimeout(() => this.container().nativeElement.removeChild(el), delay + 300);
      }
    }

    Toast.getOrCreateInstance(el, {autohide: delay !== 0, delay}).show();
  }
}
