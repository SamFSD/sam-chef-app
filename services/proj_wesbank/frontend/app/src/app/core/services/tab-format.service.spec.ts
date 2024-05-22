import { TestBed } from '@angular/core/testing';

import { TabFormatService } from './tab-format.service';

describe('TabFormatService', () => {
  let service: TabFormatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TabFormatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
