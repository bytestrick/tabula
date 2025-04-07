import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PageNotFoundComponent} from './page-not-found.component';
import {ActivatedRoute, Router} from '@angular/router';
import {By} from '@angular/platform-browser';

describe('PageNotFoundComponent', () => {
  let component: PageNotFoundComponent;
  let fixture: ComponentFixture<PageNotFoundComponent>;
  const url = '/the/sun/does/not/have/a/definite/boundary';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {provide: Router, useValue: {url}},
        {provide: ActivatedRoute, useValue: {}},
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PageNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should show the current url', () => {
    expect(fixture.debugElement.query(By.css('h5 span')).nativeElement.textContent).toBe(url);
  });
});
