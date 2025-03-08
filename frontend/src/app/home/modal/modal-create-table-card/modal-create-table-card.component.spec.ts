import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCreateTableCardComponent } from './modal-create-table-card.component';

describe('ModalCreateTableCardComponent', () => {
  let component: ModalCreateTableCardComponent;
  let fixture: ComponentFixture<ModalCreateTableCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalCreateTableCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalCreateTableCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
