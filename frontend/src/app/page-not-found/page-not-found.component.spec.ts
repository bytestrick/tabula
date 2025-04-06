import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PageNotFoundComponent} from './page-not-found.component';
import {ActivatedRoute, Router} from '@angular/router';

const mockRouter = {
  url: ''
};

const mockActivatedRoute = {};

describe('PageNotFoundComponent', () => {
  let component: PageNotFoundComponent;
  let fixture: ComponentFixture<PageNotFoundComponent>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {provide: Router, useValue: mockRouter},
        {provide: ActivatedRoute, useValue: mockActivatedRoute}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PageNotFoundComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
  });

  it('should create', () => expect(component).toBeTruthy());
});
