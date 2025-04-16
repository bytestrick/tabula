import {PasswordVisibilityDirective} from './password-visibility.directive';
import {Component, DebugElement} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {enableTooltips} from '../tooltips';

@Component({
  template: `
    <input type="password">
    <button tblPasswordVisibility data-bs-toggle="tooltip" data-bs-title="Show password">
      <i class="bi bi-eye"></i>
    </button>
  `,
  imports: [PasswordVisibilityDirective]
})
class TestComponent {
}

describe('PasswordVisibilityDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let directive: PasswordVisibilityDirective;
  let inputElement: DebugElement;
  let buttonElement: DebugElement;
  let iconElement: DebugElement;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [PasswordVisibilityDirective, TestComponent]
    }).createComponent(TestComponent);

    fixture.detectChanges();

    buttonElement = fixture.debugElement.query(By.directive(PasswordVisibilityDirective));
    inputElement = fixture.debugElement.query(By.css('input'));
    iconElement = buttonElement.query(By.css('i'));

    directive = buttonElement.injector.get(PasswordVisibilityDirective);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
    expect(inputElement.nativeElement.type).toBe('password');
  });

  it('should initially hide the password', async () => {
    enableTooltips();

    expect(inputElement.nativeElement.type).toBe('password');
    expect(buttonElement.nativeElement.classList).not.toContain('active');
    expect(iconElement.nativeElement.classList).not.toContain('bi-eye-slash');
    expect(iconElement.nativeElement.classList).toContain('bi-eye');

    buttonElement.nativeElement.dispatchEvent(new Event('mouseover'));
    await new Promise(resolve => setTimeout(resolve, 200));
    const tooltip = document.querySelector('.tooltip.show .tooltip-inner');
    expect(tooltip!.textContent).toBe('Show password');
    tooltip!.remove();
  });

  it('should show the password after a click', async () => {
    enableTooltips();

    buttonElement.nativeElement.click();
    expect(inputElement.nativeElement.type).toBe('text');
    expect(buttonElement.nativeElement.classList).toContain('active');
    expect(iconElement.nativeElement.classList).toContain('bi-eye-slash');
    expect(iconElement.nativeElement.classList).not.toContain('bi-eye');

    buttonElement.nativeElement.dispatchEvent(new Event('mouseover'));
    await new Promise(resolve => setTimeout(resolve, 200));
    const tooltip = document.querySelector('.tooltip.show .tooltip-inner');
    expect(tooltip!.textContent).toBe('Hide password');
    tooltip!.remove();
  });

  it('should alternate between shown/hidden password', () => {
    buttonElement.nativeElement.click();
    expect(inputElement.nativeElement.type).toBe('text');
    buttonElement.nativeElement.click();
    expect(inputElement.nativeElement.type).toBe('password');
    buttonElement.nativeElement.click();
    expect(inputElement.nativeElement.type).toBe('text');
    buttonElement.nativeElement.click();
    expect(inputElement.nativeElement.type).toBe('password');
    buttonElement.nativeElement.click();
    expect(inputElement.nativeElement.type).toBe('text');
  });
});
