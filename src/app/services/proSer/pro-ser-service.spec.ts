import { TestBed } from '@angular/core/testing';

import { ProSerService } from './pro-ser-service';

describe('ProSerService', () => {
  let service: ProSerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProSerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
