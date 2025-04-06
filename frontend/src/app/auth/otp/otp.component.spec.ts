import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpComponent } from './otp.component';
import {Router} from '@angular/router';
import {ToastService} from '../../toast/toast.service';
import {HttpClient} from '@angular/common/http';

const mockHttpClient = {
  post: jasmine.createSpy('post').and.returnValue({}),
};

const mockRouter = {
  navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true))
}

const mockToastService = {
  show: jasmine.createSpy('show'),
};

describe('OtpComponent', () => {
  let component: OtpComponent;
  let fixture: ComponentFixture<OtpComponent>;
  let httpClient: jasmine.SpyObj<HttpClient>;
  let router: jasmine.SpyObj<Router>;
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtpComponent],
      providers: [
        {provide: Router, useValue: mockRouter},
        {provide: ToastService, useValue: mockToastService},
        {provide: HttpClient, useValue: mockHttpClient}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OtpComponent);
    component = fixture.componentInstance;
    httpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
    toast = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
