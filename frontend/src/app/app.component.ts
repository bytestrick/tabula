import {Component, inject} from '@angular/core';
import {ToastComponent} from './toast/toast.component';
import {RouterOutlet} from '@angular/router';
import {ThemeService} from './theme.service';
import {ConfirmDialogComponent} from './confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'tbl-root',
  imports: [ToastComponent, RouterOutlet, ConfirmDialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  _ = inject(ThemeService);
}
