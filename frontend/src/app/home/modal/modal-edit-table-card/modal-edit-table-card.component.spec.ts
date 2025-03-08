import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditTableCardComponent } from './modal-edit-table-card.component';

describe('ModalEditTableCardComponent', () => {
  let component: ModalEditTableCardComponent;
  let fixture: ComponentFixture<ModalEditTableCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalEditTableCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalEditTableCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
