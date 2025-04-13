import {ComponentFixture, fakeAsync, flush, TestBed, tick} from '@angular/core/testing';

import {ToastComponent, ToastOptions} from './toast.component';
import {ToastService} from './toast.service';
import {By} from '@angular/platform-browser';

describe('ToastsComponent', () => {
  const animationDuration = 300;
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let toast: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [ToastService],
    }).compileComponents();

    toast = TestBed.inject(ToastService);
    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive request through the service subscription', () => {
    const uuid = '65e55339-0a4e-4215-9c02-ab0fbba1f981';

    toast.subject.subscribe((data: ToastOptions) => {
      expect(data).toEqual(jasmine.objectContaining({body: uuid}));
    });

    toast.show({body: uuid})
  });

  it('should show a toast with only a message in the body', () => {
    const content = `About 4 to 7 billion years from now, when hydrogen fusion in the Sun's core diminishes`;
    toast.show({body: content});

    const toastElement = fixture.debugElement.query(By.css('.toast'));

    expect(toastElement).toBeTruthy();
    expect(toastElement.classes['show']).toBeTrue();
    expect(toastElement.query(By.css('.toast-body'))).toBeTruthy();
    expect(toastElement.query(By.css('.toast-body')).nativeElement.textContent).toBe(content);
    expect(toastElement.query(By.css('.toast-header'))).toBeFalsy();
    expect(toastElement.nativeElement.classList).not.toContain(jasmine.stringMatching(/text-[\w\-]+/));
  });

  it('should show a toast with a custom title', () => {
    toast.show({title: 'Sun', body: 'The Sun is the star at the centre of the Solar System.'});

    const header = fixture.debugElement.query(By.css('.toast-header'));
    expect(header).toBeTruthy();
    expect(header.nativeElement.textContent.trim()).toBe('Sun');
  });

  it('should show a toast with a custom background color', () => {
    toast.show({body: 'test', background: 'info-subtle'});

    expect(fixture.debugElement.query(By.css('.toast')).classes['bg-info-subtle']).toBeTrue();
  });

  it('should show a toast with a custom text color for the body and the header', () => {
    toast.show({title: 'test', body: 'test', color: 'body-tertiary'});

    expect(fixture.debugElement.query(By.css('.toast-header')).classes['text-body-tertiary']).toBeTrue();
    expect(fixture.debugElement.query(By.css('.toast')).classes['text-body-tertiary']).toBeTrue();
  });

  it('should show a toast with a custom icon', () => {
    toast.show({title: 'test', body: 'test', icon: 'bullseye'});

    const icon = fixture.debugElement.query(By.css('i.bi'));
    expect(icon).toBeTruthy();
    expect(icon.nativeElement.classList).toContain('bi-bullseye');
  });

  it('should give the icon a color based on the background of the toast', () => {
    toast.show({title: 'test1', body: 'test', icon: 'cake', background: 'success-subtle'});
    expect(fixture.debugElement.query(By.css('.toast')).query(By.css('i.bi'))
      .classes['text-success-emphasis']).toBeTrue();

    toast.show({title: 'test2', body: 'test', icon: 'bank', background: 'warning'});
    const toasts = fixture.debugElement.query(By.css('.toast-container')).children;
    expect(toasts[toasts.length - 1].query(By.css('i.bi')).classes['text-warning-emphasis']).toBeTrue();
  });

  it('should hide the toast after a specific delay', fakeAsync(() => {
    const delay = Math.random() * 1000;
    toast.show({body: 'test', delay});

    const toastElement = fixture.debugElement.query(By.css('.toast'));
    expect(toastElement.classes['show']).toBeTrue();

    const javaScriptTax = 10;
    tick(delay + javaScriptTax);
    expect(toastElement.classes['show']).toBeUndefined();

    flush();
  }));

  it('should clean up the toast after the it is no longer visible', fakeAsync(() => {
    const delay = Math.random() * 1000;
    toast.show({body: 'I am going to get cleaned up soon', delay});

    tick(delay + animationDuration);
    expect(fixture.debugElement.query(By.css('.toast-container')).children).toHaveSize(0);
    flush();
  }));

  it('can show a toast that must be manually dismissed', fakeAsync(() => {
    toast.show({body: 'I am inevitable', delay: 0});
    const toastElement = fixture.debugElement.query(By.css('.toast'));
    expect(fixture.debugElement.query(By.css('.toast-container')).children).toHaveSize(1);
    expect(toastElement.classes['show']).toBeTrue();

    const oneYear = 31557600000;
    tick(oneYear);

    expect(fixture.debugElement.query(By.css('.toast-container')).children).toHaveSize(1);
    expect(toastElement.classes['show']).toBeTrue();
  }));

  it('should let dismiss toasts manually', fakeAsync(() => {
    toast.show({body: 'do it', delay: 0});
    const toastElement = fixture.debugElement.query(By.css('.toast'));

    fixture.debugElement.query(By.css('button.btn-close')).nativeElement.click();
    tick(5); // 🤷
    expect(toastElement.nativeElement.classList.contains('show')).toBeFalse();
    expect(toastElement.nativeElement.classList.contains('hide')).toBeTrue();
  }));
});
