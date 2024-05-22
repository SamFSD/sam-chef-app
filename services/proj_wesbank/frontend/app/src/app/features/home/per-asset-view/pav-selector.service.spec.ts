import { TestBed } from '@angular/core/testing';

import { PavSelectorService } from './pav-selector.service';

describe('PavSelectorService', () => {
  let service: PavSelectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PavSelectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
