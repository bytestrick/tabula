import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ToastComponent} from './toast/toast.component';

@Component({
  selector: 'tbl-root',
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  ngOnInit() {
    AppComponent.updateColorScheme();
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
