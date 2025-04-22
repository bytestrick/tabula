import {Component, OnInit} from '@angular/core';
import {ToastComponent} from './toast/toast.component';
import {RouterOutlet} from '@angular/router';
import {ThemeService} from './theme.service';

@Component({
  selector: 'tbl-root',
  imports: [ToastComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    // Gestione del tema spostata in theme.service.ts
    // AppComponent.updateColorScheme();
  }

  // /**
  //  * Sync the app color scheme with the OS color scheme
  //  */
  // private static updateColorScheme() {
  //   const darkColorSchemeQuery = matchMedia('(prefers-color-scheme: dark)');
  //   const onChange = (isDark: boolean) => {
  //     document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
  //   };
  //   darkColorSchemeQuery.addEventListener('change', e => onChange(e.matches));
  //   onChange(darkColorSchemeQuery.matches); // at first load
  // }
}
