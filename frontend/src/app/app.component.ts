import {inject} from '@angular/core';
import {ToastComponent} from './toast/toast.component';
import {RouterOutlet} from '@angular/router';
import {ThemeService} from './theme.service';
import {ConfirmDialogComponent} from './confirm-dialog/confirm-dialog.component';

import {Component, ViewChild, ViewContainerRef, OnInit} from '@angular/core';
import {PopUpManagerService} from './services/pop-up-manager.service';


@Component({
  selector: 'tbl-root',
  imports: [ToastComponent, RouterOutlet, ConfirmDialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  _ = inject(ThemeService);

  @ViewChild('popUpContainer', { read: ViewContainerRef }) popUpContainer!: ViewContainerRef;
  

  ngOnInit() {
    AppComponent.updateColorScheme();
    this.popUpManager.setPopUpContainer(this.popUpContainer);
  }


  constructor(private popUpManager: PopUpManagerService) {}


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
