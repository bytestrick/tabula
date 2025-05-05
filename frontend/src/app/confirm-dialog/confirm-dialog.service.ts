import {Injectable} from '@angular/core';
import {first, Observable, Subject} from 'rxjs';
import {ConfirmDialogOption} from './confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  readonly subject: Subject<ConfirmDialogOption> = new Subject<ConfirmDialogOption>();
  readonly onConfirm: Subject<boolean> = new Subject();

  show(data: ConfirmDialogOption): Observable<boolean> {
    const response: Observable<boolean> = this.onConfirm.pipe(first());
    this.subject.next(data);
    return response;
  }
}
