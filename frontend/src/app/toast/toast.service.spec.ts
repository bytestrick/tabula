import {TestBed} from '@angular/core/testing';

import {ToastService} from './toast.service';
import {ToastOptions} from './toast.component';

describe('ToastsService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [ToastService]});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => expect(service).toBeTruthy());

  it('should relay requests through the subject', () => {
    spyOn(service.subject, 'next');

    const toastOptions: ToastOptions = {
      title: 'Sun',
      body: 'The Sun is the star at the centre of the Solar System.',
      background: 'info',
      icon: 'sun',
      delay: 10000,
    };
    service.show(toastOptions);

    expect(service.subject.next).toHaveBeenCalledOnceWith(toastOptions);
  });

  it('offers a generic server error toast', () => {
    spyOn(service, 'show');

    const message = 'The Sun orbits the Galactic Center at a distance of 24,000 to 28,000 light-years.';
    const toastOptions: ToastOptions = {
      title: 'Server error',
      body: message,
      icon: 'exclamation-triangle-fill',
      background: 'danger',
    };
    service.serverError(message);
    expect(service.show).toHaveBeenCalledWith(toastOptions);
    expect(service.show).toHaveBeenCalledWith(jasmine.any(Object));

    const defaultMessage = 'Unknown server error';
    service.serverError('');
    expect(service.show).toHaveBeenCalledWith(jasmine.objectContaining({body: defaultMessage}));
    service.serverError();
    expect(service.show).toHaveBeenCalledWith(jasmine.objectContaining({body: defaultMessage}));

    expect(service.show).toHaveBeenCalledTimes(3);
  });
});
