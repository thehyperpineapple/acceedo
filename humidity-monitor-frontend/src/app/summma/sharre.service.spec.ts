import { TestBed } from '@angular/core/testing';

import { SharreService } from './sharre.service';

describe('SharreService', () => {
  let service: SharreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
