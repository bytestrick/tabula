import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PasswordInputComponent} from './password-input.component';

describe('PasswordInputComponent', () => {
  let component: PasswordInputComponent;
  let fixture: ComponentFixture<PasswordInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate the equality of the two password fields at the same time and show appropriate feedback', () => {
    const password = fixture.nativeElement.querySelector('#pass') as HTMLInputElement;
    const confirm = fixture.nativeElement.querySelector('#confirm') as HTMLInputElement;
    const pw = 'fa4ff-@!\\94d1L';
    password.value = pw;
    confirm.value = `${pw}foo`;
    password.dispatchEvent(new Event('input'));
    confirm.dispatchEvent(new Event('input'));

    component.form.markAllAsTouched();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('div div:first-of-type div.invalid-tooltip')!.textContent.trim())
      .toBe('Passwords do not match');
    expect(fixture.nativeElement.querySelector('div div:nth-of-type(2) div.invalid-tooltip')!.textContent.trim())
      .toBe('Passwords do not match');
  })
});
