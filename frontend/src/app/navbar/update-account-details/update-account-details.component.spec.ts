import {ComponentFixture, TestBed} from '@angular/core/testing';

import {UpdateAccountDetailsComponent} from './update-account-details.component';
import {provideHttpClient} from '@angular/common/http';

describe('UpdateAccountDetailsComponent', () => {
  let component: UpdateAccountDetailsComponent;
  let fixture: ComponentFixture<UpdateAccountDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateAccountDetailsComponent],
      providers: [provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateAccountDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
