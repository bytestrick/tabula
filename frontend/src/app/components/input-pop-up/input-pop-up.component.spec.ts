import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputPopUpComponent } from './input-pop-up.component';

describe('PopUpComponent', () => {
  let component: InputPopUpComponent;
  let fixture: ComponentFixture<InputPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputPopUpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
