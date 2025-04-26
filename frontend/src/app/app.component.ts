import {Component, inject} from '@angular/core';
import {ToastComponent} from './toast/toast.component';
import {RouterOutlet} from '@angular/router';
import {ThemeService} from './theme.service';

@Component({
  selector: 'tbl-root',
  imports: [ToastComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private themeService: ThemeService = inject(ThemeService);
}
