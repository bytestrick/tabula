import {Injectable} from '@angular/core';
import {ToastOptions} from './toast.component';
import {Subject} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';

/**
 * The notification service that displays toast messages across the app.
 *
 * We need a service because we can't import/inject the ToastComponent in other components.
 * This service effectively mediates between components in order to provide toast notification.
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
   * @param message Usually `error?.message` of an {@link HttpErrorResponse}
   */
  serverError(message?: string | null) {
    this.show({
      title: 'Server error',
      body: message || 'Unknown server error',
      icon: 'exclamation-triangle-fill',
      background: 'danger',
    });
  }
}
