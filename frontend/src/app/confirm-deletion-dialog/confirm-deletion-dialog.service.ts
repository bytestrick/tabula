import {Injectable} from '@angular/core';
import {first, Observable, Subject} from 'rxjs';
import {ConfirmDialogOption} from './confirm-deletion-dialog.component';


@Injectable({
  providedIn: 'root'
})
export class ConfirmDeletionDialogService {
  readonly subject: Subject<ConfirmDialogOption> = new Subject<ConfirmDialogOption>();
  readonly onConfirm: Subject<boolean> = new Subject();


  constructor() { }


  show(data: ConfirmDialogOption): Observable<boolean> {
    const response: Observable<boolean> = this.onConfirm.pipe(first());
    this.subject.next(data);
    return response;
  }
}
