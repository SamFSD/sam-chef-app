import { TestBed } from '@angular/core/testing';

import { TabulatorTableService } from './tabulator-table.service';

describe('TabulatorTableService', () => {
  let service: TabulatorTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TabulatorTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
