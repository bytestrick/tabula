import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTypesChooserComponent } from './data-types-chooser.component';

describe('DataTypesChooserComponent', () => {
  let component: DataTypesChooserComponent;
  let fixture: ComponentFixture<DataTypesChooserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTypesChooserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataTypesChooserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
