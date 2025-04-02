import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoublePassInputComponent } from './double-pass-input.component';

describe('DoublePassInputComponent', () => {
  let component: DoublePassInputComponent;
  let fixture: ComponentFixture<DoublePassInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoublePassInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoublePassInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
