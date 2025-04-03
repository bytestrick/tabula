import {Injectable} from '@angular/core';
import {ToastOptions} from './toast.component';
import {Subject} from 'rxjs';

/**
 * The notification service that displays toast messages across the app.
 *
 * We need a service because we can't import/inject the ToatComponent in other components.
 * This service effectively mediates between components in order to provide toats notification.
 *
 * @see {@link ToastComponent}
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  subject = new Subject<ToastOptions>();

  show(data: ToastOptions) {
    this.subject.next(data);
  }

  /**
   * Generic server error. Usually used after properly handling all the relevant errors.
   * @param message Usually the `error` field of {@link HttpErrorResponse}
   */
  serverError(message: string) {
    this.show({
      title: 'Server error',
      body: message || 'Unknown server exception',
      icon: 'exclamation-triangle-fill',
      background: 'danger',
    });
  }
}
