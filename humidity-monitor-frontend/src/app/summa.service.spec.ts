import { TestBed } from '@angular/core/testing';

import { SummaService } from './summa.service';

describe('SummaService', () => {
  let service: SummaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SummaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
