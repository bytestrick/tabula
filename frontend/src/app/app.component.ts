import {Component, inject} from '@angular/core';
import {ToastComponent} from './toast/toast.component';
import {RouterOutlet} from '@angular/router';
import {ThemeService} from './theme.service';
import {ConfirmDialogComponent} from './confirm-deletion-dialog/confirm-deletion-dialog.component';

@Component({
  selector: 'tbl-root',
  imports: [ToastComponent, RouterOutlet, ConfirmDialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private themeService: ThemeService = inject(ThemeService);
}
