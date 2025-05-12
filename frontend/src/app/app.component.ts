import {inject} from '@angular/core';
import {ToastComponent} from './toast/toast.component';
import {RouterOutlet} from '@angular/router';
import {ThemeService} from './theme.service';

import {Component, ViewChild, ViewContainerRef, OnInit} from '@angular/core';
import {PopUpManagerService} from './services/pop-up-manager.service';
import {ConfirmDialogComponent} from './confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'tbl-root',
  standalone: true,
  imports: [ToastComponent, RouterOutlet, ConfirmDialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  private popUpManager: PopUpManagerService = inject(PopUpManagerService);

  _ = inject(ThemeService);

  @ViewChild('popUpContainer', { read: ViewContainerRef, static: true }) popUpContainer!: ViewContainerRef;


  ngOnInit() {
    AppComponent.updateColorScheme();
    this.popUpManager.setPopUpContainer(this.popUpContainer);
  }


  /**
   * Sync the app color scheme with the OS color scheme
   */
  private static updateColorScheme() {
    const darkColorSchemeQuery = matchMedia('(prefers-color-scheme: dark)');
    const onChange = (isDark: boolean) => {
      document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
    };
    darkColorSchemeQuery.addEventListener('change', e => onChange(e.matches));
    onChange(darkColorSchemeQuery.matches); // at first load
  }
}
