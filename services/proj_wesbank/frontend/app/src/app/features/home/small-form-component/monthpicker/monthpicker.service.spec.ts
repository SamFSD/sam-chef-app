import { TestBed } from '@angular/core/testing';

import { MonthpickerService } from './monthpicker.service';

describe('MonthpickerService', () => {
  let service: MonthpickerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonthpickerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
