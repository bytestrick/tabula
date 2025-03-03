import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextualCellComponent } from './textual-cell.component';

describe('TextualCellComponent', () => {
  let component: TextualCellComponent;
  let fixture: ComponentFixture<TextualCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextualCellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextualCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
