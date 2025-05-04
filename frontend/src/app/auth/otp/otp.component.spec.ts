import {ComponentFixture, TestBed} from '@angular/core/testing';

import {OtpComponent, Reason} from './otp.component';
import {Router} from '@angular/router';
import {ToastService} from '../../toast/toast.service';
import {provideHttpClient} from '@angular/common/http';
import {By} from '@angular/platform-browser';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {PasswordInputComponent} from '../password-input/password-input.component';
import {ErrorHandler} from '@angular/core';

describe('OtpComponent', () => {
  let component: OtpComponent;
  let fixture: ComponentFixture<OtpComponent>;
  let router: jasmine.SpyObj<Router>;
  let toast: jasmine.SpyObj<ToastService>;
  let mockLocalStorage: Storage;
  let otpData: { email: string, receiver: string, reason: Reason };
  let httpTestingController: HttpTestingController;
  let errorHandler: ErrorHandler;

  beforeEach(async () => {
    mockLocalStorage = jasmine.createSpyObj('localStorage', ['getItem', 'setItem', 'removeItem']);
    Object.defineProperty(window, 'localStorage', {value: mockLocalStorage});

    otpData = {email: 'test@example.com', receiver: 'test@example.com', reason: Reason.VerifyEmail};

    await TestBed.configureTestingModule({
      imports: [OtpComponent, PasswordInputComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: Router, useValue: {navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true))}},
        {provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['show', 'serverError'])},
        {provide: ErrorHandler, useValue: jasmine.createSpyObj('ErrorHandler', ['handleError'])},
      ]
    }).compileComponents();

    (mockLocalStorage.getItem as jasmine.Spy).withArgs('otpData').and.returnValue(JSON.stringify(otpData));

    fixture = TestBed.createComponent(OtpComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    toast = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    errorHandler = TestBed.inject(ErrorHandler) as ErrorHandler;
  });

  afterEach(() => httpTestingController.verify());

  it('should create', () => {
    expect(component).toBeTruthy();

    fixture.detectChanges();
    expect(localStorage.getItem).toHaveBeenCalledOnceWith('otpData');
    expect(fixture.debugElement.query(By.css('form h3')).nativeElement.textContent).toBe(otpData.reason);
    expect(fixture.debugElement.query(By.css('form h5 span')).nativeElement.textContent).toBe(otpData.email);
  });

  it('deflects invalid accesses', () => {
    spyOn(console, 'error');
    (mockLocalStorage.getItem as jasmine.Spy).withArgs('otpData').and.returnValue(null);
    fixture.detectChanges();
    expect(console.error).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/sign-in'])
  });

  it('should resend the OTP', () => {
    fixture.detectChanges();
    const resendOtpButton = fixture.debugElement.query(By.css('button.btn-secondary')).nativeElement;

    resendOtpButton.click();
    const req = httpTestingController.expectOne('/auth/send-otp');
    expect(req.request.body).toEqual(otpData);
    req.flush({});
    expect(toast.show).toHaveBeenCalledOnceWith(jasmine.objectContaining({title: 'Code resent'}));

    resendOtpButton.click();
    httpTestingController.expectOne('/auth/send-otp')
      .flush({message: 'test error message'}, {status: 400, statusText: ''});
    expect(toast.serverError).toHaveBeenCalledOnceWith('test error message');
  });

  it('should verify the user email with an OTP', () => {
    fixture.detectChanges();
    const form = fixture.nativeElement.querySelector('form');
    const otpInput = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    otpInput.value = '000000';
    otpInput.dispatchEvent(new Event('input'));

    form.dispatchEvent(new Event('submit'));

    const req = httpTestingController.expectOne('/auth/verify-email-otp');
    expect(req.request.body).toEqual({email: otpData.email, otp: '000000'});
    req.flush({});
    expect(toast.show).toHaveBeenCalledOnceWith(jasmine.objectContaining({title: 'Account verified'}));
    expect(localStorage.removeItem).toHaveBeenCalledOnceWith('otpData');
    expect(router.navigate).toHaveBeenCalledOnceWith(['/sign-in']);

    form.dispatchEvent(new Event('submit'));
    httpTestingController.expectOne('/auth/verify-email-otp')
      .flush({message: 'Not found'}, {status: 400, statusText: ''});
    expect(toast.show).toHaveBeenCalledWith(jasmine.objectContaining({title: 'There are no outstanding codes for that email'}))
  });

  it('should reset the user password trough an OTP', () => {
    // initialize
    otpData = {email: 'damocle@example.com', receiver: 'damocle@example.com', reason: Reason.ResetPassword};
    (mockLocalStorage.getItem as jasmine.Spy).withArgs('otpData').and.returnValue(JSON.stringify(otpData));
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('form h3')).nativeElement.textContent).toBe(otpData.reason);
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;

    // step one: provide and verify the OTP
    const inputAndSubmitCode = () => {
      const otpInput = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      otpInput.value = '000000';
      otpInput.dispatchEvent(new Event('input'));
      form.dispatchEvent(new Event('submit'));
    };

    // step one: error handling
    inputAndSubmitCode();
    httpTestingController.expectOne('/auth/verify-reset-password-otp')
      .flush({message: 'Expired'}, {status: 400, statusText: ''});
    expect(toast.show).toHaveBeenCalledOnceWith(jasmine.objectContaining({title: 'Code expired'}));

    // step one: success path
    inputAndSubmitCode();
    const req = httpTestingController.expectOne('/auth/verify-reset-password-otp');
    expect(req.request.body).toEqual({email: otpData.email, otp: '000000'});
    req.flush({});

    // step two: provide and submit the new password
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('tbl-password-input'))).toBeTruthy();

    const password = 'f923#L4vof-1';
    const [pass, confirm] = [fixture.nativeElement.querySelector('#pass'), fixture.nativeElement.querySelector('#confirm')];
    const submitNewPassword = () => {
      pass.value = password;
      confirm.value = password;
      pass.dispatchEvent(new Event('input'));
      confirm.dispatchEvent(new Event('input'));
      form.dispatchEvent(new Event('submit'));
    };
    submitNewPassword();

    const req2 = httpTestingController.expectOne('/auth/reset-password');
    expect(req2.request.body).toEqual({email: otpData.email, newPassword: password, otp: '000000'});
    req2.flush({});

    expect(toast.show).toHaveBeenCalledWith(jasmine.objectContaining({title: 'Password reset successfully'}));
    expect(localStorage.removeItem).toHaveBeenCalledOnceWith('otpData');
    expect(router.navigate).toHaveBeenCalledOnceWith(['/sign-in']);

    // step two, error handling
    submitNewPassword();
    httpTestingController.expectOne('/auth/reset-password').flush({message: 'test495'}, {status: 400, statusText: ''});
    expect(toast.serverError).toHaveBeenCalledOnceWith('test495');
  });

  it('should exhaustively check the reason value', async () => {
    otpData = {email: 'test@example.com', receiver: 'test@example.com', reason: 'Driving cars' as Reason};
    (mockLocalStorage.getItem as jasmine.Spy).withArgs('otpData').and.returnValue(JSON.stringify(otpData));
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(errorHandler.handleError).toHaveBeenCalledOnceWith(new Error('Invalid reason: Driving cars'));
  });

  it('should handle all errors for an invalid OTP', () => {
    fixture.detectChanges();

    const otpInput = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const submitOtp = () => {
      otpInput.value = '000000';
      otpInput.dispatchEvent(new Event('input'));
      const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));
    };

    submitOtp();
    httpTestingController.expectOne('/auth/verify-email-otp')
      .flush({message: 'Expired'}, {status: 400, statusText: ''});
    expect(toast.show).toHaveBeenCalledOnceWith(jasmine.objectContaining({title: 'Code expired'}));
    fixture.detectChanges();
    expect(otpInput.nextSibling!.textContent?.trim()).toBe('Code expired');

    submitOtp();
    httpTestingController.expectOne('/auth/verify-email-otp')
      .flush({message: 'Not found'}, {status: 400, statusText: ''});
    expect(toast.show)
      .toHaveBeenCalledWith(jasmine.objectContaining({title: 'There are no outstanding codes for that email'}));

    submitOtp();
    httpTestingController.expectOne('/auth/verify-email-otp')
      .flush({message: 'Incorrect'}, {status: 400, statusText: ''});
    fixture.detectChanges();
    expect(otpInput.nextSibling!.textContent?.trim()).toBe('Incorrect code');

    submitOtp();
    httpTestingController.expectOne('/auth/verify-email-otp')
      .flush({message: '4830214837'}, {status: 400, statusText: ''});
    expect(toast.serverError).toHaveBeenCalledWith('4830214837');
  });
});
