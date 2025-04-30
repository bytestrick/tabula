import {Injectable} from '@angular/core';

export type ThemeMode = 'auto' | 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private theme: ThemeMode = 'auto';
  private mqList!: MediaQueryList;
  private mqListener!: (e: MediaQueryListEvent) => void;


  constructor() {
    const saved = localStorage.getItem('theme') as ThemeMode | null;
    this.theme = saved ?? 'auto';
    this.applyTheme();
  }


  getTheme(): ThemeMode {
    return this.theme;
  }

  setTheme(mode: ThemeMode): void {
    this.theme = mode;
    localStorage.setItem('theme', mode);
    this.applyTheme();
  }

  private applyTheme(): void {
    this.removeSystemListener();

    if (this.theme === 'auto') {
      this.mqList = matchMedia('(prefers-color-scheme: dark)');
      this.mqListener = (e: MediaQueryListEvent): void => this.updateBsTheme(e.matches ? 'dark' : 'light');
      this.mqList.addEventListener('change', this.mqListener);

      this.updateBsTheme(this.mqList.matches ? 'dark' : 'light');

    } else {
      this.updateBsTheme(this.theme);
    }
  }

  private removeSystemListener(): void {
    if (this.mqList && this.mqListener) {
      this.mqList.removeEventListener('change', this.mqListener);
    }
  }

  private updateBsTheme(mode: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-bs-theme', mode);
  }
}
