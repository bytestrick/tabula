import { TestBed } from '@angular/core/testing';

import { HomeMediatorService } from './home-mediator.service';

describe('HomeMediatorService', () => {
  let service: HomeMediatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HomeMediatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
