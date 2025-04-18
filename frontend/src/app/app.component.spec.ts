import {TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should synchronize the color scheme of the app with that of the OS', () => {
    const mql = new MockMediaQueryList(false);
    spyOn(window, 'matchMedia').and.returnValue(mql);
    TestBed.createComponent(AppComponent).detectChanges();

    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light');

    mql.setMatches(true);
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');

    mql.setMatches(false);
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light');
  })
});

class MockMediaQueryList implements MediaQueryList {
  private _matches: boolean;
  private _listeners: EventListenerOrEventListenerObject[] = [];

  constructor(matches: boolean) {
    this._matches = matches;
  }

  get matches(): boolean {
    return this._matches;
  }

  get media(): string {
    return '(prefers-color-scheme: dark)';
  }

  addEventListener = (_: string, listener: EventListener) => this._listeners.push(listener);

  removeEventListener(_: string, listener: EventListener): void {
    const index = this._listeners.indexOf(listener);
    if (index !== -1) this._listeners.splice(index, 1);
  }

  dispatchEvent(event: Event): boolean {
    this._listeners.forEach(listener => {
      if (typeof listener === 'function') {
        listener(event);
      } else {
        listener.handleEvent(event);
      }
    });
    return true;
  }

  setMatches(matches: boolean): void {
    this._matches = matches;
    const event = new Event('change');
    Object.defineProperty(event, 'matches', {get: () => this._matches});
    this.dispatchEvent(event);
  }

  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null = null;

  addListener(_: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null): void {
  }

  removeListener(_: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null): void {
  }
}
