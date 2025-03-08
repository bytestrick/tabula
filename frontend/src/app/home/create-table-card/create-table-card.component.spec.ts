import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTableCardComponent } from './create-table-card.component';

describe('CreateTableCardComponent', () => {
  let component: CreateTableCardComponent;
  let fixture: ComponentFixture<CreateTableCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTableCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateTableCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
