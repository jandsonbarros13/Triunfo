import { TestBed } from '@angular/core/testing';

import { BobinaService } from './bobina.service';

describe('BobinaService', () => {
  let service: BobinaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BobinaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
